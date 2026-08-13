import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import CropDetails from './pages/CropDetails';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import CropForm from './pages/CropForm';

import { useAuth } from './context/AuthContext';

const Guard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/crops/:id" element={<CropDetails />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/cart" element={<Cart />} />

        <Route
          path="/checkout"
          element={
            <Guard>
              <Checkout />
            </Guard>
          }
        />

        <Route
          path="/dashboard"
          element={
            <Guard>
              <Dashboard />
            </Guard>
          }
        />

        <Route
          path="/farmer/crops/new"
          element={
            <Guard>
              <CropForm />
            </Guard>
          }
        />

        <Route
          path="/farmer/crops/:id/edit"
          element={
            <Guard>
              <CropForm />
            </Guard>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}