import { render, screen } from '@testing-library/react';
import App from './App';

// Smoke test: the app starts and the home page offers each engine's dashboard.
test('renders the home page with an engine button for each dashboard', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /quonkboard/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sphinx/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /prometheus/i })).toBeInTheDocument();
});
