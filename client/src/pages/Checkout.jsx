import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { items, total, clear } = useCart();
  const nav = useNavigate();

  const [form, setForm] = useState({
    label: 'Home',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    country: 'India',
  });

  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({
          cropId: i._id,
          quantity: i.quantity,
        })),
        shippingAddress: form,
        paymentMethod: 'cod',
      });

      clear();

      nav('/dashboard', {
        state: {
          success: `Order ${data.order._id.slice(-6)} placed successfully.`,
        },
      });
    } catch (e) {
      setError(e.response?.data?.message || 'Could not place order');
    }
  };

  if (!items.length) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-5 text-3xl font-bold">Checkout</h1>

      <form className="card space-y-4" onSubmit={submit}>
        <h2 className="font-bold">Delivery address</h2>

        {[
          ['line1', 'Street address'],
          ['city', 'City'],
          ['state', 'State'],
          ['postalCode', 'PIN code'],
          ['phone', 'Phone'],
        ].map(([key, placeholder]) => (
          <input
            key={key}
            className="field"
            placeholder={placeholder}
            required
            value={form[key]}
            onChange={(e) =>
              setForm({
                ...form,
                [key]: e.target.value,
              })
            }
          />
        ))}

        <div className="flex justify-between border-t pt-4">
          <span>Total (COD)</span>
          <b>₹{total + (total >= 1000 ? 0 : 80)}</b>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button className="btn-primary w-full">
          Place order
        </button>
      </form>
    </div>
  );
}