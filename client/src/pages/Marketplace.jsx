import { useEffect, useState } from 'react';
import api from '../lib/api';
import CropCard from '../components/CropCard';

export default function Marketplace() {
  const [data, setData] = useState({ items: [] });

  const [filters, setFilters] = useState({
    q: '',
    category: '',
    sort: 'newest',
  });

  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    try {
      const response = await api.get('/crops', {
        params: filters,
      });

      setData(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 250);

    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <>
      <div className="mb-7">
        <h1 className="text-3xl font-bold">Marketplace</h1>

        <p className="text-slate-600">
          Seasonal produce, directly from local farms.
        </p>
      </div>

      <div className="mb-7 grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-3">
        <input
          className="field"
          placeholder="Search crops…"
          value={filters.q}
          onChange={(e) =>
            setFilters({
              ...filters,
              q: e.target.value,
            })
          }
        />

        <select
          className="field"
          value={filters.category}
          onChange={(e) =>
            setFilters({
              ...filters,
              category: e.target.value,
            })
          }
        >
          <option value="">All categories</option>
          <option>Vegetables</option>
          <option>Fruits</option>
          <option>Grains</option>
          <option>Pulses</option>
          <option>Spices</option>
        </select>

        <select
          className="field"
          value={filters.sort}
          onChange={(e) =>
            setFilters({
              ...filters,
              sort: e.target.value,
            })
          }
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {loading ? (
        <p>Finding fresh produce…</p>
      ) : data.items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((crop) => (
            <CropCard key={crop._id} crop={crop} />
          ))}
        </div>
      ) : (
        <div className="card text-center text-slate-500">
          No crops match your search yet.
        </div>
      )}
    </>
  );
}