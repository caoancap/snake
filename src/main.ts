import "./style.css";
import { createBoard, drawBoard, gameLoop, handleKeyPress } from "./functions";

const board = createBoard();

document.addEventListener("keydown", handleKeyPress);
drawBoard(board);
gameLoop(board);
