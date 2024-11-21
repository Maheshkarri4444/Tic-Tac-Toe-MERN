import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const OfflinePage = () => {
    const [boxes, setBoxes] = useState(Array(9).fill(null));
    const [turn, setTurn] = useState("X");
    const [isGameOver, setIsGameOver] = useState(false);
    const [result, setResult] = useState("");
    const [winningBoxes, setWinningBoxes] = useState([]); 
    const navigate = useNavigate();

    useEffect(() => {
        checkDraw();
    }, [boxes]);

    const handleClick = (index) => {
        if (!isGameOver && !boxes[index]) {
            const newBoxes = [...boxes];
            newBoxes[index] = turn;
            setBoxes(newBoxes);

            checkWin(newBoxes,turn);
            changeTurn();
        }
    };

    const changeTurn = () => {
        setTurn(turn === "X" ? "O" : "X");
        document.querySelector(".bg").style.left = turn === "X" ? "85px" : "0";
    };

    const checkWin = (newBoxes,currentTurn) => {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let condition of winConditions) {
            const [a, b, c] = condition;
            if (newBoxes[a] && newBoxes[a] === newBoxes[b] && newBoxes[a] === newBoxes[c]) {
                setIsGameOver(true);
                setResult(`${currentTurn} Wins`);
                setWinningBoxes([a, b, c]); 
                document.querySelector("#play-again").style.display = "inline";
                document.querySelector("#home-button").style.display = "none";

                return;
            }
        }
    };

    const checkDraw = () => {
        if (!isGameOver && boxes.every(box => box)) {
            setIsGameOver(true);
            setResult("DRAW");
            document.querySelector("#play-again").style.display = "inline";
            document.querySelector("#home-button").style.display = "none";
        }
    };

    const playAgain = () => {
        setBoxes(Array(9).fill(null));
        setTurn("X");
        setIsGameOver(false);
        setResult("");
        setWinningBoxes([]); 

        document.querySelector(".bg").style.left = 0;
        document.querySelector("#results").innerHTML = "";
        document.querySelector("#play-again").style.display = "none";
        document.querySelector("#home-button").style.display = "inline";


    };

    const handleLeaveGame = () => {
        navigate('/');
      };

  return (
    <div>
        <div className="turn-container relative w-[170px] h-[80px] m-auto grid  grid-cols-2 grid-rows-2 ">
            <h3 className='col-span-2 m-0 text-xl font-bold'>Turn For</h3>
            <div className="turn-box align border-black border-[3px] text-[1.6rem] font-[700] border-r-0">X</div>
            <div className="turn-box align border-black border-[3px] text-[1.6rem] font-[700] capitalize ">O</div>
            <div className="bg w-[85px] h-[40px] absolute bottom-0 left-0 -z-10 bg-[#4F46E5] "></div>
        </div>
        <div className="main-grid grid grid-cols-3 grid-rows-3 h-64 w-64 my-[30px] mx-auto border-2 border-black">
                {boxes.map((box, index) => (
                    <div 
                        key={index} 
                        className={`box align cursor-pointer text-[2rem] font-[700] capitalize  text-2xl border-2 border-black ${winningBoxes.includes(index) ? 'winning' : ''}`}  
                        onClick={() => handleClick(index)}
                    >
                        {box}
                    </div>
                ))}
        </div>
        <div>
            <h2 id="results" className='mb-4 text-2xl font-bold'>{result}</h2>
            <button id="play-again" onClick={playAgain} className='hidden cursor-pointer bg-[#4f46E5] text-[1.2rem] px-[25px] py-[10px] rounded-md border-none   hover:px-[40px]' >Play Again</button>
        </div>
        <div onClick={handleLeaveGame}>
            <button id='home-button' className='inline cursor-pointer bg-[#4f46E5] text-[1.2rem] px-[25px] py-[10px] rounded-md border-none   hover:px-[40px]'>Home</button>
        </div>

    </div>
    
  )
}

export default OfflinePage