import React from 'react'

const Turn = () => {
  return (
    <div className="turn-container relative w-[170px] h-[80px] m-auto grid  grid-cols-2 grid-rows-2 ">
        <h3 className='col-span-2 m-0 text-xl font-bold'>Turn For</h3>
        <div className="turn-box align border-black border-[3px] text-[1.6rem] font-[700] border-r-0">X</div>
        <div className="turn-box align border-black border-[3px] text-[1.6rem] font-[700] capitalize ">O</div>
        <div className="bg w-[85px] h-[40px] absolute bottom-0 left-0 -z-10 bg-[#FF2E63] "></div>
    </div>
  )
}

export default Turn