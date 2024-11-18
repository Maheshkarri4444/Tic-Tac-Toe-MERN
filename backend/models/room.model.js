import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    maxlength: 5,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  currentTurn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  turnFor:{
    type: String,
    enum: ["X", "O"], 
    default: 'X',
  },
  game: {
    type: Map,
    of: {
      type: String,
      enum: ["Z", "X", "O"], // Allow only '0', 'X', 'O'
    },
    validate: {
      validator: function (gameMap) {
        return gameMap.size === 9; // Ensure exactly 9 cells
      },
      message: "Game board must have exactly 9 cells.",
    },
    default: function () {
      return new Map([
        [0, "Z"],
        [1, "Z"],
        [2, "Z"],
        [3, "Z"],
        [4, "Z"],
        [5, "Z"],
        [6, "Z"],
        [7, "Z"],
        [8, "Z"],
      ]);
    },
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
},{timestamps:true});

// Middleware to check participants count
roomSchema.pre("save", function (next) {
  if (this.participants.length > 2) {
    return next(new Error("A room can have a maximum of 2 participants."));
  }
  if (!this.currentTurn && this.participants.length > 0) {
    this.currentTurn = this.participants[0];
  }

  if (!this.turnFor) {
    this.turnFor = "X"; // Start with "X" by default
  }

  next();
});

const Room = mongoose.model("Room", roomSchema);
export default Room;
