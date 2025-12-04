import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { useRouter } from 'next/navigation';
import BackButton from '../BackButton';

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

describe('BackButton', () => {
    const mockBack = vi.fn();
    const mockUseRouter = useRouter as Mock;

    beforeEach(() => {
        mockBack.mockClear();
        mockUseRouter.mockReturnValue({
            back: mockBack,
        });
    });

    it('renders the back button with correct text', () => {
        render(<BackButton />);
        const button = screen.getByRole('button', { name: /go back to previous page/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('← Back');
    });

    it('calls router.back() when clicked', () => {
        render(<BackButton />);
        const button = screen.getByRole('button', { name: /go back to previous page/i });

        fireEvent.click(button);

        expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('applies custom className when provided', () => {
        const customClass = 'custom-test-class';
        render(<BackButton className={customClass} />);
        const button = screen.getByRole('button', { name: /go back to previous page/i });

        expect(button).toHaveClass(customClass);
    });

    it('has proper styling classes', () => {
        render(<BackButton />);
        const button = screen.getByRole('button', { name: /go back to previous page/i });

        expect(button).toHaveClass('px-4');
        expect(button).toHaveClass('py-2');
        expect(button).toHaveClass('bg-slate-800');
        expect(button).toHaveClass('hover:bg-slate-700');
        expect(button).toHaveClass('text-slate-100');
        expect(button).toHaveClass('rounded-lg');
        expect(button).toHaveClass('transition-colors');
    });
});
