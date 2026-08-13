import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [message, setMessage] = useState('');

  const loadDashboard = async () => {
    try {
      const [ordersResponse, cropsResponse] = await Promise.all([
        api.get('/orders'),
        api.get('/crops/mine'),
      ]);

      setOrders(ordersResponse.data.items);
      setMyProducts(cropsResponse.data.items);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || 'Could not load dashboard.',
      );
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const changeSellerStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/seller-status`, { status });

      setMessage(`Product order ${status}.`);
      loadDashboard();
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Could not update order.',
      );
    }
  };

  const isMyProduct = (item) => {
    const farmerId = item.farmer?._id || item.farmer;

    return farmerId?.toString() === user?.id?.toString();
  };

  const buyingOrders = orders.filter(
    (order) => order.buyer?._id?.toString() === user?.id?.toString(),
  );

  const sellingOrders = orders.filter((order) =>
    order.items.some((item) => isMyProduct(item)),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {user?.name}
          </h1>

          <p className="mt-1 text-slate-600">
            Buy fresh crops or sell your own produce.
          </p>
        </div>

        <div className="flex gap-3">
          <Link className="btn-outline" to="/marketplace">
            Buy Crops
          </Link>

          <Link className="btn-primary" to="/farmer/crops/new">
            Sell a Crop
          </Link>
        </div>
      </div>

      {message && (
        <p className="mt-5 rounded-lg bg-green-100 p-3 text-green-800">
          {message}
        </p>
      )}

      {/* Your listed products: edit price and quantity here */}
      <h2 className="mt-10 text-2xl font-bold">My Products</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {myProducts.map((product) => (
          <div className="card" key={product._id}>
            <img
              className="mb-3 h-36 w-full rounded-lg object-cover"
              src={
                product.images?.[0] ||
                'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
              }
              alt={product.name}
            />

            <h3 className="text-lg font-bold">{product.name}</h3>

            <p className="mt-1 text-forest">
              ₹{product.price} / {product.unit}
            </p>

            <p className="text-sm text-slate-500">
              Available: {product.quantity} {product.unit}
            </p>

            <Link
              className="btn-outline mt-4 w-full"
              to={`/farmer/crops/${product._id}/edit`}
            >
              Edit Price / Quantity
            </Link>
          </div>
        ))}

        {!myProducts.length && (
          <div className="card text-slate-500">
            You have not listed any products yet.
          </div>
        )}
      </div>

      <h2 className="mt-10 text-2xl font-bold">Products I Bought</h2>

      <div className="mt-4 space-y-4">
        {buyingOrders.map((order) => (
          <div className="card" key={order._id}>
            <h3 className="font-bold">Order #{order._id.slice(-6)}</h3>

            <div className="mt-3 space-y-3 border-t pt-3">
              {order.items.map((item, index) => (
                <div key={`${item.crop}-${index}`}>
                  <p className="font-semibold">{item.name}</p>

                  <p className="text-sm text-slate-500">
                    Seller:{' '}
                    {item.farmer?.farmName ||
                      item.farmer?.name ||
                      'Farmer'}
                  </p>

                  <p className="text-sm text-slate-500">
                    Quantity: {item.quantity} {item.unit}
                  </p>

                  <p className="font-semibold capitalize text-forest">
                    Seller status: {item.sellerStatus}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {!buyingOrders.length && (
          <div className="card text-slate-500">
            You have not bought anything yet.
          </div>
        )}
      </div>

      <h2 className="mt-10 text-2xl font-bold">Products I Sold</h2>

      <div className="mt-4 space-y-4">
        {sellingOrders.map((order) => (
          <div className="card" key={order._id}>
            <h3 className="font-bold">Order #{order._id.slice(-6)}</h3>

            <div className="mt-2 text-sm text-slate-600">
              <p>
                <b>Buyer:</b> {order.buyer?.name} · {order.buyer?.phone}
              </p>

              <p className="mt-2">
                <b>Delivery address:</b>
              </p>

              <p>{order.shippingAddress?.line1}</p>

              <p>
                {order.shippingAddress?.city},{' '}
                {order.shippingAddress?.state} -{' '}
                {order.shippingAddress?.postalCode}
              </p>

              <p>{order.shippingAddress?.country || 'India'}</p>
            </div>

            <div className="mt-4 space-y-4 border-t pt-3">
              {order.items
                .filter((item) => isMyProduct(item))
                .map((item, index) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-4"
                    key={`${item.crop}-${index}`}
                  >
                    <div>
                      <p className="font-bold">{item.name}</p>

                      <p className="text-sm text-slate-500">
                        Quantity: {item.quantity} {item.unit}
                      </p>

                      <p className="font-semibold capitalize text-forest">
                        Status: {item.sellerStatus}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.sellerStatus === 'pending' && (
                        <>
                          <button
                            className="btn-primary"
                            onClick={() =>
                              changeSellerStatus(order._id, 'approved')
                            }
                          >
                            Approve
                          </button>

                          <button
                            className="btn-outline"
                            onClick={() =>
                              changeSellerStatus(order._id, 'rejected')
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {item.sellerStatus === 'approved' && (
                        <button
                          className="btn-primary"
                          onClick={() =>
                            changeSellerStatus(order._id, 'processing')
                          }
                        >
                          Processing
                        </button>
                      )}

                      {item.sellerStatus === 'processing' && (
                        <button
                          className="btn-primary"
                          onClick={() =>
                            changeSellerStatus(order._id, 'shipped')
                          }
                        >
                          Mark Shipped
                        </button>
                      )}

                      {item.sellerStatus === 'shipped' && (
                        <button
                          className="btn-primary"
                          onClick={() =>
                            changeSellerStatus(order._id, 'delivered')
                          }
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {!sellingOrders.length && (
          <div className="card text-slate-500">
            Nobody has ordered your products yet.
          </div>
        )}
      </div>
    </div>
  );
}