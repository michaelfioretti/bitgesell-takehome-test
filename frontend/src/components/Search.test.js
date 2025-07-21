import '@testing-library/jest-dom'
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Search from './Search';

// Mock useData context
const mockFetchItems = jest.fn();

jest.mock('../state/DataContext', () => ({
  useData: () => ({
    fetchItems: mockFetchItems,
  }),
}));

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Search component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input and button', () => {
    renderWithRouter(<Search />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    renderWithRouter(<Search />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(input.value).toBe('test');
  });

  it('calls fetchItems and displays results on search', async () => {
    mockFetchItems.mockResolvedValueOnce([
      { id: 1, name: 'Item One' },
      { id: 2, name: 'Item Two' },
    ]);
    renderWithRouter(<Search />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'item' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(mockFetchItems).toHaveBeenCalledWith('item');
      expect(screen.getByText('Item One')).toBeInTheDocument();
      expect(screen.getByText('Item Two')).toBeInTheDocument();
    });
  });

  it('shows no results if fetchItems rejects', async () => {
    mockFetchItems.mockRejectedValueOnce(new Error('Failed'));
    renderWithRouter(<Search />);
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'fail' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(mockFetchItems).toHaveBeenCalledWith('fail');
      // No list items should be rendered
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });
  });

  it('renders links to items', async () => {
    mockFetchItems.mockResolvedValueOnce([
      { id: 42, name: 'The Answer' },
    ]);
    renderWithRouter(<Search />);
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'answer' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      const link = screen.getByRole('link', { name: 'The Answer' });
      expect(link).toHaveAttribute('href', '/items/42');
    });
  });
});
