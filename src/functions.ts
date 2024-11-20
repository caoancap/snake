import {
  directionKeyMap,
  directionMap,
  DOWN,
  LEFT,
  RIGHT,
  UP,
} from "./directions";
import {
  Coordinate,
  Directions,
  Food,
  FoodType,
  Snake,
  State,
  Trap,
  Types,
} from "./types";

const boardSize = 21;
const startSnakeSize = 3;

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
        Math.floor(Math.random() * (maxFoodType + 1))
      ];

const generateFood = (maxFoodType: FoodType): Food => ({
  position: generateRandomPosition(),
  direction: generateRandomDirection(),
  type: generateRandomFoodType(maxFoodType),
});

const generateTrap = (canGenerate: boolean): Trap | null =>
  canGenerate && Math.random() > 0.3
    ? {
        position: generateRandomDirection(),
      }
    : null;

const getNewGateState = (): State => {
  const y = Math.floor(boardSize / 2);
  return {
    snake: {
      positions: Array.from({ length: startSnakeSize }, (_, i) => ({
        x: startSnakeSize - i - 1,
        y,
      })),
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

const score = document.getElementById("score")!;

const getPoints = (): number => state.snake.positions.length - startSnakeSize;

export const updatePoints = (): void => {
  score.innerHTML = String(getPoints());
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

  const types = Array(cells.length);

  if (trapIndex !== null) {
    types[trapIndex] = Types.Trap;
  }
  types[foodIndex] = Types.Food;
  types[snakeIndex] = Types.SnakeHead;
  tailIndexList.forEach((i) => (types[i] = Types.SnakeTail));

  cells.forEach((cell, index) => {
    const classList: string[] = [];
    classList.push("cell");
    switch (types[index]) {
      case Types.Trap:
        classList.push("trap");
        break;
      case Types.Food:
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
        break;
      case Types.SnakeHead:
        classList.push("snake");
        break;
      case Types.SnakeTail:
        classList.push("tail");
        break;
      default:
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

const moveFood = (food: Food): Food => {
  let canMove = false;
  let factor = 1;
  switch (food.type) {
    case FoodType.Slug:
      canMove = Math.random() > 0.98;
      break;
    case FoodType.Rat:
      canMove = Math.random() > 0.8;
      break;
    case FoodType.Frog:
      canMove = Math.random() > 0.94;
      factor = 2;
      break;
    default:
  }
  if (canMove) {
    const newPosition = calcNewPosition(food.position, food.direction, factor);
    return { ...food, position: newPosition };
  }
  return food;
};

const checkCollision = (snake: Snake, trap: Trap | null): boolean => {
  const [head, ...tail] = snake.positions;
  if (trap !== null) {
    if (coordinateIsEqual(head, trap.position)) {
      return true;
    }
  }
  return tail.some((segment) => coordinateIsEqual(segment, head));
};

export const gameLoop = (board: HTMLElement): void => {
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
  const gotFood = coordinateIsEqual(newSnake.positions[0], state.food.position);
  if (gotFood) {
    newSnake.positions.push({
      ...state.snake.positions[newSnake.positions.length - 1],
    });

    let maxFoodType = FoodType.Slug;

    const points = getPoints();

    switch (Math.floor(points / 5)) {
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
    newTrap = generateTrap(points > 7);
  } else {
    newFood = moveFood(state.food);
  }

  const newState = {
    ...state,
    snake: newSnake,
    food: newFood,
    trap: newTrap,
  };

  state = newState;

  if (gotFood) {
    updatePoints();
  }
  drawBoard(board);
  setTimeout(() => gameLoop(board), 200);
};

export const handleKeyPress = (event: KeyboardEvent) => {
  setDirection(directionKeyMap[event.key.toLocaleUpperCase()]);
};

export const setNewDirection = (val: Directions): void => {
  setDirection(directionMap[val]);
};

const setDirection = (direction: Coordinate): void => {
  if (direction !== undefined) {
    state.snake.direction = direction;
  }
};
