import React from 'react';
import { render } from '@testing-library/react';
import { FirstPersonControls } from '@/components/viewer/FirstPersonControls';
import { useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';

// Mock hooks
jest.mock('@react-three/fiber', () => ({
  useThree: jest.fn(),
  useFrame: jest.fn(),
}));

jest.mock('@/hooks/useFirstPerson', () => ({
  useFirstPerson: jest.fn(),
}));

// Mock PointerLockControls properly
// We use a mock variable we can change, or use jest.fn().mockImplementation
const mockPointerLockControls = jest.fn();

jest.mock('@react-three/drei', () => {
    // Require React inside the factory
    const React = require('react');
    return {
        PointerLockControls: React.forwardRef((props: any, ref: any) => {
           // Delegate to the mock for tracking calls or just use the implementation we want
           return mockPointerLockControls(props, ref);
        }),
    };
});

describe('FirstPersonControls', () => {
  let mockLock: jest.Mock;
  let mockUnlock: jest.Mock;
  let mockAddEventListener: jest.Mock;
  let mockRemoveEventListener: jest.Mock;

  beforeEach(() => {
    mockLock = jest.fn();
    mockUnlock = jest.fn();
    mockAddEventListener = jest.fn();
    mockRemoveEventListener = jest.fn();

    // Define what the mock component does when rendered
    mockPointerLockControls.mockImplementation((props, ref) => {
        if (ref) {
            ref.current = {
                lock: mockLock,
                unlock: mockUnlock,
                addEventListener: mockAddEventListener,
                removeEventListener: mockRemoveEventListener,
            };
        }
        return <div data-testid="pointer-lock-controls" />;
    });

    (useThree as jest.Mock).mockReturnValue({
      camera: {},
      gl: { domElement: document.createElement('canvas') },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when disabled', () => {
    const { queryByTestId } = render(
      <FirstPersonControls isEnabled={false} onExit={jest.fn()} />
    );
    expect(queryByTestId('pointer-lock-controls')).toBeNull();
  });

  it('renders PointerLockControls when enabled', () => {
    const { getByTestId } = render(
      <FirstPersonControls isEnabled={true} onExit={jest.fn()} />
    );
    expect(getByTestId('pointer-lock-controls')).toBeInTheDocument();
  });

  it('locks pointer when enabled', () => {
    render(<FirstPersonControls isEnabled={true} onExit={jest.fn()} />);
    // The useEffect calls lock immediately on mount if enabled
    expect(mockLock).toHaveBeenCalled();
  });

  it('unlocks pointer when disabled', () => {
    const { rerender } = render(
      <FirstPersonControls isEnabled={true} onExit={jest.fn()} />
    );

    rerender(<FirstPersonControls isEnabled={false} onExit={jest.fn()} />);
    expect(mockUnlock).toHaveBeenCalled();
  });

  it('calls onExit when unlocked via event', () => {
    const onExit = jest.fn();
    render(<FirstPersonControls isEnabled={true} onExit={onExit} />);

    // Simulate unlock event
    const unlockCalls = mockAddEventListener.mock.calls.filter(call => call[0] === 'unlock');
    expect(unlockCalls.length).toBeGreaterThan(0);

    const unlockCallback = unlockCalls[0][1];
    unlockCallback();

    expect(onExit).toHaveBeenCalled();
  });
});
