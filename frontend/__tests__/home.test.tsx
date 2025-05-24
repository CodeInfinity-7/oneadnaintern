import { render, screen } from '@testing-library/react';
import Home from '../pages/index';

test('renders heading', () => {
  render(<Home />);
  expect(screen.getByRole('heading', { name: /Hello OnePaySlip/i })).toBeInTheDocument();
});
