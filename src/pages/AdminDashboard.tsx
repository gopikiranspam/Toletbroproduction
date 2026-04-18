import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  QrCode, 
  ShoppingBag, 
  MessageSquareWarning, 
  Loader2, 
  Search, 
  Filter, 
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  ArrowLeft,
  Download,
  Eye,
  Trash2,
  Ban,
  CheckCircle2,
  X,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  File as FileIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { User, Order, Complaint } from '../types';
import { AdminQRPanel } from './AdminQRPanel';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

type AdminTab = 'QR' | 'USERS' | 'ORDERS' | 'COMPLAINTS';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, isAuthReady } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('USERS');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'All' | 'Owner' | 'Agent' | 'Finder'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Blocked'>('All');
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.email === 'gopikiranspam@gmail.com';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    if (isAuthReady && isAdmin) {
      fetchData();
    }
  }, [isAuthReady, isAdmin, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'USERS') {
        const [userData, qrData, propData] = await Promise.all([
          api.getUsers(),
          api.getQRCodes(),
          api.getProperties()
        ]);
        
        // Enrich users with their QR and Property info if not already present
        const enrichedUsers = userData.map(u => {
          const userQR = qrData.find(qr => qr.ownerId === u.id);
          const userProp = propData.find(p => p.ownerId === u.id);
          return {
            ...u,
            qrId: u.qrId || userQR?.qrId || null,
            propertyId: u.propertyId || userProp?.id || null
          };
        });
        
        setUsers(enrichedUsers);
      } else if (activeTab === 'ORDERS') {
        const data = await api.getOrders();
        setOrders(data);
      } else if (activeTab === 'COMPLAINTS') {
        const data = await api.getComplaints();
        setComplaints(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.phone.includes(searchQuery) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.includes(searchQuery);
      
      const matchesType = userTypeFilter === 'All' || 
        (userTypeFilter === 'Finder' ? (!u.userType && u.role !== 'OWNER') : u.userType === userTypeFilter || (userTypeFilter === 'Owner' && u.role === 'OWNER'));
      
      const matchesStatus = statusFilter === 'All' || (u.status || 'Active') === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [users, searchQuery, userTypeFilter, statusFilter]);

  const handleExport = (format: 'xlsx' | 'csv' | 'pdf') => {
    const exportData = filteredUsers.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email || 'N/A',
      Phone: u.phone,
      Type: u.userType || u.role || 'Finder',
      Status: u.status || 'Active',
      'Property ID': u.propertyId || 'None',
      'QR ID': u.qrId || 'None',
      'Report Count': u.reportCount || 0
    }));

    if (format === 'xlsx' || format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      XLSX.writeFile(wb, `ToLetBro_Users_${new Date().getTime()}.${format}`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      (doc as any).autoTable({
        head: [['Name', 'Phone', 'Type', 'Status', 'Property ID']],
        body: exportData.map(u => [u.Name, u.Phone, u.Type, u.Status, u['Property ID']]),
      });
      doc.save(`ToLetBro_Users_${new Date().getTime()}.pdf`);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser || !blockReason) return;
    setIsBlocking(true);
    try {
      await api.blockUser(selectedUser.id, blockReason);
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'Blocked', blockReason } : u));
      setShowBlockModal(false);
      setBlockReason('');
      setSelectedUser(null);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || !deleteReason) return;
    setIsDeleting(true);
    try {
      await api.deleteUser(selectedUser.id, deleteReason);
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'Deleted', deleteReason } : u));
      setShowDeleteModal(false);
      setDeleteReason('');
      setSelectedUser(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center">
        <Loader2 size={48} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center px-6">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Access Denied</h2>
        <p className="mt-2 text-[var(--text-secondary)]">You do not have permission to view this page.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-8 rounded-2xl bg-brand px-8 py-4 font-bold text-black"
        >
          Go Home
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'USERS', label: 'User Management', icon: Users },
    { id: 'QR', label: 'QR Management', icon: QrCode },
    { id: 'ORDERS', label: 'Online Orders', icon: ShoppingBag },
    { id: 'COMPLAINTS', label: 'Complaints', icon: MessageSquareWarning },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20 pt-24 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-5xl">
              Admin <span className="text-brand">Dashboard</span>
            </h1>
            <p className="mt-2 text-[var(--text-secondary)]">Central control panel for ToLetBro platform.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/slides')}
              className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] transition-all hover:border-brand"
            >
              Manage Slides
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8 flex flex-wrap gap-2 rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-brand text-black shadow-lg shadow-brand/20' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg)]'
              }`}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'QR' && <AdminQRPanel embedded />}
              
              {activeTab === 'USERS' && (
                <div className="space-y-6">
                  {/* Filters & Search */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                        <input 
                          type="text"
                          placeholder="Search users by name, phone, email or ID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] py-3 pl-12 pr-4 text-sm outline-none focus:border-brand"
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-3 py-1.5">
                          <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Export:</span>
                          <button onClick={() => handleExport('xlsx')} className="p-1.5 text-[var(--text-secondary)] hover:text-brand" title="Excel"><FileSpreadsheet size={18} /></button>
                          <button onClick={() => handleExport('csv')} className="p-1.5 text-[var(--text-secondary)] hover:text-brand" title="CSV"><FileText size={18} /></button>
                          <button onClick={() => handleExport('pdf')} className="p-1.5 text-[var(--text-secondary)] hover:text-brand" title="PDF"><FileIcon size={18} /></button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">User Type</label>
                        <div className="flex gap-1 rounded-lg bg-[var(--bg)] p-1">
                          {['All', 'Owner', 'Agent', 'Finder'].map((type) => (
                            <button
                              key={type}
                              onClick={() => setUserTypeFilter(type as any)}
                              className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                                userTypeFilter === type ? 'bg-brand text-black' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Status</label>
                        <div className="flex gap-1 rounded-lg bg-[var(--bg)] p-1">
                          {['All', 'Active', 'Blocked'].map((status) => (
                            <button
                              key={status}
                              onClick={() => setStatusFilter(status as any)}
                              className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                                statusFilter === status ? 'bg-brand text-black' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] shadow-sm max-h-[600px] overflow-y-auto">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10">
                          <tr className="border-b border-[var(--border)] bg-[var(--bg)] shadow-sm">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Username</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">User Type</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Phone No.</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Property ID</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">QR S.No</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Reported</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {loading ? (
                            <tr>
                              <td colSpan={8} className="py-20 text-center">
                                <Loader2 size={32} className="mx-auto animate-spin text-brand" />
                              </td>
                            </tr>
                          ) : filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-20 text-center text-[var(--text-secondary)]">
                                No users found matching your filters.
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((u) => (
                              <tr 
                                key={u.id} 
                                onClick={() => navigate(`/admin/users/${u.id}`)}
                                className="transition-colors hover:bg-[var(--bg)]/30 cursor-pointer"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand font-bold">
                                      {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-bold text-[var(--text-primary)]">{u.name}</div>
                                      <div className="text-[10px] text-[var(--text-secondary)] font-mono">{u.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase ${
                                    u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' :
                                    u.userType === 'Agent' ? 'bg-blue-500/10 text-blue-500' : 
                                    u.role === 'OWNER' ? 'bg-orange-500/10 text-orange-500' : 'bg-brand/10 text-brand'
                                  }`}>
                                    {u.userType || u.role || 'Finder'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                                  {u.phone}
                                </td>
                                <td className="px-6 py-4 text-xs font-mono text-[var(--text-secondary)]">
                                  {u.propertyId || 'None'}
                                </td>
                                <td className="px-6 py-4 text-xs font-mono text-[var(--text-secondary)]">
                                  {u.qrId || 'N/A'}
                                </td>
                                <td className="px-6 py-4">
                                  {u.reportCount ? (
                                    <div className="flex items-center gap-1 text-red-500 font-bold text-xs">
                                      <AlertTriangle size={14} />
                                      {u.reportCount}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-[var(--text-secondary)]/30">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1.5">
                                    <div className={`h-2 w-2 rounded-full ${
                                      u.status === 'Blocked' ? 'bg-red-500' : 
                                      u.status === 'Deleted' ? 'bg-gray-500' : 'bg-emerald-500'
                                    }`} />
                                    <span className={`text-xs font-bold ${
                                      u.status === 'Blocked' ? 'text-red-500' : 
                                      u.status === 'Deleted' ? 'text-gray-500' : 'text-emerald-500'
                                    }`}>
                                      {u.status || 'Active'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => {
                                        setSelectedUser(u);
                                        setShowBlockModal(true);
                                      }}
                                      className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500"
                                      title="Block User"
                                    >
                                      <Ban size={18} />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedUser(u);
                                        setShowDeleteModal(true);
                                      }}
                                      className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500"
                                      title="Delete User"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ORDERS' && (
                <div className="flex flex-col items-center justify-center py-32 text-center rounded-[2.5rem] border-2 border-dashed border-[var(--border)] bg-[var(--card-bg)]">
                  <ShoppingBag size={48} className="text-[var(--text-secondary)] mb-4" />
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Online Orders</h3>
                  <p className="mt-2 text-[var(--text-secondary)] max-w-md">Track and manage Smart Tolet Board orders from owners.</p>
                  {loading ? (
                    <Loader2 size={24} className="mt-6 animate-spin text-brand" />
                  ) : orders.length === 0 ? (
                    <div className="mt-8 rounded-2xl bg-[var(--bg)] px-6 py-3 text-sm font-bold text-[var(--text-secondary)]">
                      No orders recorded yet
                    </div>
                  ) : (
                    <div className="mt-8 w-full max-w-4xl px-6">
                      {/* Order list implementation */}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'COMPLAINTS' && (
                <div className="flex flex-col items-center justify-center py-32 text-center rounded-[2.5rem] border-2 border-dashed border-[var(--border)] bg-[var(--card-bg)]">
                  <MessageSquareWarning size={48} className="text-[var(--text-secondary)] mb-4" />
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Complaints & Support</h3>
                  <p className="mt-2 text-[var(--text-secondary)] max-w-md">Manage user complaints and support requests.</p>
                  {loading ? (
                    <Loader2 size={24} className="mt-6 animate-spin text-brand" />
                  ) : complaints.length === 0 ? (
                    <div className="mt-8 rounded-2xl bg-[var(--bg)] px-6 py-3 text-sm font-bold text-[var(--text-secondary)]">
                      No complaints reported
                    </div>
                  ) : (
                    <div className="mt-8 w-full max-w-4xl px-6">
                      {/* Complaints list implementation */}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* User Details Modal - REMOVED since we have a new page */}

      {/* Block User Modal */}
      <AnimatePresence>
        {showBlockModal && selectedUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlockModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-2xl"
            >
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <Ban size={32} />
                </div>
              </div>

              <h3 className="mb-2 text-center text-xl font-bold text-[var(--text-primary)]">Block User</h3>
              <p className="mb-6 text-center text-sm text-[var(--text-secondary)]">
                Please provide a reason for blocking <strong>{selectedUser.name}</strong>.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Reason for Blocking</label>
                  <textarea 
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="e.g., Fraudulent activity, Policy violation..."
                    className="h-32 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm outline-none focus:border-brand resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowBlockModal(false)}
                    className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-bold text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleBlockUser}
                    disabled={!blockReason || isBlocking}
                    className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 disabled:opacity-50"
                  >
                    {isBlocking ? 'Blocking...' : 'Confirm Block'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-2xl"
            >
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-500/10 text-gray-500">
                  <Trash2 size={32} />
                </div>
              </div>

              <h3 className="mb-2 text-center text-xl font-bold text-[var(--text-primary)]">Delete User</h3>
              <p className="mb-6 text-center text-sm text-[var(--text-secondary)]">
                Please provide a reason for deleting <strong>{selectedUser.name}</strong>. This will hide their properties from the dashboard.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Reason for Deletion</label>
                  <textarea 
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="e.g., User requested, Duplicate account..."
                    className="h-32 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm outline-none focus:border-brand resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-bold text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteUser}
                    disabled={!deleteReason || isDeleting}
                    className="flex-1 rounded-xl bg-gray-500 py-3 text-sm font-bold text-white shadow-lg shadow-gray-500/20 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
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
