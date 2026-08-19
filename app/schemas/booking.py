import uuid
from pydantic import BaseModel
from app.models.models import BookingStatus

class BookingCreate(BaseModel):
    seat_id: uuid.UUID

class BookingResponse(BaseModel):
    id: uuid.UUID
    seat_id: uuid.UUID
    status: BookingStatus
    
    class Config:
        from_attributes = True