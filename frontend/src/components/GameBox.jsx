import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useRoom } from '../contexts/RoomContext';
import toast, { Toaster } from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';

const socket = io('http://localhost:7000');

const GameBox = () => {
  const [boxes, setBoxes] = useState(Array(9).fill('Z'));
  // const [isPlayerX, setIsPlayerX] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [turnFor, setTurnFor] = useState(null);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useUser();
  const { room } = useRoom();

  const fetchGame = async () => {
    try {
      const res = await fetch(`http://localhost:7000/api/game/play/${room}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch game state');

      setBoxes(Object.values(data.game));
      setCurrentTurn(data.currentTurn);
      setTurnFor(data.turnFor);
      setWinner(data.winner);
      // setIsPlayerX(data.playerSymbol === 'X');
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!room) return;

    socket.emit('joinRoom', { roomId: room, user });

    socket.on('gameUpdated', fetchGame);
    socket.on('resetGame', async () => {
      await fetchGame(); // Fetch the reset state from server
    });
    socket.on('playerAssignment', ({ assignedPlayer }) => {
      // setIsPlayerX(assignedPlayer === 'X');
      setLoading(false);
    });

    fetchGame();

    return () => {
      socket.off('gameUpdated');
      socket.off('resetGame');
      socket.off('playerAssignment');
      socket.emit('leaveRoom', { roomId: room });
    };
  }, [room, user]);

  const handleMove = async (index) => {
    if (boxes[index] !== 'Z' || winner || currentTurn !== user) return;

    try {
      const res = await fetch(`http://localhost:7000/api/game/play/${room}/${turnFor}/${index}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to make move');
      }
      socket.emit('playerMoved', { roomId: room });
      await fetchGame(); // Fetch the updated state after move
    } catch (error) {
      toast.error(error.message);
    }
  };

  const resetGame = async () => {
    try {
      const res = await fetch(`http://localhost:7000/api/game/play/reset/${room}`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to reset game');

      socket.emit('gameReset', { roomId: room });
      await fetchGame(); // Fetch the reset state immediately
    } catch (error) {
      toast.error(error.message);
    }
  };

  const isMyTurn = currentTurn === user;
  // const mySymbol = isPlayerX ? 'X' : 'O';

  if (loading) return <div className="text-center text-white">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <Toaster />
      {winner ? (
        <div className={`text-2xl font-bold mb-4 ${winner === user ? 'text-green-400' : 'text-red-400'}`}>
          {winner === user ? 'You Won! 🎉' : 'Opponent Won'}
        </div>
      ) : (
        <div className={`mt-3 px-6 py-2 rounded-md text-white font-bold ${
          isMyTurn ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
        </div>
      )}
      <div className="grid w-64 h-64 grid-cols-3 grid-rows-3 gap-2 p-2 my-6 bg-gray-800 rounded-lg">
        {boxes.map((box, index) => (
          <div
            key={index}
            className={`flex items-center justify-center text-4xl font-bold bg-gray-700 cursor-pointer transition-colors rounded-md
              ${box === 'Z' && isMyTurn && !winner ? 'hover:bg-gray-600' : ''}
              ${box === 'X' ? 'text-blue-400' : box === 'O' ? 'text-red-400' : 'text-transparent'}`}
            onClick={() => handleMove(index)}
          >
            {box === 'Z' ? '-' : box}
          </div>
        ))}
      </div>
      <button
        onClick={resetGame}
        className="px-6 py-2 mt-3 font-bold text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700"
      >
        Reset Game
      </button>
    </div>
  );
};

export default GameBox;