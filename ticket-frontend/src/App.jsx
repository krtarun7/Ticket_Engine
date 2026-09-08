import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import EventList from './pages/EventList';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import MyBookings from './pages/MyBookings'; // <-- 1. Import MyBookings

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        
        {/* Authentication Page */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Events Dashboard */}
        <Route path="/events" element={<EventList />} />
        
        {/* Seat Selection */}
        <Route path="/events/:eventId/seats" element={<SeatSelection />} />

        {/* Checkout Flow */}
        <Route path="/checkout/:eventId/:seatId" element={<Checkout />} />

        {/* My Bookings & Tickets Page */}
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;