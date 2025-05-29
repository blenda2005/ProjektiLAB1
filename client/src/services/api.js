import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// Movies API
export const moviesAPI = {
  getAll: () => api.get('/movies'),
  getById: (id) => api.get(`/movies/${id}`),
  create: (movieData) => api.post('/movies', movieData),
  update: (id, movieData) => api.put(`/movies/${id}`, movieData),
  delete: (id) => api.delete(`/movies/${id}`),
};

// Cinemas API
export const cinemasAPI = {
  getAll: () => api.get('/cinemas'),
  getById: (id) => api.get(`/cinemas/${id}`),
  create: (cinemaData) => api.post('/cinemas', cinemaData),
  update: (id, cinemaData) => api.put(`/cinemas/${id}`, cinemaData),
  delete: (id) => api.delete(`/cinemas/${id}`),
};



// Halls API
export const hallsAPI = {
  getAll: () => api.get('/halls'),
  getById: (id) => api.get(`/halls/${id}`),
  create: (hallData) => api.post('/halls', hallData),
  update: (id, hallData) => api.put(`/halls/${id}`, hallData),
  delete: (id) => api.delete(`/halls/${id}`),
};

// Reservations API
export const reservationsAPI = {
  getAll: () => api.get('/reservations'),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (reservationData) => api.post('/reservations', reservationData),
  update: (id, reservationData) => api.put(`/reservations/${id}`, reservationData),
  delete: (id) => api.delete(`/reservations/${id}`),
  getByUser: (userId) => api.get(`/reservations/user/${userId}`),
};

// Events API (still uses /schedules backend endpoints)
export const eventsAPI = {
  getAll: () => api.get('/schedules'),
  getById: (id) => api.get(`/schedules/${id}`),
  create: (eventData) => api.post('/schedules', eventData),
  update: (id, eventData) => api.put(`/schedules/${id}`, eventData),
  delete: (id) => api.delete(`/schedules/${id}`),
};

// Tickets API
export const ticketsAPI = {
  getAll: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (ticketData) => api.post('/tickets', ticketData),
  update: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  delete: (id) => api.delete(`/tickets/${id}`),
};

// Discounts API
export const discountsAPI = {
  getAll: () => api.get('/discounts'),
  getById: (id) => api.get(`/discounts/${id}`),
  create: (discountData) => api.post('/discounts', discountData),
  update: (id, discountData) => api.put(`/discounts/${id}`, discountData),
  delete: (id) => api.delete(`/discounts/${id}`),
};

export default api;