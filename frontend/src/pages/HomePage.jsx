import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className='flex flex-col items-center justify-center w-full h-full gap-6'>
        <button id="play-again"  className=' cursor-pointer bg-[#FF2E63] text-[1.2rem] px-[25px] py-[10px] rounded-md border-none hover:bg-[#08D9D6] hover:text-black hover:px-[40px]' >Offline Mode</button>
        <Link to="/online" id="online-mode"  className=' cursor-pointer bg-[#FF2E63] text-[1.2rem] px-[25px] py-[10px] rounded-md border-none hover:bg-[#08D9D6] hover:text-black hover:px-[40px]' >Online Mode</Link>
    </div>
  )
}

export default HomePage