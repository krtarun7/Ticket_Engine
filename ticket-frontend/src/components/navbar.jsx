import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/auth');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: '#1e293b', borderBottom: '1px solid #334155', marginBottom: '30px' }}>
      <h2 style={{ margin: 0, color: '#f8fafc', cursor: 'pointer' }} onClick={() => navigate('/events')}>
        TicketEngine
      </h2>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/events')}
          style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          Events
        </button>
        <button 
          onClick={() => navigate('/my-bookings')}
          style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          My Bookings
        </button>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}