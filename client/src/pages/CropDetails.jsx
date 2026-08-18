import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';

import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function CropDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { add } = useCart();

  const [data, setData] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProduct = async () => {
    try {
      const productResponse = await api.get(`/crops/${id}`);
      const productData = productResponse.data;

      setData(productData);

      if (!user) {
        setCanReview(false);
        setAlreadyReviewed(false);
        return;
      }

      // Check whether this logged-in buyer already reviewed this product.
      const hasReviewed = productData.reviews.some((review) => {
        const reviewerId = review.buyer?._id || review.buyer;

        return reviewerId?.toString() === user.id?.toString();
      });

      setAlreadyReviewed(hasReviewed);

      // Check whether this buyer has received this product.
      const ordersResponse = await api.get('/orders');

      const hasDeliveredProduct = ordersResponse.data.items.some((order) => {
        const buyerId = order.buyer?._id || order.buyer;

        const isMyOrder =
          buyerId?.toString() === user.id?.toString();

        const productDelivered = order.items?.some((item) => {
          const itemCropId = item.crop?._id || item.crop;

          return (
            itemCropId?.toString() === id &&
            item.sellerStatus === 'delivered'
          );
        });

        return isMyOrder && productDelivered;
      });

      // Review form is enabled only when delivered and not already reviewed.
      setCanReview(hasDeliveredProduct && !hasReviewed);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Could not load product.',
      );
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id, user?.id]);

  const submitReview = async (event) => {
    event.preventDefault();

    if (!rating) {
      setMessage('Please choose a star rating.');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('');

      await api.post(`/crops/${id}/reviews`, {
        rating,
        comment,
      });

      // Immediately disable rating after a successful review.
      setCanReview(false);
      setAlreadyReviewed(true);
      setRating(0);
      setComment('');

      setMessage('Thank you!!');

      await loadProduct();
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Could not save review.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!data) {
    return <p>Loading product...</p>;
  }

  const { crop, reviews } = data;

  const isAvailable =
    crop.status === 'active' && Number(crop.quantity) > 0;

  const location = [
    crop.location?.village,
    crop.location?.district,
    crop.location?.state,
  ]
    .filter(Boolean)
    .join(', ');

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
        <div className="flex items-center justify-between gap-4">
          <p className="font-semibold text-leaf">{crop.category}</p>

          <span
            className={`rounded-full px-3 py-1 text-sm font-bold text-white ${
              isAvailable ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <h1 className="mt-2 text-4xl font-bold">{crop.name}</h1>

        <p className="mt-3 text-slate-600">{crop.description}</p>

        <p className="mt-5 text-3xl font-bold text-forest">
          ₹{crop.price}
          <span className="text-base font-normal text-slate-500">
            {' '}
            / {crop.unit}
          </span>
        </p>

        <p className="mt-2 text-sm text-slate-600">
          Sold by{' '}
          <b>{crop.farmer?.farmName || crop.farmer?.name}</b>
        </p>

        {location && (
          <p className="mt-2 flex items-center gap-1 text-sm text-slate-600">
            <MapPin size={16} className="text-forest" />
            {location}
          </p>
        )}

        <p className="mt-2 text-sm text-slate-600">
          Stock: {crop.quantity} {crop.unit}
        </p>

        <button
          className={`btn mt-6 ${
            isAvailable
              ? 'bg-forest text-white hover:bg-leaf'
              : 'cursor-not-allowed bg-slate-200 text-slate-500'
          }`}
          disabled={!isAvailable}
          onClick={() => add(crop)}
        >
          {isAvailable ? 'Add to Cart' : 'Not Available'}
        </button>

        <section className="mt-10 border-t pt-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Customer Reviews</h2>

            <span className="text-sm text-slate-600">
              ★ {Number(crop.rating?.average || 0).toFixed(1)} (
              {crop.rating?.count || 0} ratings)
            </span>
          </div>

          {/* Enabled only after product delivery */}
          {canReview && (
            <form
              className="mt-5 rounded-xl bg-cream p-4"
              onSubmit={submitReview}
            >
              <h3 className="font-bold">
                Rate your delivered product
              </h3>

              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    aria-label={`${star} stars`}
                    onClick={() => setRating(star)}
                    className="text-yellow-500"
                  >
                    <Star
                      size={30}
                      fill={star <= rating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>

              <textarea
                className="field mt-3"
                rows="3"
                placeholder="Write your review (optional)"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />

              <button
                className="btn-primary mt-3"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Rating & Review'}
              </button>
            </form>
          )}

          {/* Visible but disabled after submitting a review */}
          {alreadyReviewed && (
            <div className="mt-5 rounded-xl bg-green-100 p-4">
              <p className="font-bold text-green-800">
                You have already rated this product.
              </p>

              <button
                className="btn mt-3 cursor-not-allowed bg-slate-300 text-slate-600"
                disabled
              >
                Submitted
              </button>
            </div>
          )}

          {user && !canReview && !alreadyReviewed && (
            <p className="mt-4 text-sm text-slate-500">
              Share your experience after delivery.
            </p>
          )}

          <div className="mt-5 space-y-4">
            {reviews.length ? (
              reviews.map((review) => (
                <div className="border-b pb-4" key={review._id}>
                  <div className="flex items-center justify-between">
                    <b>{review.buyer?.name || 'Buyer'}</b>

                    <span className="font-semibold text-yellow-500">
                      {'★'.repeat(review.rating)}
                      <span className="text-slate-300">
                        {'★'.repeat(5 - review.rating)}
                      </span>
                    </span>
                  </div>

                  {review.comment && (
                    <p className="mt-1 text-sm text-slate-600">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No reviews yet.
              </p>
            )}
          </div>
        </section>

        {message && (
          <p className="mt-4 rounded-lg bg-green-100 p-3 text-sm text-green-800">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}