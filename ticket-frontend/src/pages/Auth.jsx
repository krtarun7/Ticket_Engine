import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // FastAPI OAuth2PasswordRequestForm expects URL-encoded form data
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await apiClient.post('/auth/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        localStorage.setItem('access_token', response.data.access_token);
        navigate('/events');
      } else {
        // Signup
        await apiClient.post('/auth/signup', { email, password });
        alert('Account created successfully! Please log in.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#1e293b', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', border: '1px solid #334155' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#f8fafc' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginBottom: '30px' }}>
          {isLogin ? 'Enter your credentials to access events' : 'Sign up to start booking tickets'}
        </p>

        {error && <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#cbd5e1' }}>Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: 'white', fontSize: '16px' }}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#cbd5e1' }}>Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: 'white', fontSize: '16px' }}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '14px' }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}