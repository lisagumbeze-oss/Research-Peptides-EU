import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../lib/utils';
import { Plus, Trash2, LayoutDashboard, ShoppingBag, Package, Settings, TrendingUp, Users, AlertTriangle, CheckCircle2, Truck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardSkeleton, StatSkeleton } from '../components/DashboardSkeleton';
import {
  referenceSeedCategories,
  referenceSeedProducts,
} from '../data/seedCatalog';
import { useToastStore } from '../store/useToastStore';

export default function AdminDashboard() {
  const { profile } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'system'>('overview');
  const addToast = useToastStore(state => state.addToast);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [inventory, setInventory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [txidDraft, setTxidDraft] = useState('');
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const seedReferenceCatalog = async () => {
    setIsSeeding(true);
    addToast("Starting catalog synchronization...", "info");
    try {
      // Upsert products from reference data
      const { error: pError } = await supabase.from('products').upsert(
        referenceSeedProducts.map(p => ({
          ...p,
          rating: 5,
          review_count: Math.floor(Math.random() * 50) + 10
        }))
      );
      if (pError) throw pError;
      addToast("Catalog synchronized successfully", "success");
      fetchData();
    } catch (err: any) {
      console.error("Sync error:", err);
      addToast(err.message || "Sync failed", "error");
    } finally {
      setIsSeeding(false);
    }
  };

  const clearAndReseed = async () => {
    if (!confirm("Are you ABSOLUTELY sure? This will delete all products.")) return;
    setIsSeeding(true);
    addToast("Wiping and re-seeding...", "info");
    try {
      const { error: dError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything
      if (dError) throw dError;
      
      const { error: iError } = await supabase.from('products').insert(
        referenceSeedProducts.map(p => ({
          ...p,
          rating: 5,
          review_count: Math.floor(Math.random() * 50) + 10
        }))
      );
      if (iError) throw iError;
      addToast("Wipe and re-seed complete", "success");
      fetchData();
    } catch (err: any) {
      console.error("Reseed error:", err);
      addToast(err.message || "Reseed failed", "error");
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false })
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (orderRes.data) setOrders(orderRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;

      // Backend SMTP status email trigger (best-effort, non-blocking).
      fetch('/api/email/order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status })
      }).catch(() => {
        // no-op
      });

      addToast(`Order ${orderId.substring(0, 8)} updated to ${status}`);
      fetchData();
    } catch (error: any) {
      console.error("Error updating order:", error);
      addToast(error?.message || "Failed to update order status", "error");
    }
  };

  const openOrderActions = (order: any) => {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      setTxidDraft('');
      return;
    }
    setExpandedOrderId(order.id);
    setTxidDraft(order.crypto_tx_hash || '');
  };

  const saveOrderMeta = async (orderId: string) => {
    setIsSavingOrder(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ crypto_tx_hash: txidDraft || null })
        .eq('id', orderId);
      if (error) throw error;
      addToast(`Order ${orderId.substring(0, 8)} metadata updated`, "success");
      fetchData();
    } catch (error: any) {
      console.error("Error saving order metadata:", error);
      addToast(error?.message || "Failed to save order metadata", "error");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const stats = {
    totalRevenue: orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0),
    activeOrders: orders.filter(o => o.status === 'paid' || o.status === 'shipped').length,
    lowStock: products.filter(p => p.inventory < 10).length,
    totalProducts: products.length
  };

  if (profile?.role !== 'admin') {
    return <div className="p-8 text-center text-red-600 font-bold uppercase tracking-widest">Access Denied. Admins only.</div>;
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProduct = {
        title,
        description,
        price: parseFloat(price),
        inventory: parseInt(inventory),
        images: imageUrl ? [imageUrl] : [],
        categories: [],
        specifications: [],
        rating: 5,
        review_count: 0
      };
      const { error } = await supabase.from('products').insert([newProduct]);
      if (error) throw error;
      
      setTitle(''); setDescription(''); setPrice(''); setInventory(''); setImageUrl('');
      addToast(`${title} added successfully`);
      fetchData();
    } catch (error) {
      console.error("Error adding product:", error);
      addToast("Failed to add product", "error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      addToast("Product deleted");
      fetchData();
    } catch (error) {
      addToast("Failed to delete product", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1>Command Center</h1>
          <p className="text-gray-500 font-medium">Manage your elite research inventory and logistics.</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-[1.2rem] border border-gray-200">
           {[
             { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
             { id: 'products', icon: ShoppingBag, label: 'Products' },
             { id: 'orders', icon: Package, label: 'Orders' },
             { id: 'system', icon: Settings, label: 'System' }
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                 activeTab === tab.id 
                 ? 'bg-white text-blue-600 shadow-sm' 
                 : 'text-gray-500 hover:text-gray-900'
               }`}
             >
               <tab.icon className="h-4 w-4" />
               <span className="hidden sm:inline">{tab.label}</span>
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Active Orders', value: stats.activeOrders, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
                  { label: 'Inventory Items', value: stats.totalProducts, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-110 opacity-50`} />
                    <stat.icon className={`h-8 w-8 ${stat.color} mb-4 relative z-10`} />
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest relative z-10">{stat.label}</p>
                    <p className="text-3xl font-black text-gray-900 mt-1 relative z-10">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                   <h3 className="text-xl font-bold mb-6">Recent Orders</h3>
                   <div className="space-y-4">
                     {orders.slice(0, 5).map(order => (
                       <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                               <Package className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-gray-900">Order #{order.id.substring(0, 8)}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black text-blue-600">{formatCurrency(order.total_amount)}</p>
                            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">{order.status}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
                 
                 <div className="bg-gray-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/10" />
                    <h3 className="text-xl font-bold mb-4 relative z-10">System Status</h3>
                    <p className="text-gray-400 text-sm mb-8 relative z-10">Logistics network and database synchronization status.</p>
                    <div className="space-y-6 relative z-10">
                       <div className="flex items-center gap-4">
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                          <span className="font-bold">Database Optimal</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                          <span className="font-bold">Shipping Gateways Active</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                          <span className="font-bold">Auth Nodes Connected</span>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div 
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm h-fit">
                <h2 className="mb-6 text-gray-900">Add Inventory</h2>
                <form onSubmit={handleAddProduct} className="space-y-5">
                   {/* Form fields same as before but styled better */}
                   <input required type="text" placeholder="Product Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
                   <textarea required rows={4} placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
                   <div className="grid grid-cols-2 gap-4">
                      <input required type="number" step="0.01" placeholder="Price £" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
                      <input required type="number" placeholder="Inventory" value={inventory} onChange={e => setInventory(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
                   </div>
                   <input type="url" placeholder="Image URL (optional)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
                   <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200">
                     List Product
                   </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                   <h3 className="text-2xl font-black">Live Inventory</h3>
                   <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase">{products.length} Items</span>
                </div>
                <div className="divide-y divide-gray-50 max-h-[700px] overflow-y-auto">
                   {products.map(product => (
                     <div key={product.id} className="p-6 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                              <img src={product.images?.[0]} className="w-full h-full object-cover" alt="" />
                           </div>
                           <div>
                              <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{product.title}</p>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{formatCurrency(product.price)} • {product.inventory} in stock</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                           <Trash2 className="h-5 w-5" />
                        </button>
                     </div>
                   ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden"
            >
               <div className="p-8 border-b border-gray-100">
                  <h3 className="text-2xl font-black">Order Logistics</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-gray-50 border-b border-gray-100 italic text-gray-400 text-xs font-bold uppercase tracking-widest">
                       <th className="px-8 py-5">Order ID</th>
                       <th className="px-8 py-5">Customer</th>
                       <th className="px-8 py-5">Amount</th>
                       <th className="px-8 py-5">Status</th>
                       <th className="px-8 py-5">TXID</th>
                       <th className="px-8 py-5 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                    {orders.map(order => (
                      <React.Fragment key={order.id}>
                        <tr className="group hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-6 font-mono text-sm text-gray-500">#{order.id.substring(0, 8)}</td>
                          <td className="px-8 py-6">
                             <p className="font-bold text-sm text-gray-900">{order.user_id?.substring(0, 8) || 'Guest'}</p>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{new Date(order.created_at).toLocaleDateString()}</p>
                          </td>
                          <td className="px-8 py-6 font-black text-blue-600">{formatCurrency(order.total_amount)}</td>
                          <td className="px-8 py-6">
                             <select 
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer border-0
                                  ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                                    order.status === 'paid' ? 'bg-purple-100 text-purple-700' : 
                                    order.status === 'processing' ? 'bg-indigo-100 text-indigo-700' :
                                    'bg-yellow-100 text-yellow-700'}`}
                             >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="paid">Paid</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="canceled">Canceled</option>
                             </select>
                          </td>
                          <td className="px-8 py-6 font-mono text-[10px] text-gray-400 truncate max-w-[150px]">{order.crypto_tx_hash || 'N/A'}</td>
                          <td className="px-8 py-6 text-right relative">
                             <button
                               onClick={() => openOrderActions(order)}
                               className="text-gray-400 hover:text-gray-900"
                               title="Open order actions"
                             >
                                <Plus className={`h-5 w-5 transition-transform ${expandedOrderId === order.id ? 'rotate-45' : ''}`} />
                             </button>
                          </td>
                        </tr>
                        {expandedOrderId === order.id && (
                          <tr className="bg-gray-50/70">
                            <td colSpan={6} className="px-8 py-5">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                <div className="md:col-span-2">
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Crypto TXID / Hash</label>
                                  <input
                                    value={txidDraft}
                                    onChange={(e) => setTxidDraft(e.target.value)}
                                    placeholder="Paste transaction hash"
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <button
                                  onClick={() => saveOrderMeta(order.id)}
                                  disabled={isSavingOrder}
                                  className="bg-blue-600 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-60"
                                >
                                  {isSavingOrder ? 'Saving...' : 'Save TXID'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                   </tbody>
                 </table>
               </div>
            </motion.div>
          )}

          {activeTab === 'system' && (
             <motion.div 
               key="system"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="max-w-2xl mx-auto space-y-8"
             >
                <div className="bg-gray-900 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 -mr-32 -mt-32 rounded-full blur-[100px]" />
                   <div className="relative z-10">
                      <h2 className="text-3xl font-black mb-4">System Maintenance</h2>
                      <p className="text-gray-400 mb-12">Critical tools for database synchronization and catalog initialization. Use with extreme caution.</p>
                      
                      <div className="space-y-4">
                         <button
                           onClick={seedReferenceCatalog}
                           disabled={isSeeding}
                           className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all font-bold group"
                         >
                            <div className="text-left">
                               <p className="text-lg">Sync Missing Reference Items</p>
                               <p className="text-xs text-gray-500 font-medium">Adds new products from the master seed file.</p>
                            </div>
                            <TrendingUp className="h-6 w-6 text-blue-500 group-hover:translate-x-2 transition-transform" />
                         </button>
                         
                         <button
                           onClick={clearAndReseed}
                           disabled={isSeeding}
                           className="w-full flex items-center justify-between p-6 bg-red-600/10 border border-red-600/20 rounded-3xl hover:bg-red-600/20 transition-all font-bold group"
                         >
                            <div className="text-left">
                               <p className="text-lg text-red-500">Wipe & Full Re-seed</p>
                               <p className="text-xs text-red-800/60 font-medium italic">CAUTION: This deletes all existing products.</p>
                            </div>
                            <AlertTriangle className="h-6 w-6 text-red-500 group-hover:rotate-12 transition-transform" />
                         </button>
                      </div>
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
