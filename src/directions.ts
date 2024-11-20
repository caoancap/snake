import { Coordinate, Directions } from "./types";

export const UP: Coordinate = { x: 0, y: -1 };
export const RIGHT: Coordinate = { x: 1, y: 0 };
export const DOWN: Coordinate = { x: 0, y: 1 };
export const LEFT: Coordinate = { x: -1, y: 0 };

export const directionKeyMap: Record<string, Coordinate> = {
  ARROWUP: UP,
  ARROWRIGHT: RIGHT,
  ARROWDOWN: DOWN,
  ARROWLEFT: LEFT,
  W: UP,
  D: RIGHT,
  S: DOWN,
  A: LEFT,
};

export const directionMap: Record<Directions, Coordinate> = {
  [Directions.Up]: UP,
  [Directions.Right]: RIGHT,
  [Directions.Down]: DOWN,
  [Directions.Left]: LEFT,
};
