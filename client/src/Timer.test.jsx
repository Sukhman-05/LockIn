import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Timer from './Timer';

// Mock axios
jest.mock('axios');

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Timer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Timer with default focus time', () => {
    renderWithProviders(<Timer />);
    expect(screen.getByText(/Focus/i)).toBeInTheDocument();
    expect(screen.getByText(/25:00/i)).toBeInTheDocument();
  });

  test('starts timer when start button is clicked', async () => {
    renderWithProviders(<Timer />);
  const startBtn = screen.getByText(/Start/i);
    
  act(() => {
    fireEvent.click(startBtn);
  });
    
    expect(screen.getByText(/Running/i)).toBeInTheDocument();
  expect(screen.getByText(/Locked In session started/i)).toBeInTheDocument();
  });

  test('pauses timer when pause button is clicked', () => {
    renderWithProviders(<Timer />);
    const startBtn = screen.getByText(/Start/i);
    const pauseBtn = screen.getByText(/Pause/i);
    
    act(() => {
      fireEvent.click(startBtn);
    });
    
    act(() => {
      fireEvent.click(pauseBtn);
    });
    
    expect(screen.getByText(/Ready/i)).toBeInTheDocument();
  });

  test('resets timer when reset button is clicked', () => {
    renderWithProviders(<Timer />);
    const startBtn = screen.getByText(/Start/i);
    const resetBtn = screen.getByText(/Reset/i);
    
    act(() => {
      fireEvent.click(startBtn);
    });
    
    act(() => {
      fireEvent.click(resetBtn);
    });
    
    expect(screen.getByText(/25:00/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready/i)).toBeInTheDocument();
  });

  test('shows settings panel when settings button is clicked', () => {
    renderWithProviders(<Timer />);
    const settingsBtn = screen.getByText(/⚙️ Settings/i);
    
    act(() => {
      fireEvent.click(settingsBtn);
    });
    
    expect(screen.getByText(/Timer Settings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Focus Duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Break Duration/i)).toBeInTheDocument();
  });

  test('allows customizing focus and break durations', () => {
    renderWithProviders(<Timer />);
    const settingsBtn = screen.getByText(/⚙️ Settings/i);
    
    act(() => {
      fireEvent.click(settingsBtn);
    });
    
    const focusInput = screen.getByLabelText(/Focus Duration/i);
    const breakInput = screen.getByLabelText(/Break Duration/i);
    
    act(() => {
      fireEvent.change(focusInput, { target: { value: '30' } });
      fireEvent.change(breakInput, { target: { value: '10' } });
    });
    
    expect(focusInput.value).toBe('30');
    expect(breakInput.value).toBe('10');
  });
}); 