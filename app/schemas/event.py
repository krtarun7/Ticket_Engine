import uuid
from datetime import datetime
from pydantic import BaseModel

class EventCreate(BaseModel):
    title: str
    venue: str
    start_time: datetime
    end_time: datetime

class EventResponse(EventCreate):
    id: uuid.UUID

    class Config:
        from_attributes = True