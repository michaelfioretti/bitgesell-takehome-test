import React, { useCallback, useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import Search from '../components/Search';
import LazyLoadItems from '../components/LazyLoadItems';

function Items() {
  const { items, fetchItems, setItems } = useData();

  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false)

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || isNextPageLoading) return;

    setIsNextPageLoading(true);
    const newItems = await fetchItems(null, null, items.length);

    if (newItems.length < 10) {
      setHasNextPage(false);
    }

    setItems(prevItems => [...prevItems, ...newItems]);
    setIsNextPageLoading(false);
  })

  return (
    <div>
      <h1>Items</h1>
      <Search />
      <p>Click on an item to view details.</p>
      <p>Search for items by name.</p>
      <LazyLoadItems
        hasNextPage={hasNextPage}
        isNextPageLoading={isNextPageLoading}
        items={items}
        loadNextPage={loadNextPage}
      />
    </div>
  );
}

export default Items;
