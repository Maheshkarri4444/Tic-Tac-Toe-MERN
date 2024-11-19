import User from "../models/user.model.js";
import Room from "../models/room.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

export const login = async(req,res)=>{
    try{
        const token = req.cookies.jwt;
        console.log("at login" , token);
        if (token) {
            res.clearCookie('jwt'); // Clear the token from cookies
        }
        const {username} = req.body;
        // console.log(req.body);

        const newUser = User({ username })
        newUser.save();
        generateTokenAndSetCookie(newUser._id,res);

        res.status(201).json({
                _id:newUser._id,
                username: newUser.username
        })
                
    }catch(error){
        res.status(500).json({error:"Internal server error at login"});
    }
}

export const create = async(req,res)=>{
    try{
        const { roomId } = req.body;
        const loggedInUser = req.user;

        if (!roomId) {
            return res.status(400).json({ error: "Room ID is required" });
        }

        const isRoomExist = await Room.findOne({ roomId });
        if (isRoomExist) {
            res.status(409).json({ error: "Room with this ID already exists" });
            return;
        }

        const room = new Room({
            roomId,
            participants:[loggedInUser._id],
            game: { // Explicitly pass the game state (can be omitted if you want to use the default)
                0: 'Z', 1: 'Z', 2: 'Z',
                3: 'Z', 4: 'Z', 5: 'Z',
                6: 'Z', 7: 'Z', 8: 'Z'
            }
        })

        await room.save();

        res.status(201).json({
            message: "Room created successfully",
            roomId: room.roomId,
            participants: room.participants,
            currentTurn: room.currentTurn,
            game: room.game,
            winner: room.winner
        });

    }catch(error){
        console.error("Error creating room:", error);
        res.status(500).json({ error: "Internal server error while creating room" });
    }
}

export const join = async(req,res)=>{
    try{
        const { roomId } = req.body;
        const loggedInUser = req.user._id;

        const isRoomExist = await Room.findOne({ roomId });
        if (!isRoomExist) {
            return (res.status(409).json({ error: "No Room with this ID exists" }));
        }

        // Check if the user is already in the room
        if (isRoomExist.participants.includes(loggedInUser)) {
            return res.status(400).json({ error: "You are already in this room" });
        }
        // Check if the room already has 2 participants
        if (isRoomExist.participants.length >= 2) {
            return res.status(409).json({ error: "Room is already full" });
        }

        // Add the logged-in user to the room's participants
        isRoomExist.participants.push(loggedInUser);

        // Save the updated room
        await isRoomExist.save();

        // Return the updated room details
        res.status(200).json({
            message: "Successfully joined the room",
            roomId: isRoomExist.roomId,
            participants: isRoomExist.participants,
            currentTurn: isRoomExist.currentTurn,
            game: isRoomExist.game,
            winner: isRoomExist.winner
        });
    }catch(error){
        console.error("Error joining room:", error);
        res.status(500).json({ error: "Internal server error while joining room" });
    }

}

