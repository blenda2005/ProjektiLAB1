import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { MovieProvider } from './context/MovieContext';

// Components
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';


// Admin Pages
import AdminMovies from './pages/Admin/AdminMovies';


function App() {
  return (
    <MovieProvider>
      <Router>
        <div className="App min-h-screen bg-dark-900 text-gray-100">
          <Navbar />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movies/:id" element={<MovieDetailPage />} />
              <Route path="/admin/movies" element={<AdminMovies />} />
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
  );
}

export default App;