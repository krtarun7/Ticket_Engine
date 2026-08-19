import uuid
from pydantic import BaseModel

class SeatResponse(BaseModel):
    id: uuid.UUID
    seat_number: str
    price: float

    class Config:
        from_attributes = True