import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import Navbar from '../components/navbar.jsx';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get('/events/');
        setEvents(response.data);
      } catch (err) {
        setError('Failed to load events.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Loading events...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'f8fafc', paddingBottom: '50px' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <h1 style={{ marginBottom: '10px' }}>Explore Events</h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Select an event to view available seats and lock your spot.</p>

        {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {events.map((event) => (
            <div key={event.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0', color: '#f8fafc' }}>{event.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px 0' }}>{event.description}</p>
              </div>
              <button 
                onClick={() => navigate(`/events/${event.id}/seats`)}
                style={{ padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                View Seats & Book
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}