import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RegisterPage from '../page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock the API request function
const mockRequest = vi.fn();
vi.mock('@/lib/api', () => ({
    default: {
        post: (...args: any[]) => mockRequest(...args),
    },
}));

// Setup QueryClient for React Query
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

describe('RegisterPage', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = createTestQueryClient();
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <RegisterPage />
            </QueryClientProvider>
        );
    };

    it('renders the register form correctly', () => {
        renderComponent();

        expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

        await waitFor(() => {
            expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
            expect(screen.getAllByText(/Password must be at least 6 characters/i)).toHaveLength(2);
        });
    });

    it('shows validation error for password mismatch', async () => {
        renderComponent();

        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password456' } });

        fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

        await waitFor(() => {
            expect(screen.getByText(/Passwords don't match/i)).toBeInTheDocument();
        });
    });

    it('submits the form successfully and redirects', async () => {
        renderComponent();

        // Axios returns data property
        mockRequest.mockResolvedValueOnce({ data: { success: true } });

        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

        await waitFor(() => {
            expect(mockRequest).toHaveBeenCalledWith('/auth/register', { email: 'test@example.com', password: 'password123' });
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    it('handles API errors', async () => {
        renderComponent();

        mockRequest.mockRejectedValueOnce(new Error('Email already exists'));

        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

        await waitFor(() => {
            expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
        });
    });
});
