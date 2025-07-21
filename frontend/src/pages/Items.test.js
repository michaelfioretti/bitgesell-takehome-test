import React from 'react';
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react';
import Items from './Items';
import { useData } from '../state/DataContext';

jest.mock('../components/Search', () => () => <div data-testid="mock-search" />);
jest.mock('../components/LazyLoadItems', () => () => <div data-testid="mock-lazy-load" />);

// Mock useData
jest.mock('../state/DataContext', () => ({
  useData: jest.fn(),
}));

describe('Items component', () => {
  const mockFetchItems = jest.fn();
  const mockSetItems = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useData.mockReturnValue({
      items: [],
      fetchItems: mockFetchItems,
      setItems: mockSetItems,
    });
  });

  it('renders static content and subcomponents', () => {
    render(<Items />);

    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Click on an item to view details.')).toBeInTheDocument();
    expect(screen.getByText('Search for items by name.')).toBeInTheDocument();
    expect(screen.getByTestId('mock-search')).toBeInTheDocument();
    expect(screen.getByTestId('mock-lazy-load')).toBeInTheDocument();
  });
});
