import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuthStore, isConfiguredAdminEmail } from '../store/useAuthStore';
import { formatCurrency } from '../lib/utils';
import { Plus, Trash2, LayoutDashboard, ShoppingBag, Package, Settings, TrendingUp, AlertTriangle, CheckCircle2, Clock, Pencil, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardSkeleton, StatSkeleton } from '../components/DashboardSkeleton';
import {
  mapSeedProductToRow,
  referenceSeedCategories,
  referenceSeedProducts,
} from '../data/seedCatalog';
import { useToastStore } from '../store/useToastStore';
import { postOrderStatusEmail } from '../lib/transactionalEmailApi';

export default function AdminDashboard() {
  const { profile, user } = useAuthStore();
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
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [txidDraft, setTxidDraft] = useState('');
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const [orderDetail, setOrderDetail] = useState<any | null>(null);
  const [orderDraft, setOrderDraft] = useState({
    status: 'pending',
    total_amount: '',
    crypto_tx_hash: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });
  const [isSavingOrderDetail, setIsSavingOrderDetail] = useState(false);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productDraft, setProductDraft] = useState({
    title: '',
    description: '',
    price: '',
    compareAtPrice: '',
    inventory: '',
    imageUrl: '',
  });
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const seedReferenceCatalog = async () => {
    setIsSeeding(true);
    addToast("Starting catalog synchronization...", "info");
    try {
      // Upsert products from reference data
      const { error: pError } = await supabase.from('products').upsert(
        referenceSeedProducts.map((p) => mapSeedProductToRow(p)),
        { onConflict: 'slug' },
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
        referenceSeedProducts.map((p) => mapSeedProductToRow(p)),
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
      if (prodRes.error) {
        console.error(prodRes.error);
        addToast(prodRes.error.message || 'Failed to load products', 'error');
      } else if (prodRes.data) {
        setProducts(prodRes.data);
      }
      if (orderRes.error) {
        console.error(orderRes.error);
        addToast(orderRes.error.message || 'Failed to load orders', 'error');
      } else if (orderRes.data) {
        setOrders(orderRes.data);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (order: any, status: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', order.id);
      if (error) throw error;

      await postOrderStatusEmail(order.id, status);

      addToast(`Order ${order.id.substring(0, 8)} updated to ${status}`);
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

  const openOrderDetail = (order: any) => {
    const addr = order.shipping_address || {};
    setOrderDetail(order);
    setOrderDraft({
      status: order.status || 'pending',
      total_amount: String(order.total_amount ?? ''),
      crypto_tx_hash: order.crypto_tx_hash || '',
      fullName: addr.fullName || '',
      email: addr.email || '',
      phone: addr.phone || '',
      address: addr.address || '',
      city: addr.city || '',
      country: addr.country || '',
      postalCode: addr.postalCode || '',
    });
  };

  const saveOrderDetail = async () => {
    if (!orderDetail) return;
    setIsSavingOrderDetail(true);
    try {
      const prev = orderDetail.shipping_address || {};
      const shipping_address = {
        ...prev,
        fullName: orderDraft.fullName,
        email: orderDraft.email,
        phone: orderDraft.phone,
        address: orderDraft.address,
        city: orderDraft.city,
        country: orderDraft.country,
        postalCode: orderDraft.postalCode,
      };
      const totalNum = parseFloat(orderDraft.total_amount);
      const { error } = await supabase
        .from('orders')
        .update({
          status: orderDraft.status,
          crypto_tx_hash: orderDraft.crypto_tx_hash.trim() || null,
          total_amount: Number.isFinite(totalNum) ? totalNum : orderDetail.total_amount,
          shipping_address,
        })
        .eq('id', orderDetail.id);
      if (error) throw error;

      if (orderDraft.status !== orderDetail.status) {
        await postOrderStatusEmail(orderDetail.id, orderDraft.status);
      }

      addToast('Order saved', 'success');
      setOrderDetail(null);
      fetchData();
    } catch (error: any) {
      console.error('Error saving order:', error);
      addToast(error?.message || 'Failed to save order', 'error');
    } finally {
      setIsSavingOrderDetail(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Permanently delete this order? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      addToast('Order deleted', 'success');
      if (orderDetail?.id === orderId) setOrderDetail(null);
      if (expandedOrderId === orderId) setExpandedOrderId(null);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting order:', error);
      addToast(error?.message || 'Failed to delete order', 'error');
    }
  };

  const startEditProduct = (product: any) => {
    setEditingProductId(product.id);
    setProductDraft({
      title: product.title || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      compareAtPrice:
        product.compare_at_price != null && Number.isFinite(Number(product.compare_at_price))
          ? String(product.compare_at_price)
          : '',
      inventory: String(product.inventory ?? ''),
      imageUrl: product.images?.[0] || '',
    });
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
  };

  const saveProductEdit = async () => {
    if (!editingProductId) return;
    setIsSavingProduct(true);
    try {
      const priceNum = parseFloat(productDraft.price);
      const invNum = parseInt(productDraft.inventory, 10);
      const compareRaw = productDraft.compareAtPrice.trim();
      let compareAt: number | null = null;
      if (compareRaw !== '') {
        const c = parseFloat(compareRaw);
        if (Number.isFinite(c) && Number.isFinite(priceNum) && c > priceNum) {
          compareAt = c;
        }
      }
      const { error } = await supabase
        .from('products')
        .update({
          title: productDraft.title,
          description: productDraft.description,
          price: Number.isFinite(priceNum) ? priceNum : 0,
          compare_at_price: compareAt,
          inventory: Number.isFinite(invNum) ? invNum : 0,
          images: productDraft.imageUrl ? [productDraft.imageUrl] : [],
        })
        .eq('id', editingProductId);
      if (error) throw error;
      addToast('Product updated', 'success');
      setEditingProductId(null);
      fetchData();
    } catch (error: any) {
      console.error('Error updating product:', error);
      addToast(error?.message || 'Failed to update product', 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const stats = {
    totalRevenue: orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0),
    activeOrders: orders.filter(o => o.status === 'paid' || o.status === 'shipped').length,
    lowStock: products.filter(p => p.inventory < 10).length,
    totalProducts: products.length
  };

  if (profile?.role !== 'admin') {
    const hint = isConfiguredAdminEmail(user?.email);
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-red-600 font-bold uppercase tracking-widest">Access denied</p>
        <p className="text-gray-600 text-sm">Only accounts with <span className="font-mono">role = &apos;admin&apos;</span> in the <span className="font-mono">users</span> table can open this page.</p>
        {hint && user?.id && (
          <div className="text-left bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-950">
            <p className="font-bold mb-2">Your email is listed in VITE_ADMIN_EMAILS but the database role is still not admin.</p>
            <p className="mb-2">Run in the Supabase SQL editor (adjust if your column type differs):</p>
            <pre className="bg-white border border-amber-200 rounded-lg p-3 overflow-x-auto text-xs font-mono whitespace-pre-wrap break-all">
{`UPDATE public.users SET role = 'admin' WHERE id = '${user.id}';`}
            </pre>
            <p className="mt-2 text-xs text-amber-800">Apply migrations <span className="font-mono">003</span>–<span className="font-mono">006_currency_eur.sql</span> in Supabase. Catalog prices are stored in EUR (<span className="font-mono">npm run db:seed:supabase</span>).</p>
          </div>
        )}
      </div>
    );
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const priceVal = parseFloat(price);
      const invVal = parseInt(inventory, 10);
      const cRaw = compareAtPrice.trim();
      let compare_at_price: number | null = null;
      if (cRaw !== '') {
        const c = parseFloat(cRaw);
        if (Number.isFinite(c) && Number.isFinite(priceVal) && c > priceVal) {
          compare_at_price = c;
        }
      }
      const newProduct = {
        title,
        description,
        price: priceVal,
        compare_at_price,
        currency: 'EUR',
        inventory: invVal,
        images: imageUrl ? [imageUrl] : [],
        categories: [],
        specifications: [],
        rating: 5,
        review_count: 0
      };
      const { error } = await supabase.from('products').insert([newProduct]);
      if (error) throw error;
      
      setTitle(''); setDescription(''); setPrice(''); setCompareAtPrice(''); setInventory(''); setImageUrl('');
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
                      <input required type="number" step="0.01" placeholder="Price €" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
                      <input required type="number" placeholder="Inventory" value={inventory} onChange={e => setInventory(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
                   </div>
                   <input type="number" step="0.01" placeholder="Compare-at / RRP € (optional, must exceed price)" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
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
                     editingProductId === product.id ? (
                       <div key={product.id} className="p-6 space-y-4 bg-slate-50 border-b border-gray-100">
                         <p className="text-xs font-black uppercase tracking-widest text-gray-400">Edit product</p>
                         <input value={productDraft.title} onChange={e => setProductDraft(d => ({ ...d, title: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium" placeholder="Title" />
                         <textarea value={productDraft.description} onChange={e => setProductDraft(d => ({ ...d, description: e.target.value }))} rows={3} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium" placeholder="Description" />
                         <div className="grid grid-cols-2 gap-3">
                           <input type="number" step="0.01" value={productDraft.price} onChange={e => setProductDraft(d => ({ ...d, price: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm" placeholder="Price" />
                           <input type="number" step="0.01" value={productDraft.compareAtPrice} onChange={e => setProductDraft(d => ({ ...d, compareAtPrice: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm" placeholder="RRP (optional)" />
                         </div>
                         <input type="number" value={productDraft.inventory} onChange={e => setProductDraft(d => ({ ...d, inventory: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm" placeholder="Inventory" />
                         <input type="url" value={productDraft.imageUrl} onChange={e => setProductDraft(d => ({ ...d, imageUrl: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-mono" placeholder="Image URL" />
                         <div className="flex gap-3">
                           <button type="button" onClick={saveProductEdit} disabled={isSavingProduct} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-60">{isSavingProduct ? 'Saving…' : 'Save'}</button>
                           <button type="button" onClick={cancelEditProduct} disabled={isSavingProduct} className="px-6 py-3 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-widest hover:bg-gray-100">Cancel</button>
                         </div>
                       </div>
                     ) : (
                       <div key={product.id} className="p-6 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-6 min-w-0 flex-1">
                             <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                                <img src={product.images?.[0]} className="w-full h-full object-cover" alt="" />
                             </div>
                             <div className="min-w-0">
                                <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{product.title}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                  {product.compare_at_price != null &&
                                  Number(product.compare_at_price) > Number(product.price) ? (
                                    <>
                                      <span className="line-through text-gray-400 decoration-gray-400">
                                        {formatCurrency(Number(product.compare_at_price))}
                                      </span>
                                      <span className="text-gray-700"> {formatCurrency(product.price)}</span>
                                    </>
                                  ) : (
                                    formatCurrency(product.price)
                                  )}
                                  {' '}• {product.inventory} in stock
                                </p>
                             </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEditProduct(product)}
                              className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              title="Edit product"
                            >
                               <Pencil className="h-5 w-5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete product"
                            >
                               <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                       </div>
                     )
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
                                onChange={(e) => updateOrderStatus(order, e.target.value)}
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
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-1">
                               <button
                                 type="button"
                                 onClick={() => openOrderDetail(order)}
                                 className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gray-900 text-white hover:bg-black transition-colors"
                               >
                                 View / edit
                               </button>
                               <button
                                 type="button"
                                 onClick={() => deleteOrder(order.id)}
                                 className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                 title="Delete order"
                               >
                                 <Trash2 className="h-5 w-5" />
                               </button>
                               <button
                                 type="button"
                                 onClick={() => openOrderActions(order)}
                                 className="p-2 text-gray-400 hover:text-gray-900 rounded-xl transition-colors"
                                 title="Quick TXID"
                               >
                                 <Plus className={`h-5 w-5 transition-transform ${expandedOrderId === order.id ? 'rotate-45' : ''}`} />
                               </button>
                             </div>
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

      {orderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[1.75rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order</p>
                <h2 className="text-xl font-black text-gray-900 font-mono">#{orderDetail.id}</h2>
                <p className="text-xs text-gray-500 mt-1">Placed {orderDetail.created_at ? new Date(orderDetail.created_at).toLocaleString() : '—'}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">Customer user_id: {orderDetail.user_id || 'Guest checkout'}</p>
              </div>
              <button type="button" onClick={() => setOrderDetail(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Line items</p>
                <ul className="space-y-2 text-sm">
                  {Array.isArray(orderDetail.items) && orderDetail.items.length > 0 ? (
                    orderDetail.items.map((line: any, idx: number) => (
                      <li key={idx} className="flex justify-between gap-4 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <span className="font-medium text-gray-900">{line.title || line.name || 'Item'}{line.specification ? ` — ${line.specification}` : line.variantLabel ? ` — ${line.variantLabel}` : ''}</span>
                        <span className="text-gray-600 shrink-0">× {line.quantity ?? line.qty ?? 1}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 text-sm">No structured line items saved for this order.</li>
                  )}
                </ul>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Status</label>
                  <select
                    value={orderDraft.status}
                    onChange={e => setOrderDraft(d => ({ ...d, status: e.target.value }))}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Total amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={orderDraft.total_amount}
                    onChange={e => setOrderDraft(d => ({ ...d, total_amount: e.target.value }))}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Crypto TXID / hash</label>
                  <input
                    value={orderDraft.crypto_tx_hash}
                    onChange={e => setOrderDraft(d => ({ ...d, crypto_tx_hash: e.target.value }))}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Shipping & contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={orderDraft.fullName} onChange={e => setOrderDraft(d => ({ ...d, fullName: e.target.value }))} placeholder="Full name" className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <input type="email" value={orderDraft.email} onChange={e => setOrderDraft(d => ({ ...d, email: e.target.value }))} placeholder="Email" className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <input value={orderDraft.phone} onChange={e => setOrderDraft(d => ({ ...d, phone: e.target.value }))} placeholder="Phone" className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <input value={orderDraft.country} onChange={e => setOrderDraft(d => ({ ...d, country: e.target.value }))} placeholder="Country" className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <input value={orderDraft.city} onChange={e => setOrderDraft(d => ({ ...d, city: e.target.value }))} placeholder="City" className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <input value={orderDraft.postalCode} onChange={e => setOrderDraft(d => ({ ...d, postalCode: e.target.value }))} placeholder="Postal code" className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <textarea value={orderDraft.address} onChange={e => setOrderDraft(d => ({ ...d, address: e.target.value }))} placeholder="Address" rows={2} className="sm:col-span-2 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={saveOrderDetail}
                disabled={isSavingOrderDetail}
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-60"
              >
                {isSavingOrderDetail ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => deleteOrder(orderDetail.id)}
                className="sm:w-auto px-6 py-4 rounded-2xl border-2 border-red-200 text-red-600 text-sm font-black uppercase tracking-widest hover:bg-red-50"
              >
                Delete order
              </button>
              <button type="button" onClick={() => setOrderDetail(null)} className="sm:w-auto px-6 py-4 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
