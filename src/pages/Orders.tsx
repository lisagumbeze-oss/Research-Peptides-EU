import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../lib/utils';
import { Package, ExternalLink, ChevronRight, User, Heart, Settings, Truck, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { productPath } from '../lib/productUrl';

export default function Orders() {
  const { user, profile } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const { data } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <div className="text-center">
           <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
           <p className="text-xl font-bold text-gray-900">Please log in to view your orders.</p>
           <Link to="/login" className="text-blue-600 font-bold hover:underline mt-2 inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  const getStatusStep = (status: string) => {
    switch(status) {
      case 'pending': return 1;
      case 'paid': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Dashboard Sidebar */}
          <aside className="w-full lg:w-80 space-y-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
               <div className="h-24 w-24 rounded-full bg-blue-50 p-1 mb-4">
                 <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center">
                   {profile.photo_url ? (
                     <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <User className="h-12 w-12 text-blue-100" />
                   )}
                 </div>
               </div>
               <h2 className="text-2xl font-black text-gray-900 leading-tight">{profile.display_name || 'Researcher'}</h2>
               <p className="text-blue-500 text-xs font-black uppercase tracking-widest mt-1">{profile.role}</p>
            </div>

            <nav className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-2">
               {[
                 { label: 'Overview', icon: User, path: '/profile' },
                 { label: 'Orders', icon: Package, path: '/orders', active: true },
                 { label: 'Wishlist', icon: Heart, path: '/wishlist' },
                 { label: 'Settings', icon: Settings, path: '/profile' }
               ].map((item, i) => (
                 <Link 
                   key={i} 
                   to={item.path}
                   className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                     item.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'
                   }`}
                 >
                   <div className="flex items-center gap-4">
                     <item.icon className="h-5 w-5" />
                     <span className="font-bold text-sm">{item.label}</span>
                   </div>
                   <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${item.active ? 'text-white/50' : 'text-gray-300'}`} />
                 </Link>
               ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-grow space-y-8">
            <div className="flex justify-between items-center mb-4">
               <h1>Order History</h1>
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{orders.length} Shipments</span>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                 <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                 <p className="text-xl font-bold text-gray-900">Logistics empty.</p>
                 <Link to="/shop" className="text-blue-600 font-bold hover:underline mt-2 inline-block">Explore Catalog</Link>
              </div>
            ) : (
              <div className="space-y-8">
                {orders.map((order, orderIdx) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: orderIdx * 0.1 }}
                    className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-500"
                  >
                    {/* Order Header */}
                    <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-6">
                       <div className="flex gap-8">
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Placed</p>
                             <p className="text-sm font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                             <p className="text-sm font-black text-blue-600">{formatCurrency(order.total_amount)}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Shipment #</p>
                          <p className="text-xs font-mono font-bold text-gray-600">{order.id.substring(0, 8).toUpperCase()}</p>
                       </div>
                    </div>

                    {/* Visual Status Tracker */}
                    <div className="px-10 py-10 bg-white">
                       <div className="relative flex justify-between">
                          {/* Progress Line */}
                          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2" />
                          <div 
                            className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 transition-all duration-1000" 
                            style={{ width: `${((getStatusStep(order.status) - 1) / 3) * 100}%` }}
                          />

                          {[
                            { label: 'Pending', icon: Clock },
                            { label: 'Paid', icon: CreditCard },
                            { label: 'Shipped', icon: Truck },
                            { label: 'Delivered', icon: CheckCircle2 }
                          ].map((step, i) => {
                             const stepNum = i + 1;
                             const isActive = stepNum <= getStatusStep(order.status);
                             
                             return (
                               <div key={i} className="relative z-10 flex flex-col items-center">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all duration-500 ${
                                    isActive ? 'bg-blue-600 text-white scale-110' : 'bg-gray-100 text-gray-300'
                                  }`}>
                                     <step.icon className="h-4 w-4" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-widest mt-3 transition-colors ${
                                    isActive ? 'text-gray-900' : 'text-gray-300'
                                  }`}>
                                     {step.label}
                                  </span>
                               </div>
                             );
                          })}
                       </div>
                    </div>

                    {/* Order Items */}
                    <div className="px-8 pb-8">
                       <div className="space-y-4 pt-6 border-t border-gray-50">
                          {(order.items || []).map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between group/item">
                               <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                                     <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" />
                                  </div>
                                  <div>
                                     <Link to={productPath({ slug: item.slug, title: item.title })} className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">{item.title}</Link>
                                     <p className="text-xs font-bold text-gray-400">Qty: {item.quantity} • {formatCurrency(item.price)}</p>
                                  </div>
                               </div>
                               <span className="text-sm font-black text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                       </div>
                       
                       {order.crypto_tx_hash && (
                          <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                             <div className="flex items-center gap-2 text-gray-400">
                                <CreditCard className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Crypto Payment Verified</span>
                             </div>
                             <a 
                               href={`https://mempool.space/tx/${order.crypto_tx_hash}`} 
                               target="_blank" 
                               rel="noreferrer" 
                               className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-100 transition-colors"
                             >
                                {order.crypto_tx_hash.substring(0, 12)}... <ExternalLink className="h-3 w-3" />
                             </a>
                          </div>
                       )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
