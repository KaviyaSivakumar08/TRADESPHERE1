import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [mode, setMode] = useState('login');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const { auth } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await auth(mode === 'login' ? 'login' : 'register', form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="mx-auto max-w-md card">
      <h1 className="text-2xl font-bold">
        {mode === 'login' ? 'Welcome back' : 'Join TradeSphere'}
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        Every account can buy crops and sell crops.
      </p>

      <form className="mt-5 space-y-4" onSubmit={submit}>
        {mode === 'register' && (
          <input
            className="field"
            placeholder="Full name"
            required
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
          />
        )}

        <input
          className="field"
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(event) =>
            setForm({ ...form, email: event.target.value })
          }
        />

        <input
          className="field"
          type="password"
          placeholder="Password (minimum 8 characters)"
          minLength="8"
          required
          value={form.password}
          onChange={(event) =>
            setForm({ ...form, password: event.target.value })
          }
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="btn-primary w-full">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <button
        className="mt-4 text-sm text-forest"
        onClick={() =>
          setMode(mode === 'login' ? 'register' : 'login')
        }
      >
        {mode === 'login'
          ? 'New here? Create an account'
          : 'Already registered? Sign in'}
      </button>
    </div>
  );
}