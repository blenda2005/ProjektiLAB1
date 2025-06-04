import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { MovieProvider } from './context/MovieContext';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import CinemasPage from './pages/CinemasPage';
import EventsPage from './pages/EventsPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminMovies from './pages/Admin/AdminMovies';
import AdminCinemas from './pages/Admin/AdminCinemas';
import AdminEvents from './pages/Admin/AdminEvents';
import AdminReservations from './pages/Admin/AdminReservations';

function App() {
  return (
    <AuthProvider>
      <MovieProvider>
        <Router>
          <div className="App min-h-screen bg-dark-900 text-gray-100">
            <Navbar />
            <main className="min-h-screen">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/movies/:id" element={<MovieDetailPage />} />
                <Route path="/cinemas" element={<CinemasPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected Routes */}
                <Route path="/booking/:id" element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/movies" element={
                  <ProtectedRoute adminOnly>
                    <AdminMovies />
                  </ProtectedRoute>
                } />
                <Route path="/admin/cinemas" element={
                  <ProtectedRoute adminOnly>
                    <AdminCinemas />
                  </ProtectedRoute>
                } />
                <Route path="/admin/events" element={
                  <ProtectedRoute adminOnly>
                    <AdminEvents />
                  </ProtectedRoute>
                } />
                <Route path="/admin/reservations" element={
                  <ProtectedRoute adminOnly>
                    <AdminReservations />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
            
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
          </div>
        </Router>
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;