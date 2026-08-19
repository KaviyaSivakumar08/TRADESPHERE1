import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CropCard({ crop }) {
  const { add } = useCart();

  const isAvailable =
    crop.status === 'active' && Number(crop.quantity) > 0;

  const averageRating = Number(crop.rating?.average || 0);
  const totalRatings = Number(crop.rating?.count || 0);

  const handleAddToCart = () => {
    if (!isAvailable) return;

    add(crop);
  };

  return (
    <article className="card flex flex-col overflow-hidden p-0">
      <div className="relative">
        <img
          className="h-44 w-full object-cover"
          src={
            crop.images?.[0] ||
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
          }
          alt={crop.name}
        />

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white ${
            isAvailable ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between gap-3">
          <Link
            className="text-lg font-bold hover:text-forest"
            to={`/crops/${crop._id}`}
          >
            {crop.name}
          </Link>

          
        </div>

        <p className="mb-2 text-sm text-slate-500">
          {crop.farmer?.farmName ||
            crop.farmer?.name ||
            'Local farmer'}{' '}
          · <MapPin className="inline" size={13} />
          {crop.location?.district || 'India'}
        </p>

        {/* Public product rating */}
        <div className="mb-3 flex items-center gap-1">
          <Star
            size={17}
            className="text-yellow-500"
            fill="currentColor"
          />

          <span className="text-sm font-semibold text-slate-700">
            {averageRating.toFixed(1)}
          </span>

          <span className="text-sm text-slate-500">
            ({totalRatings}{' '}
            {totalRatings === 1 ? 'rating' : 'ratings'})
          </span>
        </div>

        <p className="mb-3 text-sm text-slate-500">
          Stock: {crop.quantity} {crop.unit}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="font-bold text-forest">
            ₹{crop.price}
            <small className="font-normal text-slate-500">
              /{crop.unit}
            </small>
          </span>

          <button
            className={`btn text-sm ${
              isAvailable
                ? 'bg-forest text-white hover:bg-leaf'
                : 'cursor-not-allowed bg-slate-200 text-slate-500'
            }`}
            disabled={!isAvailable}
            onClick={handleAddToCart}
          >
            {isAvailable ? 'Add to Cart' : 'Not Available'}
          </button>
        </div>
      </div>
    </article>
  );
}