export const playX = async (req, res) => {
    try {
      const { roomId, xpos } = req.params; // Get roomId and xpos from URL params
      const loggedInUser = req.user._id;
  
      // Validate xpos to ensure it's within range [0-8]
      const position = parseInt(xpos);
      if (position < 0 || position > 8) {
        return res.status(400).json({ error: "Invalid position" });
      }
  
      // Find the room by ID
      const room = await Room.findOne({ roomId });
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
  
      // Ensure there are exactly 2 participants
      if (room.participants.length !== 2) {
        return res.status(400).json({ error: "Room must have exactly 2 participants" });
      }
  
      // Check if it's the logged-in user's turn
      if (String(room.currentTurn) !== String(loggedInUser)) {
        return res.status(403).json({ error: "It's not your turn" });
      }
  
      // Get the current game board
    //   const gameBoard = new Map(room.game);
    const gameBoard =  Object.fromEntries(room.game);
    //   console.log(gameBoard);
    // //   gameBoard.set(xpos, 'X');
    //   console.log(gameBoard[xpos]);
      // Check if the cell is already taken
      if ( gameBoard[xpos] !== 'Z') {
        return res.status(400).json({ error: "Cell is already occupied" });
      }
  
      // Place 'X' on the board
      gameBoard[xpos] = 'X';

      console.log("game Board: ",gameBoard);
  
      // Check for a winner after the move
      const winner = checkWinner(gameBoard);
      if (winner) {
        room.winner = loggedInUser;
        room.winningBoxes = winner;
        room.game = gameBoard;
        await room.save();
        return res.status(200).json({
          message: "You won the game!",
          game: gameBoard,
          winner: loggedInUser,
          winningBoxes: winner,
        });
      }
  
      // Switch turns to the other player
      const nextPlayer = room.participants.find((id) => String(id) !== String(loggedInUser));
      room.currentTurn = nextPlayer;

      room.game = gameBoard;
      room.turnFor = 'O';
      // Save the updated room data
      await room.save();
  
      res.status(200).json({
        message: "Move made successfully",
        game: room.game,
        currentTurn: room.currentTurn,
        turnFor: room.turnFor
      });
    } catch (error) {
      console.error("Error in playX:", error);
      res.status(500).json({ error: "Internal server error while making a move" });
    }
  };
  
  // Helper function to check for a winner
  const checkWinner = (gameBoard) => {
    const winningCombinations = [
      [0, 1, 2], // Row 1
      [3, 4, 5], // Row 2
      [6, 7, 8], // Row 3
      [0, 3, 6], // Column 1
      [1, 4, 7], // Column 2
      [2, 5, 8], // Column 3
      [0, 4, 8], // Diagonal 1
      [2, 4, 6], // Diagonal 2
    ];
  
    // Check each winning combination
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        gameBoard[a] !== 'Z' &&
        gameBoard[a] === gameBoard[b] &&
        gameBoard[a] === gameBoard[c]
      ) {
        return combination;
      }
    }
    return null;
  };
  
  export const playO = async (req, res) => {
    try {
      const { roomId, opos } = req.params;
      const loggedInUser = req.user._id;
      const position = parseInt(opos);
      
      if (position < 0 || position > 8) {
        return res.status(400).json({ error: "Invalid position" });
      }
  
      const room = await Room.findOne({ roomId });
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
  
      if (room.participants.length !== 2) {
        return res.status(400).json({ error: "Room must have exactly 2 participants" });
      }
  
      if (String(room.currentTurn) !== String(loggedInUser)) {
        return res.status(403).json({ error: "It's not your turn" });
      }

    const gameBoard =  Object.fromEntries(room.game);

  
      if (gameBoard[opos] !== 'Z') {
        return res.status(400).json({ error: "Cell is already occupied" });
      }
  
      gameBoard[opos] = 'O';
  
      const winner = checkWinner(gameBoard);
      if (winner) {
        room.winner = loggedInUser;
        room.winningBoxes = winner;
        await room.save();
        return res.status(200).json({
          message: "You won the game!",
          game: gameBoard,
          winner: loggedInUser,
          winningBoxes: winner,
        });
      }
  
      const nextPlayer = room.participants.find((id) => String(id) !== String(loggedInUser));
      room.currentTurn = nextPlayer;
      room.game = gameBoard;
      room.turnFor = 'X';
      await room.save();
  
      res.status(200).json({
        message: "Move made successfully",
        game: room.game,
        currentTurn: room.currentTurn,
        turnFor: room.turnFor
      });
    } catch (error) {
      console.error("Error in playO:", error);
      res.status(500).json({ error: "Internal server error while making a move" });
    }
  };
  
  export const resetGame = async (req, res) => {
    try {
      const { roomId } = req.params;
  
      // Find the room by roomId
      const room = await Room.findOne({ roomId });
  
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
  
      // Ensure there are exactly 2 participants
      if (room.participants.length !== 2) {
        return res.status(400).json({ error: "Room must have exactly 2 participants" });
      }
  
      // Reset the game board to the initial state
      const initialGameBoard = {
        0: 'Z', 1: 'Z', 2: 'Z',
        3: 'Z', 4: 'Z', 5: 'Z',
        6: 'Z', 7: 'Z', 8: 'Z'
      };
  
      // Update the room's game state
      room.game = initialGameBoard;
  
      // Reset the winner
      room.winner = null;
      room.winningBoxes = null;
  
      // Optionally, randomly set the first turn to one of the participants
      const randomTurnIndex = Math.floor(Math.random() * 2);
      room.currentTurn = room.participants[randomTurnIndex];
  
      // Save the updated room
      await room.save();
  
      res.status(200).json({
        message: "Game has been reset successfully",
        game: room.game,
        currentTurn: room.currentTurn,
        participants: room.participants
      });
  
    } catch (error) {
      console.error("Error resetting the game:", error);
      res.status(500).json({ error: "Internal server error while resetting the game" });
    }
  };
  
export const getGame = async(req,res)=>{
  try{
    const { roomId } = req.params;
  
    // Find the room by roomId
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.status(200).json({
      message: "Game fetched successfully",
      game: room.game,
      participants: room.participants,
      currentTurn: room.currentTurn,
      turnFor: room.turnFor,
      winner: room.winner,
      winningBoxes: room.winningBoxes,
    });

  }catch(error){
    console.error("Error fetching game:", error);
    res.status(500).json({ error: "Internal server error while fetching game" });
  }
}