import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { moviesAPI, cinemasAPI, eventsAPI } from '../services/api';
import { toast } from 'react-toastify';

const MovieContext = createContext();

const initialState = {
  movies: [],
  cinemas: [],
  events: [],
  currentMovie: null,
  isLoading: false,
  error: null,
};

const movieReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_MOVIES':
      return { ...state, movies: action.payload, isLoading: false };
    case 'SET_CINEMAS':
      return { ...state, cinemas: action.payload, isLoading: false };
    case 'SET_EVENTS':
      return { ...state, events: action.payload, isLoading: false };
    case 'SET_CURRENT_MOVIE':
      return { ...state, currentMovie: action.payload, isLoading: false };
    case 'ADD_MOVIE':
      return { ...state, movies: [...state.movies, action.payload] };
    case 'UPDATE_MOVIE':
      return {
        ...state,
        movies: state.movies.map(movie =>
          movie.movieId === action.payload.movieId ? action.payload : movie
        ),
      };
    case 'DELETE_MOVIE':
      return {
        ...state,
        movies: state.movies.filter(movie => movie.movieId !== action.payload),
      };
    default:
      return state;
  }
};

export const MovieProvider = ({ children }) => {
  const [state, dispatch] = useReducer(movieReducer, initialState);

  // Fetch all movies
  const fetchMovies = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await moviesAPI.getAll();
      dispatch({ type: 'SET_MOVIES', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to fetch movies');
    }
  };

  // Fetch all cinemas
  const fetchCinemas = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cinemasAPI.getAll();
      console.log('MovieContext - Cinema API Response:', response);
      
      // Handle different response formats
      let cinemasData = [];
      if (response.data) {
        // If wrapped in data property
        if (Array.isArray(response.data)) {
          cinemasData = response.data;
        } else if (Array.isArray(response.data.data)) {
          cinemasData = response.data.data;
        }
      } else if (Array.isArray(response)) {
        // If direct array response
        cinemasData = response;
      }
      
      console.log('MovieContext - Final cinemas data:', cinemasData);
      dispatch({ type: 'SET_CINEMAS', payload: cinemasData });
    } catch (error) {
      console.error('MovieContext - Error fetching cinemas:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_CINEMAS', payload: [] }); // Fallback to empty array
      toast.error('Failed to fetch cinemas');
    }
  }, []);

  // Fetch cinema by ID
  const fetchCinemaById = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cinemasAPI.getById(id);
      return response.data || response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to fetch cinema details');
      return null;
    }
  }, []);

  // Create cinema
  const createCinema = async (cinemaData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cinemasAPI.create(cinemaData);
      toast.success('Cinema created successfully');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to create cinema');
      return { success: false, error: error.message };
    }
  };

  // Update cinema
  const updateCinema = async (id, cinemaData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cinemasAPI.update(id, cinemaData);
      toast.success('Cinema updated successfully');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to update cinema');
      return { success: false, error: error.message };
    }
  };

  // Delete cinema
  const deleteCinema = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cinemasAPI.delete(id);
      toast.success('Cinema deleted successfully');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to delete cinema');
      return { success: false, error: error.message };
    }
  };

  // Fetch all events
  const fetchEvents = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Temporarily disabled to fix error
      // const response = await eventsAPI.getAll();
      // dispatch({ type: 'SET_EVENTS', payload: response.data });
      dispatch({ type: 'SET_EVENTS', payload: [] }); // Set empty array for now
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to fetch events');
    }
  };

  // Fetch movie by ID
  const fetchMovieById = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await moviesAPI.getById(id);
      dispatch({ type: 'SET_CURRENT_MOVIE', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to fetch movie details');
      return null;
    }
  }, []);

  // Create movie
  const createMovie = async (movieData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await moviesAPI.create(movieData);
      dispatch({ type: 'ADD_MOVIE', payload: response.data });
      toast.success('Movie created successfully');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to create movie');
      return { success: false, error: error.message };
    }
  };

  // Update movie
  const updateMovie = async (id, movieData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await moviesAPI.update(id, movieData);
      dispatch({ type: 'UPDATE_MOVIE', payload: response.data });
      toast.success('Movie updated successfully');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to update movie');
      return { success: false, error: error.message };
    }
  };

  // Delete movie
  const deleteMovie = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await moviesAPI.delete(id);
      dispatch({ type: 'DELETE_MOVIE', payload: id });
      toast.success('Movie deleted successfully');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to delete movie');
      return { success: false, error: error.message };
    }
  };

  // Get movies by genre
  const getMoviesByGenre = (genre) => {
    return state.movies.filter(movie => 
      movie.genre?.toLowerCase().includes(genre.toLowerCase())
    );
  };

  // Get featured movies (you can customize this logic)
  const getFeaturedMovies = () => {
    return state.movies.filter(movie => movie.status === 'Active').slice(0, 6);
  };

  // Get upcoming movies
  const getUpcomingMovies = () => {
    return state.movies.filter(movie => movie.status === 'Inactive');
  };

  // Load initial data
  useEffect(() => {
    fetchMovies();
    fetchCinemas();
    // fetchEvents(); // Temporarily disabled to fix error
  }, []);

  const value = {
    ...state,
    fetchMovies,
    fetchCinemas,
    fetchCinemaById,
    createCinema,
    updateCinema,
    deleteCinema,
    fetchEvents,
    fetchMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    getMoviesByGenre,
    getFeaturedMovies,
    getUpcomingMovies,
  };

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};