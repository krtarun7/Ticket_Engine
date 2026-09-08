import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import Navbar from '../components/navbar.jsx';

export default function SeatSelection() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locking, setLocking] = useState(false);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await apiClient.get(`/events/${eventId}/seats/available`);
        setSeats(response.data);
      } catch (err) {
        setError('Could not load seats or all seats are sold out!');
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [eventId]);

  const handleSeatClick = async (seat) => {
    setLocking(true);
    setError('');
    
    try {
      await apiClient.post('/bookings/', {
        seat_id: seat.id,
      });
      
      // Navigate passing both eventId and seatId in the URL path
      navigate(`/checkout/${eventId}/${seat.id}`);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to lock seat. Someone else might have just grabbed it!');
      
      const response = await apiClient.get(`/events/${eventId}/seats/available`);
      setSeats(response.data);
    } finally {
      setLocking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc' }}>
        <Navbar />
        <h2 style={{ textAlign: 'center', marginTop: '100px' }}>Loading seats...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', paddingBottom: '50px' }}>
      <Navbar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <button 
          onClick={() => navigate('/events')} 
          style={{ marginBottom: '20px', padding: '8px 16px', background: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Back to Events
        </button>

        <h2>Select a Seat</h2>
        {error && <p style={{ color: '#fca5a5', fontWeight: 'bold' }}>{error}</p>}
        {locking && <p style={{ color: '#facc15' }}>Securing your seat with Redis lock...</p>}

        {seats.length === 0 ? (
          <div style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', textAlign: 'center', marginTop: '20px', border: '1px solid #334155' }}>
            <p style={{ color: '#94a3b8' }}>No seats available for this event right now.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '15px', 
            marginTop: '20px' 
          }}>
            {seats.map((seat) => (
              <button 
                key={seat.id}
                disabled={locking}
                onClick={() => handleSeatClick(seat)}
                style={{
                  padding: '20px 10px',
                  backgroundColor: '#22c55e', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: locking ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {seat.seat_number}
                <div style={{ fontSize: '12px', marginTop: '5px' }}>₹{seat.price}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}