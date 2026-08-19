import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import redis.asyncio as redis

from app.db.session import get_db
from app.api.deps import get_current_user, get_redis
from app.models.models import Booking, User, BookingStatus
from app.schemas.booking import BookingCreate, BookingResponse

router = APIRouter()

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_in: BookingCreate,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    current_user: User = Depends(get_current_user)
):
    # 1. Create a unique lock key for this specific seat
    lock_key = f"seat_lock_{booking_in.seat_id}"
    
    # 2. Try to acquire the Redis lock (expires in 10 seconds to prevent deadlocks)
    acquired = await redis_client.set(lock_key, "locked", nx=True, ex=10)
    if not acquired:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Seat is currently being booked by someone else. Please try again."
        )
        
    try:
        # 3. Check if the seat is already booked in PostgreSQL
        booking_result = await db.execute(
            select(Booking).where(Booking.seat_id == booking_in.seat_id)
        )
        existing_booking = booking_result.scalar_one_or_none()
        
        if existing_booking and existing_booking.status in [BookingStatus.CONFIRMED, BookingStatus.PENDING]:
            raise HTTPException(status_code=400, detail="Seat is already booked")

        # 4. Create the new booking
        new_booking = Booking(
            user_id=current_user.id,
            seat_id=booking_in.seat_id,
            status=BookingStatus.PENDING,
            idempotency_key=str(uuid.uuid4()), 
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
        )
        db.add(new_booking)
        await db.commit()
        await db.refresh(new_booking)
        
        return new_booking
    finally:
        # 5. Always release the Redis lock, even if an error occurs!
        await redis_client.delete(lock_key)