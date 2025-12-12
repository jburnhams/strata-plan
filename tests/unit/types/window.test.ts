import { validateWindow, WINDOW_DEFAULTS } from '@/types/window';

describe('Window Type Validation', () => {
  test('validates width range', () => {
    // Valid width
    expect(
      validateWindow({ ...WINDOW_DEFAULTS, width: 1.2 }).isValid
    ).toBe(true);

    // Too narrow
    expect(
      validateWindow({ ...WINDOW_DEFAULTS, width: 0.2 }).isValid
    ).toBe(false);

    // Too wide
    expect(
      validateWindow({ ...WINDOW_DEFAULTS, width: 3.1 }).isValid
    ).toBe(false);
  });

  test('validates height range', () => {
    // Valid height
    expect(
      validateWindow({ ...WINDOW_DEFAULTS, height: 1.2 }).isValid
    ).toBe(true);

    // Too short
    expect(
      validateWindow({ ...WINDOW_DEFAULTS, height: 0.2 }).isValid
    ).toBe(false);

    // Too tall
    expect(
      validateWindow({ ...WINDOW_DEFAULTS, height: 2.6 }).isValid
    ).toBe(false);
  });

  test('validates sill height range', () => {
    // Valid sill height
    expect(
      validateWindow({ ...WINDOW_DEFAULTS, sillHeight: 0.9 }).isValid
    ).toBe(true);

    // Negative
    expect(
      validateWindow({ ...WINDOW_DEFAULTS, sillHeight: -0.1 }).isValid
    ).toBe(false);

    // Too high
    expect(
      validateWindow({ ...WINDOW_DEFAULTS, sillHeight: 1.6 }).isValid
    ).toBe(false);
  });

  test('validates against ceiling height', () => {
    const window = { ...WINDOW_DEFAULTS, height: 1.5, sillHeight: 1.0 }; // Top at 2.5m

    // Fits under ceiling
    expect(
        validateWindow(window, 2.6).isValid
    ).toBe(true);

    // Exceeds ceiling
    const result = validateWindow(window, 2.4);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Window exceeds ceiling height');
  });
});
