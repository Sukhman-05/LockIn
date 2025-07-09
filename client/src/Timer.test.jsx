import { render, screen, fireEvent, act } from '@testing-library/react';
import Timer from './Timer';

test('renders Timer and shows Locked In session started on start', () => {
  render(<Timer />);
  expect(screen.getByText(/Focus Session/i)).toBeInTheDocument();
  const startBtn = screen.getByText(/Start/i);
  act(() => {
    fireEvent.click(startBtn);
  });
  expect(screen.getByText(/Locked In session started/i)).toBeInTheDocument();
}); 