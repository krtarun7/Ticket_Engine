from dotenv import load_dotenv
load_dotenv()  # <-- This must run first to load your .env file into memory!

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, events, bookings, payments

app = FastAPI(
    title="Event Ticketing & Concurrency Engine API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Mount all API v1 routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(events.router, prefix="/api/v1/events", tags=["Events"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["Bookings"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])

@app.get("/", tags=["Health Check"])
def read_root():
    return {
        "status": "online",
        "message": "Welcome to the Event Ticketing API",
        "docs": "/docs"
    }