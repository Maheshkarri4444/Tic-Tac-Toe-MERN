import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useRoom } from '../contexts/RoomContext';
import toast, { Toaster } from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import { Link , useNavigate} from 'react-router-dom'

const socket = io('http://localhost:7000');

const GameBox = () => {
  const [boxes, setBoxes] = useState(Array(9).fill('Z'));
  const [currentTurn, setCurrentTurn] = useState(null);
  const [turnFor, setTurnFor] = useState(null);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [winnerBoxes, setWinnerBoxes] = useState([]);
  const [draw, setDraw] = useState(false);
  const [isOpponentOnline, setIsOpponentOnline] = useState(true);

  const { user } = useUser();
  const { room } = useRoom();
  const navigate = useNavigate();

  const fetchGame = async () => {
    try {
      const res = await fetch(`http://localhost:7000/api/game/play/${room}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch game state');
      console.log("winnerboxes at backend: ",data.winnerBoxes);

      setBoxes(Object.values(data.game));
      setCurrentTurn(data.currentTurn);
      setTurnFor(data.turnFor);
      setWinner(data.winner);
      setWinnerBoxes(data.winningBoxes || []);
      setDraw(data.draw);
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

    socket.on('opponentDisconnected', () => {
      setIsOpponentOnline(false);
      toast.error('Opponent went offline!');
    });

    fetchGame();

    return () => {
      socket.off('gameUpdated');
      socket.off('resetGame');
      socket.off('opponentDisconnected');
      socket.off('playerAssignment');
      // socket.emit('leaveRoom', { roomId: room });
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

  const handleLeaveGame = () => {
    socket.emit('leaveRoom', { roomId: room, user });
    navigate('/');
  };

  const isMyTurn = currentTurn === user;
  // const mySymbol = isPlayerX ? 'X' : 'O';

  if (loading){ 
    return( 
      <div>
        <div className="text-center text-white">Loading...</div>
          <button
          onClick={handleLeaveGame}
          className="px-6 py-2 mt-3 font-bold text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
          Leave Room
          </button>
      </div>
  )}
  // console.log("winning boxes",winnerBoxes);
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] bg-gray-900">
      <Toaster />
      {!isOpponentOnline && (
        <div className="mb-4 text-xl font-semibold text-yellow-400">
          Opponent Disconnected 
        </div>
      )}
      {draw ? (
        <div className="mb-4 text-2xl font-bold text-yellow-400">
          Game Drawn 😐
        </div>
        ) :winner ? (
        <div className={`text-2xl font-bold mb-4 ${winner === user ? 'text-green-400' : 'text-red-400'}`}>
          {winner === user ? 'You Won! 🎉' : 'Opponent Won 😴'}
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
              ${winnerBoxes.includes(index) ? 'bg-green-900' : ''}
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
        {draw||winner?"Play Again" : "Restart"}
      </button>
      <button
        onClick={handleLeaveGame}
        className="px-6 py-2 mt-3 font-bold text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700"
      >
      Leave Room
      </button>
    </div>
  );
};

export default GameBox;