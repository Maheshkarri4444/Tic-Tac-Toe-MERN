// import React, { useState , useEffect } from 'react'
// import toast , { Toaster } from "react-hot-toast";
// import { useNavigate } from 'react-router-dom';
// import { io } from 'socket.io-client';
// import { useRoom } from '../contexts/RoomContext.jsx';
// import { useUser } from '../contexts/UserContext.jsx';
// const socket = io('http://localhost:7000');

// const OnlinePage = () => {

//   const {user,setUser} = useUser();

//   const [name, setName] = useState("");
//   // console.log(name);
//   // const [room , setRoom]= useState("");
//   const { room, setRoom } = useRoom();
//   const [nameLoading, setNameLoading]= useState(false);
//   const [createLoading, setCreateLoading]= useState(false);
//   const [joinLoading, setJoinLoading]= useState(false);

//   const navigate = useNavigate();
  
//   useEffect(()=>{
//     socket.on('startGame',()=>{
//       navigate('/game');
//     });

//     return ()=>{
//       socket.off('startGame');
//     };
//   },[navigate]);

//   const [username,setUsername] = useState("");

//   const handleName = async()=> { 
//     setNameLoading(true)
//   try{
//     if (name.length < 3) {
// 			return toast.error("Name Min limit 3 letters");
// 		}    
//     const res= await fetch("http://localhost:7000/api/game/login",{
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({username:name}),
//       credentials:"include"
//     }); 
//     const data = await res.json();
//     console.log(data);
//     if(data.error) throw new Error(data.error);
//     setUsername(name);
//     setUser(data._id);
//   }
//   catch(error){
//     toast.error(error.message);
//   }finally{
//     setNameLoading(false);
//   }
//   }

//   const handleCreateRoom = async()=>{
//     setCreateLoading(true);
//     try{
//       if(username===""){
//         return toast.error("Login first");
//       }else if (room.length > 5) {
//         return toast.error("Room Id limit 5 Digits");
//       }
//       else{
//         // console.log("room id is: ",room);
//         const res= await fetch("http://localhost:7000/api/game/create",{
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({roomId: room}),
//           credentials:"include"          
//         }); 
//         const data = await res.json();
        
//         console.log(data);
//         if(data.error) throw new Error(data.error);

//         // Join the room with socket.io
//         socket.emit('joinRoom', room);
        
//       }

//     }catch(error){
//       toast.error(error.message)
//     }finally{
//       setCreateLoading(false);
//     }
//   }

//   const handleJoinRoom = async()=>{
//     setJoinLoading(true);
//     try{
//       if(username===""){
//         return toast.error("Login first");
//       }else if (room.length > 5) {
//         return toast.error("Room Id limit 5 Digits");
//       }
//       else{
//         // console.log("room id is: ",room);
//         const res= await fetch("http://localhost:7000/api/game/join",{
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({roomId: room}),
//           credentials:"include"          
//         }); 
//         const data = await res.json();
//         console.log(data);
        
//         if(data.error) throw new Error(data.error);
//         socket.emit('joinRoom', room);
//       }
//       // console.log(room);
//     }catch(error){
//       toast.error(error.message);
//     }finally{
//       setJoinLoading(false);
//     }
//   }
//   return (
//     <div className='flex flex-col items-center justify-center h-full gap-4' >
//     <Toaster/>
//       <div >
//         <input className='px-[11px] py-[8px] mr-3 border rounded-lg' type='name' placeholder='Fullname'
//         onChange={(e)=> setName(e.target.value)}
//         name='username'
//         value={name}
//         />
//         <button  className=' cursor-pointer bg-[#FF2E63] text-[0.9rem] px-[12px] py-[10px] rounded-md border-none hover:bg-[#08D9D6] hover:text-black' 
//         onClick={handleName}>{nameLoading?(
//           <span className='loading loading-spinner'></span>
//         ):("Log")}</button>
//       </div>
//       <div >
//       <input className='px-[11px] py-[8px] border rounded-lg' type='name' placeholder='Room ID (ex:12345)'
//         onChange={(e)=> setRoom(e.target.value)}
//         value={room}
//       />
//       </div>
//       <div>
//       <button  className=' cursor-pointer bg-[#FF2E63] text-[1.2rem] px-[25px] py-[7px] rounded-md border-none hover:bg-[#08D9D6] hover:text-black hover:px-[40px]'
//         onClick={handleCreateRoom}
//       >{createLoading?(
//         <span className='loading loading-spinner'></span>
//       ):("CREATE")}</button>
//       </div>
//       <div>
//       <button  className=' cursor-pointer bg-[#FF2E63] text-[1.2rem] px-[25px] py-[7px] rounded-md border-none hover:bg-[#08D9D6] hover:text-black hover:px-[40px]'
//         onClick={handleJoinRoom}
//         >{joinLoading ? (
//           <span className='loading loading-spinner'></span>
//         ):("JOIN")}</button>
//       </div>

//     </div>
//   )
// }
 
// export default OnlinePage;


import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useRoom } from '../contexts/RoomContext';
import { useUser } from '../contexts/UserContext';

const socket = io('http://localhost:7000');

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
      const res = await fetch('http://localhost:7000/api/game/login', {
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
      const res = await fetch(`http://localhost:7000/api/game/${action}`, {
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
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-900">
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