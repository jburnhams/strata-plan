import { validateDoor, DOOR_DEFAULTS, DoorType } from '@/types/door';

describe('Door Type Validation', () => {
  test('validates single door width range', () => {
    // Valid single door
    expect(
      validateDoor({ ...DOOR_DEFAULTS, width: 0.9, type: 'single' }).isValid
    ).toBe(true);

    // Too narrow
    expect(
      validateDoor({ ...DOOR_DEFAULTS, width: 0.4, type: 'single' }).isValid
    ).toBe(false);

    // Too wide
    expect(
      validateDoor({ ...DOOR_DEFAULTS, width: 1.6, type: 'single' }).isValid
    ).toBe(false);
  });

  test('validates double door width range', () => {
    // Valid double door
    expect(
      validateDoor({ ...DOOR_DEFAULTS, width: 1.8, type: 'double' }).isValid
    ).toBe(true);

    // Too narrow
    expect(
      validateDoor({ ...DOOR_DEFAULTS, width: 0.9, type: 'double' }).isValid
    ).toBe(false);

    // Too wide
    expect(
      validateDoor({ ...DOOR_DEFAULTS, width: 2.6, type: 'double' }).isValid
    ).toBe(false);
  });

  test('validates other door types width range', () => {
    const otherTypes: DoorType[] = ['sliding', 'pocket', 'bifold'];

    otherTypes.forEach(type => {
      // Valid
      expect(
        validateDoor({ ...DOOR_DEFAULTS, width: 2.0, type }).isValid
      ).toBe(true);

       // Too narrow
      expect(
        validateDoor({ ...DOOR_DEFAULTS, width: 0.4, type }).isValid
      ).toBe(false);

       // Too wide
      expect(
        validateDoor({ ...DOOR_DEFAULTS, width: 3.1, type }).isValid
      ).toBe(false);
    })
  });

  test('validates height range', () => {
    // Valid height
    expect(
      validateDoor({ ...DOOR_DEFAULTS, height: 2.1 }).isValid
    ).toBe(true);

    // Too short
    expect(
      validateDoor({ ...DOOR_DEFAULTS, height: 1.7 }).isValid
    ).toBe(false);

    // Too tall
    expect(
      validateDoor({ ...DOOR_DEFAULTS, height: 2.6 }).isValid
    ).toBe(false);
  });

  test('validates position range', () => {
    // Valid position
    expect(
      validateDoor({ ...DOOR_DEFAULTS, position: 0.5 }).isValid
    ).toBe(true);

    // Too low
    expect(
      validateDoor({ ...DOOR_DEFAULTS, position: -0.1 }).isValid
    ).toBe(false);

    // Too high
    expect(
      validateDoor({ ...DOOR_DEFAULTS, position: 1.1 }).isValid
    ).toBe(false);
  });

  test('returns specific error messages', () => {
      const result = validateDoor({ ...DOOR_DEFAULTS, height: 3.0 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Door height must be between 1.8m and 2.5m');
  });
});
