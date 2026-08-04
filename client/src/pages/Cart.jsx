import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, change, total } = useCart();

  if (!items.length) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>

        <Link className="btn-primary mt-4" to="/marketplace">
          Browse marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <section>
        <h1 className="mb-5 text-3xl font-bold">Your cart</h1>

        <div className="space-y-3">
          {items.map((i) => (
            <div
              key={i._id}
              className="card flex items-center justify-between"
            >
              <div>
                <b>{i.name}</b>
                <p className="text-sm text-slate-500">
                  ₹{i.price}/{i.unit}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => change(i._id, i.quantity - 1)}>
                  −
                </button>

                <span>{i.quantity}</span>

                <button onClick={() => change(i._id, i.quantity + 1)}>
                  +
                </button>

                <b className="ml-4">
                  ₹{i.price * i.quantity}
                </b>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="card h-fit">
        <h2 className="text-xl font-bold">Order summary</h2>

        <div className="mt-4 flex justify-between">
          <span>Subtotal</span>
          <b>₹{total}</b>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Free delivery over ₹1,000.
        </p>

        <Link className="btn-primary mt-5 w-full" to="/checkout">
          Checkout
        </Link>
      </aside>
    </div>
  );
}