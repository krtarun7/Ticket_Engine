import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import Navbar from '../components/navbar.jsx';

const getUserIdFromToken = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64)).user_id || JSON.parse(window.atob(base64)).sub;
  } catch (err) {
    return null;
  }
};

export default function Checkout() {
  const { eventId, seatId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    const userId = getUserIdFromToken();
    if (!userId) {
      setError('User session expired. Please log in again.');
      setLoading(false);
      return;
    }
    
    try {
      // 1. Send all fields required by CreatePaymentRequest
      const orderResponse = await apiClient.post('/payments/checkout', {
        seat_id: seatId,
        user_id: userId,
        amount: 150
      });
      
      const { order_id, amount, currency } = orderResponse.data;

      const options = {
        key: 'rzp_test_TU1URSV4sashbK',
        amount: amount,
        currency: currency,
        name: 'Event Ticketing Engine',
        description: 'Seat Booking Payment',
        order_id: order_id,
        handler: async function (response) {
          try {
            // 2. Send all fields required by VerifyPaymentRequest
            await apiClient.post('/payments/verify', {
              seat_id: seatId,
              user_id: userId,
              event_id: eventId,
              amount: 150.0,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            alert('Payment Successful! Your ticket is confirmed.');
            navigate('/my-bookings');
          } catch (err) {
            setError(err.response?.data?.detail || 'Payment verification failed!');
          }
        },
        theme: {
          color: '#22c55e'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setError(err.response?.data?.detail || 'Could not initiate checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', paddingBottom: '50px' }}>
      <Navbar />

      <div style={{ maxWidth: '500px', margin: '40px auto', padding: '30px', textAlign: 'center', border: '1px solid #334155', borderRadius: '12px', background: '#1e293b' }}>
        <h2>Complete Your Booking</h2>
        <p style={{ color: '#94a3b8', marginBottom: '25px' }}>Your seat is locked! Please complete the payment to generate your QR ticket.</p>
        
        {error && <p style={{ color: '#fca5a5', fontWeight: 'bold', marginBottom: '15px' }}>{error}</p>}
        
        <button 
          onClick={handlePayment} 
          disabled={loading}
          style={{ padding: '15px 30px', fontSize: '18px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}
        >
          {loading ? 'Processing...' : 'Pay ₹150 Now'}
        </button>
      </div>
    </div>
  );
}