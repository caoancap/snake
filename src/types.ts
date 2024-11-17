export interface Coordinate {
  x: number;
  y: number;
}

export interface Snake {
  positions: Coordinate[];
  direction: Coordinate;
}

export enum FoodType {
  Slug,
  Rat,
  Frog,
}

export interface Food {
  position: Coordinate;
  direction: Coordinate;
  type: FoodType;
}

export interface Trap {
  position: Coordinate;
}

export interface State {
  snake: Snake;
  food: Food;
  trap: Trap | null;
  gameRunning: boolean;
  gameOver: boolean;
}
