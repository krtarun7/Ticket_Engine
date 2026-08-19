from fastapi import FastAPI
from app.api.v1.endpoints import auth, events, bookings

app = FastAPI(title="Event Ticketing API")

# Mount all routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(events.router, prefix="/api/v1/events", tags=["Events"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["Bookings"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Event Ticketing API"}