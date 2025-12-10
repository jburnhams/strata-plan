import { worldToScreen, screenToWorld, ViewportTransform } from '../../../src/utils/coordinates';
import { PIXELS_PER_METER } from '../../../src/constants/defaults';

describe('Coordinate Utilities', () => {
  const transform: ViewportTransform = {
    zoom: 1.0,
    pan: { x: 0, z: 0 },
    width: 1000,
    height: 800,
  };

  it('converts world origin to screen center when pan is 0', () => {
    const worldPos = { x: 0, z: 0 };
    const screenPos = worldToScreen(worldPos, transform);

    expect(screenPos.x).toBe(500); // width / 2
    expect(screenPos.y).toBe(400); // height / 2
  });

  it('converts world coordinates correctly with scale', () => {
    const worldPos = { x: 2, z: 3 }; // 2m right, 3m down
    const screenPos = worldToScreen(worldPos, transform);

    const expectedX = 500 + (2 * PIXELS_PER_METER);
    const expectedY = 400 + (3 * PIXELS_PER_METER);

    expect(screenPos.x).toBe(expectedX);
    expect(screenPos.y).toBe(expectedY);
  });

  it('accounts for pan offset', () => {
    const transformWithPan = { ...transform, pan: { x: 100, z: -50 } };
    const worldPos = { x: 0, z: 0 };
    const screenPos = worldToScreen(worldPos, transformWithPan);

    expect(screenPos.x).toBe(600); // 500 + 100
    expect(screenPos.y).toBe(350); // 400 - 50
  });

  it('accounts for zoom level', () => {
    const transformWithZoom = { ...transform, zoom: 2.0 };
    const worldPos = { x: 1, z: 1 };
    const screenPos = worldToScreen(worldPos, transformWithZoom);

    // 1m * 50px * 2 = 100px offset
    expect(screenPos.x).toBe(600);
    expect(screenPos.y).toBe(500);
  });

  it('screenToWorld is inverse of worldToScreen', () => {
    const worldPos = { x: 1.5, z: -2.5 };
    const screenPos = worldToScreen(worldPos, transform);
    const convertedBack = screenToWorld(screenPos.x, screenPos.y, transform);

    expect(convertedBack.x).toBeCloseTo(worldPos.x);
    expect(convertedBack.z).toBeCloseTo(worldPos.z);
  });
});
