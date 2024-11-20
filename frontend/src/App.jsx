import React from 'react'
import Home from './pages/HomePage' 
import { Route,Routes } from 'react-router-dom'
import OnlinePage from './pages/onlinePage'
import OfflinePage from './pages/OfflinePage.jsx'
import Game from './pages/GamePage'
import { RoomProvider } from './contexts/RoomContext.jsx'
import { UserProvider } from './contexts/UserContext.jsx'
const App = () => {
  return (
    <UserProvider>
    <RoomProvider>
    <div className='h-[90vh]'>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/online' element={<OnlinePage/>}/>
      <Route path= '/offline' element={<OfflinePage/>}/>
      <Route path="/game" element={<Game/>}/>
    </Routes>
    </div>
    </RoomProvider>
    </UserProvider>
  )
}

export default App