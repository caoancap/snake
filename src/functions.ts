import { Coordinate, Food, FoodType, Snake, State, Trap } from "./types";

export const boardSize = 21;

export const UP: Coordinate = { x: 0, y: -1 };
export const RIGHT: Coordinate = { x: 1, y: 0 };
export const DOWN: Coordinate = { x: 0, y: 1 };
export const LEFT: Coordinate = { x: -1, y: 0 };

const generateRandomPosition = (): Coordinate => ({
  x: Math.floor(Math.random() * boardSize),
  y: Math.floor(Math.random() * boardSize),
});

const generateRandomDirection = (): Coordinate =>
  [UP, RIGHT, DOWN, LEFT][Math.floor(Math.random() * 4)];

const generateRandomFoodType = (maxFoodType: FoodType): FoodType =>
  maxFoodType === FoodType.Slug
    ? FoodType.Slug
    : [FoodType.Slug, FoodType.Rat, FoodType.Frog][
        Math.floor(Math.random() * maxFoodType)
      ];

const generateFood = (maxFoodType: FoodType): Food => ({
  position: generateRandomPosition(),
  direction: generateRandomDirection(),
  type: generateRandomFoodType(maxFoodType),
});

const generateTrap = (canGenerate: boolean): Trap | null =>
  canGenerate && Math.floor(Math.random() * 2) === 0
    ? {
        position: generateRandomDirection(),
      }
    : null;

const getNewGateState = (): State => {
  const y = Math.floor(boardSize / 2);
  return {
    snake: {
      positions: [
        { x: 2, y },
        { x: 1, y },
        { x: 0, y },
      ],
      direction: RIGHT,
    },
    food: generateFood(FoodType.Slug),
    trap: null,
    gameOver: false,
    gameRunning: true,
  };
};

let state = getNewGateState();

export const createBoard = (): HTMLElement => {
  const board = document.getElementById("board")!;

  for (let index = 0; index < boardSize * boardSize; index += 1) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    board.appendChild(cell);
  }
  return board;
};

const calcIndex = (coordinate: Coordinate): number =>
  coordinate.y * boardSize + coordinate.x;

export const drawBoard = (board: HTMLElement): void => {
  const cells = board.querySelectorAll(".cell");
  const [head, ...tail] = state.snake.positions;
  const snakeIndex = calcIndex(head);
  const tailIndexList = tail.map(calcIndex);
  const foodIndex = calcIndex(state.food.position);
  const trapIndex = state.trap !== null ? calcIndex(state.trap.position) : null;

  cells.forEach((cell, index) => {
    const classList: string[] = [];
    classList.push("cell");
    if (snakeIndex === index) {
      classList.push("snake");
    } else if (tailIndexList.includes(index)) {
      classList.push("tail");
    } else if (foodIndex === index) {
      classList.push("food");
      switch (state.food.type) {
        case FoodType.Slug:
          classList.push("slug");
          break;
        case FoodType.Rat:
          classList.push("rat");
          break;
        case FoodType.Frog:
          classList.push("frog");
          break;
        default:
      }
    } else if (trapIndex === index) {
      classList.push("trap");
    }
    cell.className = classList.join(" ");
  });
};

const coordinateIsEqual = (a: Coordinate, b: Coordinate): boolean =>
  a.x === b.x && a.y === b.y;

const calcNewPosition = (
  element: Coordinate,
  direction: Coordinate,
  multiplier: number = 1
): Coordinate => {
  const newPosition = {
    x: element.x + direction.x * multiplier,
    y: element.y + direction.y * multiplier,
  };

  newPosition.x = (newPosition.x + boardSize) % boardSize;
  newPosition.y = (newPosition.y + boardSize) % boardSize;

  return newPosition;
};

const moveSnake = (snake: Snake): Snake => {
  const newSnake = { ...snake };
  const head = calcNewPosition(snake.positions[0], snake.direction);
  newSnake.positions = [head, ...snake.positions.slice(0, -1)];
  return newSnake;
};

const checkCollision = (snake: Snake, trap: Trap | null): boolean => {
  const [head, ...body] = snake.positions;
  if (trap !== null) {
    if (coordinateIsEqual(head, trap.position)) {
      return true;
    }
  }
  return body.some((segment) => coordinateIsEqual(segment, head));
};

export const gameLoop = (board: HTMLElement) => {
  if (state.gameOver) {
    alert("Game over!");
    return;
  }

  const newSnake = moveSnake(state.snake);
  if (checkCollision(newSnake, state.trap)) {
    state.gameOver = true;
  }

  let newFood = state.food;
  let newTrap = state.trap;
  if (coordinateIsEqual(newSnake.positions[0], state.food.position)) {
    newSnake.positions.push({
      ...state.snake.positions[newSnake.positions.length - 1],
    });

    let maxFoodType = FoodType.Slug;

    switch (Math.floor(newSnake.positions.length / 10)) {
      case 0:
        maxFoodType = FoodType.Slug;
        break;
      case 1:
        maxFoodType = FoodType.Rat;
        break;
      default:
        maxFoodType = FoodType.Frog;
    }
    newFood = generateFood(maxFoodType);
    newTrap = generateTrap(newSnake.positions.length > 5);
  }

  const newState = {
    ...state,
    snake: newSnake,
    food: newFood,
    trap: newTrap,
  };

  state = newState;

  drawBoard(board);
  setTimeout(() => gameLoop(board), 200);
};

export const handleKeyPress = (event: KeyboardEvent) => {
  const keyMap: Record<string, Coordinate> = {
    ARROWUP: UP,
    ARROWRIGHT: RIGHT,
    ARROWDOWN: DOWN,
    ARROWLEFT: LEFT,
    W: UP,
    D: RIGHT,
    S: DOWN,
    A: LEFT,
  };

  const direction = keyMap[event.key.toLocaleUpperCase()];
  if (direction !== undefined) {
    state.snake.direction = direction;
  }
};
