import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  HandHeart,
} from 'lucide-react';

export default function Home() {
  return (
    <>
      <section className="grid items-center gap-10 py-12 md:grid-cols-2">
        <div>
          <p className="mb-3 font-semibold text-leaf">
            FRESH · FAIR · DIRECT
          </p>

          <h1 className="text-5xl font-extrabold leading-tight text-slate-900">
            Good food starts with{' '}
            <span className="text-forest">
              good farming.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-slate-600">
            TradeSphere brings farm-fresh produce straight from the people
            who grow it—transparent prices, stronger rural communities.
          </p>

          <div className="mt-8 flex gap-3">
            <Link className="btn-primary" to="/marketplace">
              Explore produce <ArrowRight size={17} />
            </Link>

            <Link className="btn-outline" to="/login">
              Sell your harvest
            </Link>
          </div>
        </div>

        <img
          className="h-80 w-full rounded-3xl object-cover shadow-xl"
          alt="Fresh produce"
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1100&q=85"
        />
      </section>

      <section className="grid gap-4 py-10 md:grid-cols-3">
        {[
          [
            ShieldCheck,
            'Verified growers',
            'Know who grows your food.',
          ],
          [
            Truck,
            'Farm to doorstep',
            'Freshly packed and thoughtfully delivered.',
          ],
          [
            HandHeart,
            'Better returns',
            'More of every rupee reaches farmers.',
          ],
        ].map(([Icon, title, description]) => (
          <div key={title} className="card">
            <Icon className="mb-3 text-leaf" />

            <h2 className="font-bold">{title}</h2>

            <p className="mt-1 text-sm text-slate-600">
              {description}
            </p>
          </div>
        ))}
      </section>
    </>
  );
}