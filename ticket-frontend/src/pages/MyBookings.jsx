import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import Navbar from '../components/navbar.jsx';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await apiClient.get('/bookings/my-bookings');
        setBookings(response.data);
      } catch (err) {
        setError('Failed to load your bookings.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc' }}>
        <Navbar />
        <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Loading your tickets...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', paddingBottom: '50px' }}>
      <Navbar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <h2>My Bookings & Orders</h2>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Manage your pending locks and confirmed tickets.</p>

        {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {bookings.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>You have no active bookings.</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} style={{ background: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0' }}><strong>Seat ID:</strong> {booking.seat_id}</p>
                  <p style={{ margin: 0 }}><strong>Status:</strong> <span style={{ color: booking.status === 'CONFIRMED' ? '#4ade80' : '#facc15', fontWeight: 'bold' }}>{booking.status}</span></p>
                  {booking.ticket_code && <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>Ticket Code: {booking.ticket_code}</p>}
                </div>

                {booking.status === 'PENDING' && (
                  <button 
                    onClick={() => navigate(`/checkout/${booking.event_id}/${booking.seat_id}`)}
                    style={{ padding: '10px 20px', backgroundColor: '#eab308', color: '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Complete Payment
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}