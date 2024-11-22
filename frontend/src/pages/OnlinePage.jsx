import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useRoom } from '../contexts/RoomContext';
import { useUser } from '../contexts/UserContext';

const socket = io('https://tic-tac-toe-mern-sad5.onrender.com');

const OnlinePage = () => {
  const { user, setUser } = useUser();
  const { room, setRoom } = useRoom();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState({
    name: false,
    create: false,
    join: false
  });

  useEffect(() => {
    socket.on('startGame', () => {
      navigate('/game');
    });

    return () => {
      socket.off('startGame');
    };
  }, [navigate]);

  const handleName = async () => {
    if (name.length < 3) {
      return toast.error('Name must be at least 3 characters long');
    }

    setIsLoading(prev => ({ ...prev, name: true }));
    try {
      const res = await fetch('https://tic-tac-toe-mern-sad5.onrender.com/api/game/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setUser(data._id);
      toast.success('Logged in successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(prev => ({ ...prev, name: false }));
    }
  };

  const handleRoom = async (action) => {
    if (!user) {
      return toast.error('Please login first');
    }
    if (room.length > 5) {
      return toast.error('Room ID must be 5 digits or less');
    }

    const loadingKey = action === 'create' ? 'create' : 'join';
    setIsLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const res = await fetch(`https://tic-tac-toe-mern-sad5.onrender.com/api/game/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action} room`);

      socket.emit('joinRoom', { roomId: room, user });
      toast.success(`Room ${action}d successfully!`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] gap-6 bg-gray-900">
      <Toaster />
      <div className="p-8 bg-gray-800 rounded-lg shadow-md w-96">
        <div className="mb-6">
          <input
            className="w-full px-4 py-2 mb-5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="w-full py-2 mt-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
            onClick={handleName}
            disabled={isLoading.name}
          >
            {isLoading.name ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <div className="mb-5">
          <input
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            type="text"
            placeholder="Room ID (e.g., 12345)"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <button
            className="flex-1 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
            onClick={() => handleRoom('create')}
            disabled={isLoading.create}
          >
            {isLoading.create ? 'Creating...' : 'Create Room'}
          </button>
          <button
            className="flex-1 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
            onClick={() => handleRoom('join')}
            disabled={isLoading.join}
          >
            {isLoading.join ? 'Joining...' : 'Join Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlinePage;