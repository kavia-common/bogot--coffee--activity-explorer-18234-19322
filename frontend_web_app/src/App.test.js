import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header brand', () => {
  render(<App />);
  const brand = screen.getByText(/Bogotá Cafés & Plans/i);
  expect(brand).toBeInTheDocument();
});
