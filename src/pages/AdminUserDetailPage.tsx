import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Shield, 
  LayoutGrid, 
  ShoppingBag, 
  AlertTriangle,
  Loader2,
  ExternalLink,
  Eye,
  Ban,
  Trash2,
  CheckCircle2,
  X,
  Building2,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';
import { User as UserType, Property, Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export const AdminUserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PROPERTIES' | 'ORDERS' | 'ACTIVITY'>('PROPERTIES');

  // Modal states
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.email === 'gopikiranspam@gmail.com';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    if (userId) {
      fetchUserData();
    }
  }, [userId, isAdmin]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // In a real app, we'd have a getUserById, but for now we can filter from getUsers or implement it
      // Since I don't have getUserById in api.ts yet, I'll use getUsers and find
      const allUsers = await api.getUsers();
      const foundUser = allUsers.find(u => u.id === userId);
      
      if (foundUser) {
        const [userProps, userOrders, allQRs] = await Promise.all([
          api.getPropertiesByOwnerId(foundUser.id),
          api.getOrdersByUserId(foundUser.id),
          api.getQRCodes()
        ]);
        
        const userQR = allQRs.find(qr => qr.ownerId === foundUser.id);
        setUser({
          ...foundUser,
          qrId: foundUser.qrId || userQR?.qrId || null
        });
        
        setProperties(userProps);
        setOrders(userOrders);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!user || !reason) return;
    setIsProcessing(true);
    try {
      await api.blockUser(user.id, reason);
      setUser({ ...user, status: 'Blocked', blockReason: reason });
      setShowBlockModal(false);
      setReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user || !reason) return;
    setIsProcessing(true);
    try {
      await api.deleteUser(user.id, reason);
      setUser({ ...user, status: 'Deleted', deleteReason: reason });
      setShowDeleteModal(false);
      setReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 size={48} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center px-6">
        <AlertTriangle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">User Not Found</h2>
        <button onClick={() => navigate('/admin')} className="mt-8 rounded-2xl bg-brand px-8 py-4 font-bold text-black">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20 pt-24 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumbs / Back */}
        <button 
          onClick={() => navigate('/admin')}
          className="mb-8 flex items-center gap-2 text-[var(--text-secondary)] hover:text-brand transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-bold">Back to Admin Dashboard</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: User Profile Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-xl">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-brand/10 text-brand font-bold text-4xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">{user.name}</h2>
                  <p className="text-[var(--text-secondary)]">{user.email || 'No email provided'}</p>
                  
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <span className="rounded-lg bg-brand/10 px-3 py-1 text-xs font-bold uppercase text-brand">
                      {user.userType || user.role || 'Finder'}
                    </span>
                    <span className={`rounded-lg px-3 py-1 text-xs font-bold uppercase ${
                      user.status === 'Blocked' ? 'bg-red-500/10 text-red-500' : 
                      user.status === 'Deleted' ? 'bg-gray-500/10 text-gray-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {user.status || 'Active'}
                    </span>
                  </div>
                </div>

                <div className="space-y-6 border-t border-[var(--border)] pt-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg)] text-[var(--text-secondary)]">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Phone Number</p>
                      <p className="font-bold text-[var(--text-primary)]">{user.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg)] text-[var(--text-secondary)]">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Email Address</p>
                      <p className="font-bold text-[var(--text-primary)]">{user.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg)] text-[var(--text-secondary)]">
                      <LayoutGrid size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">User ID</p>
                      <p className="font-mono text-xs text-[var(--text-primary)]">{user.id}</p>
                    </div>
                  </div>
                </div>

                {/* Status Specific Info */}
                {(user.status === 'Blocked' || user.status === 'Deleted') && (
                  <div className={`mt-8 p-4 rounded-2xl border ${
                    user.status === 'Blocked' ? 'bg-red-500/5 border-red-500/20' : 'bg-gray-500/5 border-gray-500/20'
                  }`}>
                    <h4 className={`text-[10px] font-bold uppercase mb-1 ${
                      user.status === 'Blocked' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {user.status === 'Blocked' ? 'Block Reason' : 'Delete Reason'}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {user.status === 'Blocked' ? user.blockReason : user.deleteReason}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowBlockModal(true)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-3 text-xs font-bold text-red-500 transition-all hover:bg-red-500/10"
                  >
                    <Ban size={14} />
                    {user.status === 'Blocked' ? 'Update Block' : 'Block User'}
                  </button>
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-500/20 bg-gray-500/5 py-3 text-xs font-bold text-gray-500 transition-all hover:bg-gray-500/10"
                  >
                    <Trash2 size={14} />
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Properties, Orders, Activity */}
          <div className="lg:col-span-2">
            <div className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-xl">
              {/* Tabs */}
              <div className="mb-8 flex gap-4 border-b border-[var(--border)]">
                <button 
                  onClick={() => setActiveTab('PROPERTIES')}
                  className={`pb-4 text-sm font-bold transition-all relative ${
                    activeTab === 'PROPERTIES' ? 'text-brand' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  Properties ({properties.length})
                  {activeTab === 'PROPERTIES' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-full" />}
                </button>
                <button 
                  onClick={() => setActiveTab('ORDERS')}
                  className={`pb-4 text-sm font-bold transition-all relative ${
                    activeTab === 'ORDERS' ? 'text-brand' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  Orders ({orders.length})
                  {activeTab === 'ORDERS' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-full" />}
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'PROPERTIES' && (
                  <div className="space-y-4">
                    {properties.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Building2 size={48} className="text-[var(--text-secondary)]/20 mb-4" />
                        <p className="text-[var(--text-secondary)]">No properties listed by this user.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {properties.map(prop => (
                          <div 
                            key={prop.id}
                            className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 transition-all hover:border-brand"
                          >
                            <div className="flex gap-4">
                              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                                <img 
                                  src={prop.imageUrl || prop.images?.[0]} 
                                  alt={prop.title}
                                  className="h-full w-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[var(--text-primary)] truncate">{prop.title}</h4>
                                <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                                  <MapPin size={12} />
                                  {prop.locality}, {prop.city}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-sm font-bold text-brand">₹{prop.price.toLocaleString()}</span>
                                  <button 
                                    onClick={() => navigate(`/property/${prop.title.toLowerCase().replace(/ /g, '-')}-${prop.id}`)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-brand uppercase"
                                  >
                                    View <ExternalLink size={10} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Insights Overlay */}
                            <div className="mt-4 flex items-center justify-around border-t border-[var(--border)] pt-4">
                              <div className="text-center">
                                <p className="text-xs font-bold text-[var(--text-primary)]">{prop.views || 0}</p>
                                <p className="text-[8px] font-bold uppercase text-[var(--text-secondary)]">Views</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-bold text-[var(--text-primary)]">{prop.scans || 0}</p>
                                <p className="text-[8px] font-bold uppercase text-[var(--text-secondary)]">Scans</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-bold text-[var(--text-primary)]">{prop.favoritesCount || 0}</p>
                                <p className="text-[8px] font-bold uppercase text-[var(--text-secondary)]">Favs</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-bold text-[var(--text-primary)]">{prop.reportCount || 0}</p>
                                <p className="text-[8px] font-bold uppercase text-red-500">Reports</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'ORDERS' && (
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <ShoppingBag size={48} className="text-[var(--text-secondary)]/20 mb-4" />
                        <p className="text-[var(--text-secondary)]">No orders found for this user.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map(order => (
                          <div key={order.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-[var(--text-secondary)]">Order ID: {order.id}</span>
                              <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${
                                order.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-sm font-bold text-[var(--text-primary)]">{order.boardType || 'Smart Tolet Board'}</p>
                                <p className="text-xs text-[var(--text-secondary)]">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                              <p className="text-lg font-bold text-brand">₹{order.amount}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(showBlockModal || showDeleteModal) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowBlockModal(false);
                setShowDeleteModal(false);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-2xl"
            >
              <div className="mb-6 flex justify-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  showBlockModal ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'
                }`}>
                  {showBlockModal ? <Ban size={32} /> : <Trash2 size={32} />}
                </div>
              </div>

              <h3 className="mb-2 text-center text-xl font-bold text-[var(--text-primary)]">
                {showBlockModal ? 'Block User' : 'Delete User'}
              </h3>
              <p className="mb-6 text-center text-sm text-[var(--text-secondary)]">
                Please provide a reason for {showBlockModal ? 'blocking' : 'deleting'} <strong>{user.name}</strong>.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Reason</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Fraudulent activity, Policy violation..."
                    className="h-32 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm outline-none focus:border-brand resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => {
                      setShowBlockModal(false);
                      setShowDeleteModal(false);
                    }}
                    className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-bold text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={showBlockModal ? handleBlockUser : handleDeleteUser}
                    disabled={!reason || isProcessing}
                    className={`flex-1 rounded-xl py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50 ${
                      showBlockModal ? 'bg-red-500 shadow-red-500/20' : 'bg-gray-500 shadow-gray-500/20'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
