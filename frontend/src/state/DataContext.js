import React, { createContext, useCallback, useContext, useState } from 'react';
import { API_URL } from '../constants';

const DataContext = createContext();
const DEFAULT_LIMIT = 10

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [totalItemCount, setTotalItemCount] = useState(0)

  const fetchItems = useCallback(async (itemName = null, limit = null, offset = null) => {
    const params = new URLSearchParams();

    params.append('limit', limit || DEFAULT_LIMIT)

    if (itemName) {
      params.append('q', itemName);
    }

    if (offset) {
      params.append('offset', offset);
    }

    const res = await fetch(`${API_URL}?${params.toString()}`);
    const json = await res.json();

    if (!totalItemCount) {
      setTotalItemCount(json.totalCount)
    }

    return json.data
  }, []);

  return (
    <DataContext.Provider value={{ items, fetchItems, setItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
