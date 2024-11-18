import "./style.css";
import {
  createBoard,
  drawBoard,
  gameLoop,
  handleKeyPress,
  setNewDirection,
  updatePoints,
} from "./functions";
import { Directions } from "./types";

const board = createBoard();

document.addEventListener("keydown", handleKeyPress);
document
  .getElementById("up")!
  .addEventListener("mousedown", () => setNewDirection(Directions.Up));
document
  .getElementById("right")!
  .addEventListener("mousedown", () => setNewDirection(Directions.Right));
document
  .getElementById("down")!
  .addEventListener("mousedown", () => setNewDirection(Directions.Down));
document
  .getElementById("left")!
  .addEventListener("mousedown", () => setNewDirection(Directions.Left));

updatePoints();
drawBoard(board);
gameLoop(board);
