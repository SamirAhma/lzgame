import { render, screen } from '@testing-library/react';
import GameCard from '../GameCard';
import { describe, it, expect } from 'vitest';

describe('GameCard', () => {
    const mockProps = {
        title: 'Test Game',
        description: 'This is a test game description',
        href: '/games/test',
        icon: <span>Icon</span>,
        scores: [
            { player: 'Player 1', score: 100, date: '2023-01-01', time: '12:00' },
            { player: 'Player 2', score: 90, date: '2023-01-02', time: '13:00' },
        ],
        tags: ['puzzle', 'strategy'],
        accentColor: 'cyan' as const,
        gradientFrom: 'cyan',
        gradientTo: 'purple',
    };

    it('renders game title and description', () => {
        render(<GameCard {...mockProps} />);
        expect(screen.getByText('Test Game')).toBeInTheDocument();
        expect(screen.getByText('This is a test game description')).toBeInTheDocument();
    });

    it('renders "Play Now" button', () => {
        render(<GameCard {...mockProps} />);
        expect(screen.getByText(/Play Now/i)).toBeInTheDocument();
    });

    it('renders ScoreCard with top scores', () => {
        render(<GameCard {...mockProps} />);
        expect(screen.getByText('Top 10 Scores')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('renders tags', () => {
        render(<GameCard {...mockProps} />);
        expect(screen.getByText('puzzle')).toBeInTheDocument();
        expect(screen.getByText('strategy')).toBeInTheDocument();
    });

    it('has correct link href', () => {
        render(<GameCard {...mockProps} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/games/test');
    });
});
