import React, { useEffect, useState } from 'react';
import { eventsAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventsAPI.getAllActive(); // Supozojmë që API të kthen të gjitha eventet aktive
      if (response?.data) {
        setEvents(response.data);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching active events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="spinner"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 text-white">
        <p>No active events at the moment. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
  <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <h1 className="text-4xl font-bold mb-10 text-primary-400">Upcoming Events</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {events.map(event => (
        <div
          key={event.eventId}
          className="bg-dark-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
 >
              <div
       className="h-60 bg-cover bg-center"
       style={{ backgroundImage: `url(${event.posterPath})` }}
       alt={event.title}
  />
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2 text-primary-300">{event.title}</h2>
        <p className="text-gray-400 mb-4 line-clamp-3">{event.description}</p>
        <p className="mb-2">
          <strong>Date:</strong> {new Date(event.date).toLocaleDateString()} at {event.time}
        </p>
        <p className="mb-4">
          <strong>Status:</strong> {event.status}
                </p>
                <Link
   to="/movies"  
  className="inline-block bg-primary-600 hover:bg-primary-700 transition px-5 py-2 rounded-lg text-white font-semibold"
>
  Book Now
</Link>
 </div>
   </div>
       ))}
 </div>
      </div>
    </div>
  );
};

export default EventsPage;
