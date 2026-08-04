import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CropCard({ crop }) {
  const { add } = useCart();

  return (
    <article className="card flex flex-col overflow-hidden p-0">
      <img
        className="h-44 w-full object-cover"
        src={
          crop.images?.[0] ||
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
        }
        alt={crop.name}
      />

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between">
          <Link
            className="text-lg font-bold hover:text-forest"
            to={`/crops/${crop._id}`}
          >
            {crop.name}
          </Link>

          <Heart size={18} className="text-slate-400" />
        </div>

        <p className="mb-3 text-sm text-slate-500">
          {crop.farmer?.farmName || crop.farmer?.name || 'Local farmer'} ·{' '}
          <MapPin className="inline" size={13} />
          {crop.location?.district || 'India'}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-forest">
            ₹{crop.price}
            <small className="font-normal text-slate-500">
              /{crop.unit}
            </small>
          </span>

          <button
            className="btn-primary text-sm"
            disabled={!crop.quantity}
            onClick={() => add(crop)}
          >
            {crop.quantity ? 'Add' : 'Sold out'}
          </button>
        </div>
      </div>
    </article>
  );
}