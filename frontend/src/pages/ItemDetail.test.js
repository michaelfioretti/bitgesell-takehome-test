import React from 'react';
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ItemDetail from './ItemDetail';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ItemDetail component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRoute = (id) => {
    render(
      <MemoryRouter initialEntries={[`/items/${id}`]}>
        <Routes>
          <Route path="/items/:id" element={<ItemDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading initially', () => {
    global.fetch = jest.fn(() => new Promise(() => {})); // never resolves
    renderWithRoute('123');
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('fetches and displays item details', async () => {
    const mockItem = {
      name: 'Sample Item',
      category: 'Books',
      price: 19.99,
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockItem),
      })
    );

    renderWithRoute('123');

    await waitFor(() => {
      expect(screen.getByText(mockItem.name)).toBeInTheDocument();
    });
  });

  it('navigates to home on fetch error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    );

    renderWithRoute('999');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('navigates to home on network failure', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

    renderWithRoute('error');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
