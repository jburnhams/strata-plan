import { WallSide } from './geometry';

export interface SharedWall {
  room1Wall: WallSide;
  room2Wall: WallSide;
  length: number;
  startPosition: number; // 0.0-1.0 along room1's wall
  endPosition: number;   // 0.0-1.0 along room1's wall
}

export interface AdjacencyInfo {
  room1Id: string;
  room2Id: string;
  sharedWall: SharedWall;
}
