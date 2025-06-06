import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewBusinessPage from '../pages/form';

// ✅ Mock fetch globally
global.fetch = jest.fn();

// ✅ Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      isFallback: false,
    };
  },
}));

// ✅ Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { toast } from 'react-toastify';

describe('NewBusinessPage - Validation Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows error when required fields are empty', async () => {
    render(<NewBusinessPage />);
    const submitBtn = screen.getByRole('button', { name: /submit/i });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/this field is required/i).length).toBeGreaterThan(0);
    });
  });

  test('shows API error for duplicate business name', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Business name already exists' }),
    });

    render(<NewBusinessPage />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Acme' } });
    fireEvent.change(screen.getByLabelText(/owner/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: 'Street 1' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/business name already exists/i)).toBeInTheDocument();
    });
  });

  test('shows success message after successful form submission', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    render(<NewBusinessPage />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'New Biz' } });
    fireEvent.change(screen.getByLabelText(/owner/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: 'Park Ave' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Business created successfully!');
    });
  });
});
