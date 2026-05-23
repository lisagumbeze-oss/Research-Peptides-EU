import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatLocaleDate } from '../lib/formatLocaleDate';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Package,
  ExternalLink,
  Truck,
  CheckCircle2,
  Clock,
  CreditCard,
} from 'lucide-react';
import { supabase } from '../supabase';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../lib/utils';
import { productPath } from '../lib/productUrl';
import { AccountShell } from '../components/account/AccountShell';
import { Button } from '../design-system';

export default function Orders() {
  const { i18n } = useTranslation();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (data) setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'paid':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <AccountShell title="Order history" subtitle="Track EU shipments and payment status">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-steel-600">
          <span className="font-semibold text-navy-950">{orders.length}</span> orders
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-3xl border border-brand-50 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-brand-100 shadow-card">
          <Package className="h-12 w-12 text-brand-200 mx-auto mb-4" aria-hidden />
          <p className="font-display font-bold text-xl text-navy-950 mb-2">No orders yet</p>
          <p className="text-steel-600 text-sm mb-6">Your research compound orders will appear here.</p>
          <Link to="/shop">
            <Button>Explore catalog</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, orderIdx) => (
            <motion.article
              key={order.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: orderIdx * 0.06 }}
              className="bg-white rounded-3xl border border-brand-100 shadow-card overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-brand-50 bg-mist-50/50 flex flex-wrap justify-between gap-4">
                <div className="flex gap-8">
                  <div>
                    <p className="text-caption text-brand-600">Placed</p>
                    <p className="text-sm font-semibold text-navy-950">
                      {formatLocaleDate(order.created_at, i18n.language, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-brand-600">Total</p>
                    <p className="text-sm font-bold text-brand-600 tabular-nums">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-caption text-brand-600">Order ID</p>
                  <p className="text-xs font-mono font-semibold text-steel-600">
                    {order.id.substring(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="px-6 py-8">
                <div className="relative flex justify-between max-w-lg mx-auto">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-100 -translate-y-1/2" />
                  <div
                    className="absolute top-1/2 left-0 h-0.5 bg-brand-500 -translate-y-1/2 transition-all duration-700"
                    style={{ width: `${((getStatusStep(order.status) - 1) / 3) * 100}%` }}
                  />
                  {[
                    { label: 'Pending', icon: Clock },
                    { label: 'Paid', icon: CreditCard },
                    { label: 'Shipped', icon: Truck },
                    { label: 'Delivered', icon: CheckCircle2 },
                  ].map((step, i) => {
                    const stepNum = i + 1;
                    const isActive = stepNum <= getStatusStep(order.status);
                    return (
                      <div key={step.label} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 border-white shadow-card ${
                            isActive ? 'bg-brand-500 text-white' : 'bg-brand-50 text-silver-400'
                          }`}
                        >
                          <step.icon className="h-4 w-4" aria-hidden />
                        </div>
                        <span
                          className={`text-[10px] font-semibold uppercase mt-2 ${
                            isActive ? 'text-navy-950' : 'text-silver-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 pb-6 space-y-3 border-t border-brand-50 pt-4">
                {(order.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-brand-50"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-mist-50 border border-brand-50" />
                      )}
                      <div className="min-w-0">
                        <Link
                          to={productPath({ slug: item.slug, title: item.title })}
                          className="text-sm font-semibold text-navy-950 hover:text-brand-600 truncate block"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-steel-600">
                          Qty {item.quantity} · {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold tabular-nums shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                {order.crypto_tx_hash && (
                  <div className="pt-4 flex items-center justify-between text-xs">
                    <span className="text-steel-600 font-semibold uppercase tracking-wide">
                      Crypto verified
                    </span>
                    <a
                      href={`https://mempool.space/tx/${order.crypto_tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-brand-600 bg-brand-50 px-2 py-1 rounded-lg flex items-center gap-1"
                    >
                      {order.crypto_tx_hash.substring(0, 12)}…
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
