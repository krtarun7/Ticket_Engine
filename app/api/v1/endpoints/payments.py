import uuid
from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.db.session import get_db
from app.models.models import Booking, Seat, BookingStatus, SeatStatus, User
from app.core.payment import create_order, verify_signature
from app.core.qr_service import generate_ticket_qr
from app.core.email_service import send_ticket_confirmation_email

router = APIRouter()

class CreatePaymentRequest(BaseModel):
    seat_id: uuid.UUID
    user_id: uuid.UUID
    amount: int

class VerifyPaymentRequest(BaseModel):
    seat_id: uuid.UUID
    user_id: uuid.UUID
    event_id: uuid.UUID
    amount: float
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.post("/checkout")
async def initiate_checkout(
    payload: CreatePaymentRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Validates that a PENDING booking exists for this user before generating a Razorpay order.
    """
    result = await db.execute(select(Booking).where(Booking.seat_id == payload.seat_id))
    booking = result.scalar_one_or_none()

    if not booking or booking.user_id != payload.user_id or booking.status != BookingStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending booking found for this seat. Please book the seat first."
        )

    order = create_order(
        amount_in_rupees=payload.amount,
        receipt_id=f"seat_{str(payload.seat_id)[:8]}"
    )

    return {
        "status": "order_created",
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "seat_id": payload.seat_id
    }

@router.post("/verify")
async def confirm_payment_and_booking(
    payload: VerifyPaymentRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Verifies payment, updates the booking to CONFIRMED, generates QR, and triggers email.
    """
    # 1. Verify Cryptographic Signature
    is_valid = verify_signature(
        order_id=payload.razorpay_order_id,
        payment_id=payload.razorpay_payment_id,
        signature=payload.razorpay_signature
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature."
        )

    # 2. Fetch Existing Pending Booking
    booking_result = await db.execute(select(Booking).where(Booking.seat_id == payload.seat_id))
    booking = booking_result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    ticket_identifier = f"TICK-{uuid.uuid4().hex[:8].upper()}"

    # 3. Generate QR Code E-Ticket
    qr_data = generate_ticket_qr(
        ticket_id=ticket_identifier,
        event_id=payload.event_id,
        user_id=payload.user_id
    )

    # 4. Update Booking to CONFIRMED
    booking.status = BookingStatus.CONFIRMED
    booking.payment_id = payload.razorpay_payment_id
    booking.ticket_code = ticket_identifier

    # 5. Mark seat as BOOKED
    await db.execute(
        update(Seat).where(Seat.id == payload.seat_id).values(status=SeatStatus.BOOKED)
    )
    await db.commit()

    # 6. Fetch User & Send Background Email
    user_result = await db.execute(select(User).where(User.id == payload.user_id))
    user = user_result.scalar_one_or_none()

    if user:
        background_tasks.add_task(
            send_ticket_confirmation_email,
            recipient_email=user.email,
            ticket_code=ticket_identifier,
            seat_id=str(payload.seat_id)
        )

    return {
        "status": "confirmed",
        "ticket_code": ticket_identifier,
        "payment_id": payload.razorpay_payment_id,
        "qr_code": qr_data["qr_code_base64"],
        "message": "Payment successful. E-Ticket dispatched to email."
    }