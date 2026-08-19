import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.models import Event, Seat, User, Booking, BookingStatus
from app.schemas.event import EventCreate, EventResponse
from app.schemas.seat import SeatResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_in: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    # 1. Create the Event
    new_event = Event(**event_in.model_dump())
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)
    
    # 2. Automatically generate 50 seats for this event
    seats = [
        Seat(event_id=new_event.id, seat_number=f"Row-A-{i}", price=150.0) 
        for i in range(1, 51)
    ]
    db.add_all(seats)
    await db.commit()
    
    return new_event

@router.get("/{event_id}/seats/available", response_model=list[SeatResponse])
async def get_available_seats(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    # Query: Find all seats for this event where no active booking exists
    query = select(Seat).outerjoin(
        Booking, 
        (Seat.id == Booking.seat_id) & 
        (Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]))
    ).where(
        Seat.event_id == event_id,
        Booking.id.is_(None) # This ensures we only get seats without an active booking
    )
    
    result = await db.execute(query)
    available_seats = result.scalars().all()
    
    if not available_seats:
        raise HTTPException(status_code=404, detail="No available seats found for this event")
        
    return available_seats