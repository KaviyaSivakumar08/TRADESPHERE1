import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function CropForm() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Vegetables',
    price: '',
    unit: 'kg',
    quantity: '',
    images: '',
    organic: false,
    location: {
      district: '',
      state: '',
    },
  });

  const [error, setError] = useState('');

  const set = (key, value) =>
    setForm({
      ...form,
      [key]: value,
    });

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/crops', {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
        images: form.images
          ? form.images.split(',').map((x) => x.trim())
          : [],
      });

      nav('/dashboard');
    } catch (e) {
      setError(
        e.response?.data?.message || 'Could not create listing'
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-5 text-3xl font-bold">
        List a crop
      </h1>

      <form className="card grid gap-4" onSubmit={submit}>
        {[
          ['name', 'Crop name'],
          ['price', 'Price per unit'],
          ['quantity', 'Available quantity'],
          ['images', 'Image URLs (comma separated)'],
        ].map(([key, placeholder]) => (
          <input
            key={key}
            className="field"
            placeholder={placeholder}
            type={
              key === 'price' || key === 'quantity'
                ? 'number'
                : 'text'
            }
            required={key !== 'images'}
            value={form[key]}
            onChange={(e) => set(key, e.target.value)}
          />
        ))}

        <textarea
          className="field"
          placeholder="Describe the crop, growing practices, freshness…"
          required
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="field"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          >
            {[
              'Vegetables',
              'Fruits',
              'Grains',
              'Pulses',
              'Spices',
            ].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <input
            className="field"
            value={form.unit}
            onChange={(e) => set('unit', e.target.value)}
            placeholder="Unit"
          />
        </div>

        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.organic}
            onChange={(e) => set('organic', e.target.checked)}
          />
          Certified/organically grown
        </label>

        {error && (
          <p className="text-red-600">{error}</p>
        )}

        <button className="btn-primary">
          Publish listing
        </button>
      </form>
    </div>
  );
}