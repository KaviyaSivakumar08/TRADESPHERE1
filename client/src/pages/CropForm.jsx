import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';

export default function CropForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

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
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;

    const loadCrop = async () => {
      try {
        const response = await api.get(`/crops/${id}`);
        const crop = response.data.crop;

        setForm({
          name: crop.name || '',
          description: crop.description || '',
          category: crop.category || 'Vegetables',
          price: crop.price || '',
          unit: crop.unit || 'kg',
          quantity: crop.quantity || '',
          images: crop.images?.join(', ') || '',
          organic: crop.organic || false,
          location: {
            district: crop.location?.district || '',
            state: crop.location?.state || '',
          },
        });
      } catch (err) {
        setError('Could not load product details.');
      } finally {
        setLoading(false);
      }
    };

    loadCrop();
  }, [id, isEditMode]);

  const setField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const cropData = {
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity),
      images: form.images
        ? form.images.split(',').map((image) => image.trim())
        : [],
    };

    try {
      if (isEditMode) {
        await api.patch(`/crops/${id}`, cropData);
      } else {
        await api.post('/crops', cropData);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not save product. Please try again.',
      );
    }
  };

  if (loading) {
    return <p>Loading product...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-5 text-3xl font-bold">
        {isEditMode ? 'Edit Product' : 'Sell a Crop'}
      </h1>

      <form className="card grid gap-4" onSubmit={submit}>
        <div>
          <label className="label">Product name</label>
          <input
            className="field"
            placeholder="Example: Fresh Tomatoes"
            required
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="field"
            placeholder="Describe freshness, quality, farming method..."
            required
            value={form.description}
            onChange={(event) =>
              setField('description', event.target.value)
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select
              className="field"
              value={form.category}
              onChange={(event) =>
                setField('category', event.target.value)
              }
            >
              <option>Vegetables</option>
              <option>Fruits</option>
              <option>Grains</option>
              <option>Pulses</option>
              <option>Spices</option>
            </select>
          </div>

          <div>
            <label className="label">Unit</label>
            <input
              className="field"
              placeholder="kg, dozen, bag..."
              required
              value={form.unit}
              onChange={(event) => setField('unit', event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Price per unit (₹)</label>
            <input
              className="field"
              type="number"
              min="0"
              required
              value={form.price}
              onChange={(event) => setField('price', event.target.value)}
            />
          </div>

          <div>
            <label className="label">Available quantity</label>
            <input
              className="field"
              type="number"
              min="0"
              required
              value={form.quantity}
              onChange={(event) => setField('quantity', event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">Product image links</label>
          <input
            className="field"
            placeholder="Paste image URL, or multiple URLs separated by commas"
            value={form.images}
            onChange={(event) => setField('images', event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">District</label>
            <input
              className="field"
              placeholder="Example: Pune"
              value={form.location.district}
              onChange={(event) =>
                setForm({
                  ...form,
                  location: {
                    ...form.location,
                    district: event.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label className="label">State</label>
            <input
              className="field"
              placeholder="Example: Maharashtra"
              value={form.location.state}
              onChange={(event) =>
                setForm({
                  ...form,
                  location: {
                    ...form.location,
                    state: event.target.value,
                  },
                })
              }
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.organic}
            onChange={(event) => setField('organic', event.target.checked)}
          />
          Organically grown / organic product
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="btn-primary">
          {isEditMode ? 'Save Changes' : 'Publish Product'}
        </button>
      </form>
    </div>
  );
}