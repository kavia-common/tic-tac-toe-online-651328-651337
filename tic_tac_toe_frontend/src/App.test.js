import { render, screen } from '@testing-library/react';
import App from './App';

test('renders landing page and mode buttons', () => {
  render(<App />);
  expect(screen.getByText(/Welcome to Tic Tac Toe/i)).toBeInTheDocument();
  expect(screen.getByText(/Play vs Computer/i)).toBeInTheDocument();
  expect(screen.getByText(/Play vs Human/i)).toBeInTheDocument();
});
