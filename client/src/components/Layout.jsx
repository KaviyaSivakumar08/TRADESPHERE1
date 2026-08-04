import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Leaf, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link
            className="flex items-center gap-2 text-xl font-bold text-forest"
            to="/"
          >
            <Leaf />
            TradeSphere
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium">
            <NavLink to="/marketplace">Marketplace</NavLink>

            {user && <NavLink to="/dashboard">Dashboard</NavLink>}

            <NavLink className="relative" to="/cart">
              <ShoppingCart size={20} />

              {count > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-leaf px-1.5 text-xs text-white">
                  {count}
                </span>
              )}
            </NavLink>

            {user ? (
              <button
                className="text-slate-600"
                onClick={() => {
                  logout();
                  nav('/');
                }}
                title="Sign out"
              >
                <LogOut size={19} />
              </button>
            ) : (
              <Link className="btn-primary" to="/login">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-128px)] max-w-7xl px-4 py-8">
        {children}
      </main>

      <footer className="border-t bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} TradeSphere · Fair trade from field to
        table.
      </footer>
    </>
  );
}