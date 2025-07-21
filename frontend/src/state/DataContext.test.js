import React from 'react';
import { render, act } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';
const API_URL = require('../constants').API_URL;
const DEFAULT_LIMIT = require('../constants').DEFAULT_LIMIT;

global.fetch = jest.fn();

describe('DataContext', () => {
  it('fetchItems fetches from API with default params', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ data: ['item1', 'item2'], totalCount: 2 }),
    });
    let result;
    function Test() {
      const { fetchItems } = useData();
      React.useEffect(() => {
        fetchItems().then(data => { result = data; });
      }, []);
      return null;
    }
    await act(async () => {
      render(
        <DataProvider>
          <Test />
        </DataProvider>
      );
    });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`${API_URL}?limit=${DEFAULT_LIMIT}`));
    expect(result).toEqual(['item1', 'item2']);
  });

  it('fetchItems includes itemName, limit, and offset in URL', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ data: ['itemA'], totalCount: 1 }),
    });
    let result;
    function Test() {
      const { fetchItems } = useData();
      React.useEffect(() => {
        fetchItems('foo', 5, 10).then(data => { result = data; });
      }, []);
      return null;
    }
    await act(async () => {
      render(
        <DataProvider>
          <Test />
        </DataProvider>
      );
    });
    const url = fetch.mock.calls[0][0];
    expect(url).toContain('q=foo');
    expect(url).toContain('limit=5');
    expect(url).toContain('offset=10');
    expect(result).toEqual(['itemA']);
  });

  it('fetchItems sets totalItemCount only once', async () => {
    fetch
      .mockResolvedValueOnce({
        json: async () => ({ data: ['a'], totalCount: 42 }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ data: ['b'], totalCount: 99 }),
      });
    let fetchItemsFn;
    function Grabber() {
      fetchItemsFn = useData().fetchItems;
      return null;
    }
    render(
      <DataProvider>
        <Grabber />
      </DataProvider>
    );
    await act(async () => {
      await fetchItemsFn();
      await fetchItemsFn();
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('fetchItems propagates fetch errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    let error;
    function Test() {
      const { fetchItems } = useData();
      React.useEffect(() => {
        fetchItems().catch(e => { error = e; });
      }, []);
      return null;
    }
    await act(async () => {
      render(
        <DataProvider>
          <Test />
        </DataProvider>
      );
    });
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Network error');
  });
})
