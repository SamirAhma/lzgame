import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LoginPage from '../page';
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

describe('LoginPage', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = createTestQueryClient();
        vi.clearAllMocks();
        localStorage.clear();
    });

    const renderComponent = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <LoginPage />
            </QueryClientProvider>
        );
    };

    it('renders the login form correctly', () => {
        renderComponent();

        expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
            expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
        });
    });

    it('submits the form successfully and redirects', async () => {
        renderComponent();

        const mockToken = 'fake-jwt-token';
        // Axios returns an object with a data property
        mockRequest.mockResolvedValueOnce({ data: { access_token: mockToken, refresh_token: 'fake-refresh' } });

        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(mockRequest).toHaveBeenCalledWith('/auth/login', { email: 'test@example.com', password: 'password123' });
            expect(localStorage.getItem('token')).toBe(mockToken);
            expect(mockPush).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('handles API errors', async () => {
        renderComponent();

        mockRequest.mockRejectedValueOnce(new Error('Invalid credentials'));

        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });

        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
        });
    });
});
