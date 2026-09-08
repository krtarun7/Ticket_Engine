import os
import razorpay
from fastapi import HTTPException, status

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_placeholder")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "secret_placeholder")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def create_order(amount_in_rupees: int, receipt_id: str) -> dict:
    """
    Creates an order on Razorpay.
    Amount must be converted to paise (1 INR = 100 paise).
    """
    try:
        data = {
            "amount": amount_in_rupees * 100,
            "currency": "INR",
            "receipt": receipt_id,
            "payment_capture": 1
        }
        return client.order.create(data=data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Razorpay order creation failed: {str(e)}"
        )

def verify_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """
    Cryptographically verifies the Razorpay payment signature.
    """
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        })
        return True
    except razorpay.errors.SignatureVerificationError:
        return False