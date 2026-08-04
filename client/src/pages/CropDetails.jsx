import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { useCart } from '../context/CartContext';

export default function CropDetails() {
  const { id } = useParams();
  const [data, setData] = useState();
  const { add } = useCart();

  useEffect(() => {
    api.get(`/crops/${id}`).then((r) => setData(r.data));
  }, [id]);

  if (!data) {
    return <p>Loading crop…</p>;
  }

  const { crop, reviews } = data;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <img
        className="h-96 w-full rounded-2xl object-cover"
        src={
          crop.images?.[0] ||
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
        }
        alt={crop.name}
      />

      <div>
        <p className="font-semibold text-leaf">{crop.category}</p>

        <h1 className="mt-1 text-4xl font-bold">{crop.name}</h1>

        <p className="mt-3 text-slate-600">
          {crop.description}
        </p>

        <p className="mt-5 text-3xl font-bold text-forest">
          ₹{crop.price}
          <span className="text-base font-normal text-slate-500">
            {' '}
            / {crop.unit}
          </span>
        </p>

        <p className="mt-2 text-sm">
          Sold by <b>{crop.farmer?.farmName || crop.farmer?.name}</b> ·{' '}
          {crop.quantity} {crop.unit} available
        </p>

        <button
          className="btn-primary mt-6"
          disabled={!crop.quantity}
          onClick={() => add(crop)}
        >
          {crop.quantity ? 'Add to cart' : 'Sold out'}
        </button>

        <section className="mt-10 border-t pt-5">
          <h2 className="text-xl font-bold">
            Reviews ({crop.rating?.count || 0})
          </h2>

          {reviews.length ? (
            reviews.map((r) => (
              <div key={r._id} className="mt-3 text-sm">
                <b>{r.buyer?.name}</b> · {'★'.repeat(r.rating)}
                <p className="text-slate-600">
                  {r.comment}
                </p>
              </div>
            ))
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              No reviews yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}