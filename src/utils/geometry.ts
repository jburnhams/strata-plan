import { Position2D } from '../types';

export const calculateDistance = (p1: Position2D, p2: Position2D): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2));
};
