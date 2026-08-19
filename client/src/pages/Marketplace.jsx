import { useEffect, useState } from 'react';
import api from '../lib/api';
import CropCard from '../components/CropCard';

export default function Marketplace() {
  const [data, setData] = useState({
    items: [],
    total: 0,
  });

  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    q: '',
    category: '',
    sort: 'newest',
    limit: 100,
  });

  const loadCrops = async () => {
    try {
      setLoading(true);

      const response = await api.get('/crops', {
        params: filters,
      });

      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCrops();
    }, 250);

    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <>
      <div className="mb-7">
        <h1 className="text-3xl font-bold">Marketplace</h1>

        <p className="text-slate-600">
          Seasonal produce, directly from local farms.
        </p>

        {!loading && (
          <p className="mt-1 text-sm text-slate-500">
            {data.total} products found
          </p>
        )}
      </div>

      <div className="mb-7 grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-3">
        <input
          className="field"
          placeholder="Search crops..."
          value={filters.q}
          onChange={(event) =>
            setFilters({
              ...filters,
              q: event.target.value,
            })
          }
        />

        <select
          className="field"
          value={filters.category}
          onChange={(event) =>
            setFilters({
              ...filters,
              category: event.target.value,
            })
          }
        >
          <option value="">All categories</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Fruits">Fruits</option>
          <option value="Grains">Grains</option>
          <option value="Pulses">Pulses</option>
          <option value="Spices">Spices</option>
        </select>

        <select
          className="field"
          value={filters.sort}
          onChange={(event) =>
            setFilters({
              ...filters,
              sort: event.target.value,
            })
          }
        >
          <option value="newest">Newest First</option>
          <option value="rating_desc">Top Rated</option>
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading && <p>Finding fresh produce...</p>}

      {!loading && data.items.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((crop) => (
            <CropCard key={crop._id} crop={crop} />
          ))}
        </div>
      )}

      {!loading && !data.items.length && (
        <div className="card text-center text-slate-500">
          No products match your search.
        </div>
      )}
    </>
  );
}