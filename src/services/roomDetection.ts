import { Wall, Position2D } from '../types';

export interface DetectedPolygon {
  vertices: Position2D[];
  area: number;
}

const EPSILON = 0.01; // 1cm tolerance

function arePointsEqual(p1: Position2D, p2: Position2D): boolean {
  return Math.abs(p1.x - p2.x) < EPSILON && Math.abs(p1.z - p2.z) < EPSILON;
}

function getPointKey(p: Position2D): string {
  // Quantize to avoid floating point issues
  const x = Math.round(p.x * 100);
  const z = Math.round(p.z * 100);
  return `${x},${z}`;
}

interface GraphEdge {
  toNodeId: string;
  wallId: string;
  angle: number;
}

export const findEnclosedAreas = (walls: Wall[]): DetectedPolygon[] => {
  if (walls.length < 3) return [];

  // 1. Build Graph
  // Node ID -> Position
  const nodes = new Map<string, Position2D>();
  // Node ID -> List of edges
  const adjacency = new Map<string, GraphEdge[]>();

  const getOrCreateNodeId = (p: Position2D): string => {
    // Check existing nodes for fuzzy match
    for (const [id, pos] of nodes.entries()) {
      if (arePointsEqual(p, pos)) return id;
    }
    const id = getPointKey(p);
    nodes.set(id, p);
    if (!adjacency.has(id)) adjacency.set(id, []);
    return id;
  };

  // Add all edges
  walls.forEach(wall => {
    const u = getOrCreateNodeId(wall.from);
    const v = getOrCreateNodeId(wall.to);

    if (u !== v) {
      const posU = nodes.get(u)!;
      const posV = nodes.get(v)!;

      const angleUtoV = Math.atan2(posV.z - posU.z, posV.x - posU.x);
      const angleVtoU = Math.atan2(posU.z - posV.z, posU.x - posV.x);

      adjacency.get(u)!.push({
        toNodeId: v,
        wallId: wall.id,
        angle: angleUtoV
      });

      adjacency.get(v)!.push({
        toNodeId: u,
        wallId: wall.id,
        angle: angleVtoU
      });
    }
  });

  // 2. Sort neighbors by angle
  nodes.forEach((_, u) => {
    const edges = adjacency.get(u) || [];
    edges.sort((a, b) => a.angle - b.angle);
  });

  // 3. Find Faces (Cycles)
  const visited = new Set<string>();
  const cycles: Position2D[][] = [];

  const getDirectedEdgeKey = (fromId: string, wallId: string) => `${fromId}:${wallId}`;

  // Iterate all possible directed edges
  nodes.forEach((_, u) => {
    const edges = adjacency.get(u) || [];
    edges.forEach(edge => {
      const startKey = getDirectedEdgeKey(u, edge.wallId);
      if (visited.has(startKey)) return;

      // Start traversing a new face
      const path: string[] = [u];
      let currNode = edge.toNodeId;
      let prevNode = u;
      let currWallId = edge.wallId;

      visited.add(startKey);

      // Traverse until we hit start or repeat
      while (currNode !== u) {
        path.push(currNode);
        const currEdges = adjacency.get(currNode)!;

        // Find the index of the "back edge" (from curr to prev using currWallId)
        const backEdgeIndex = currEdges.findIndex(e => e.wallId === currWallId);

        if (backEdgeIndex === -1) break; // Should not happen

        // Pick next neighbor in list (cycling backwards for Left Turn)
        // idx - 1 gives the "Left Turn" (smallest CCW cycle) in (X Right, Z Down) coords
        const nextIdx = (backEdgeIndex - 1 + currEdges.length) % currEdges.length;
        const nextEdge = currEdges[nextIdx];

        const nextKey = getDirectedEdgeKey(currNode, nextEdge.wallId);

        if (visited.has(nextKey)) {
             // We hit a visited edge but haven't closed the cycle to 'u'.
             // This implies we merged into an already visited path. Abort.
             break;
        }

        visited.add(nextKey);
        prevNode = currNode;
        currNode = nextEdge.toNodeId;
        currWallId = nextEdge.wallId;

        // Safety break
        if (path.length > 100) break;
      }

      if (currNode === u) {
        const vertices = path.map(id => nodes.get(id)!);
        cycles.push(vertices);
      }
    });
  });

  // 4. Calculate Areas and Filter
  const validPolygons: DetectedPolygon[] = [];

  cycles.forEach(vertices => {
     const area = calculatePolygonArea(vertices);

     // Filter out external face (negative area in standard shoelace if CCW is positive)
     // Internal faces (CCW) should have Positive area.

     if (area > 0.1) { // Min area 0.1 m^2
       validPolygons.push({ vertices, area });
     }
  });

  return validPolygons;
};

const calculatePolygonArea = (vertices: Position2D[]): number => {
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].z;
    area -= vertices[j].x * vertices[i].z;
  }
  return area / 2;
};

export const createRoomFromPolygon = (polygon: DetectedPolygon): {
  length: number;
  width: number;
  position: Position2D;
  vertices: Position2D[];
} => {
  const { vertices } = polygon;
  if (vertices.length === 0) {
      return { length: 0, width: 0, position: { x: 0, z: 0 }, vertices: [] };
  }

  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  vertices.forEach(v => {
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.z < minZ) minZ = v.z;
    if (v.z > maxZ) maxZ = v.z;
  });

  const length = maxX - minX;
  const widthVal = maxZ - minZ;

  const position = { x: minX, z: minZ };

  // Convert vertices to relative
  const relativeVertices = vertices.map(v => ({
    x: v.x - minX,
    z: v.z - minZ
  }));

  return {
    length,
    width: widthVal,
    position,
    vertices: relativeVertices
  };
};
