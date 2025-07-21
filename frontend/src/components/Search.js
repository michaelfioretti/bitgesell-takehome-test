import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../state/DataContext';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { fetchItems } = useData();

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setResults([])
    setLoading(true);

    fetchItems(query).then((data) => {
      setResults(data)
    }).catch((err) => {
      setResults([])
    })

    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      <ul>
        {loading ? 'Searching...' : ''}
        {results.map(item => (
          <li key={item.id}>
            <Link to={'/items/' + item.id}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Search;
