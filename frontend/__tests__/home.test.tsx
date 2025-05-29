import { render, screen, waitFor } from '@testing-library/react';
import Home from '../pages/index';
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]), // or your mock data here
  })
) as jest.Mock;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
  }),
}));





test('renders heading', async () => {
  render(<Home />);
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /All Businesses/i })).toBeInTheDocument();
  });
});
