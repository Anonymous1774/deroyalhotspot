import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import api from './services/api';
import { 
  LayoutDashboard, 
  Wifi, 
  Settings, 
  FileSpreadsheet, 
  History, 
  Network, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Mail,
  ExternalLink,
  ChevronRight,
  Terminal,
  Activity,
  Cpu
} from 'lucide-react';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  lastLogin: string | null;
}

// --- Protected Route Helper Wrapper ---
const ProtectedRoute = ({ children, admin, loading }: { children: React.ReactNode; admin: AdminUser | null; loading: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !admin && !localStorage.getItem('dhos_token')) {
      navigate('/admin/login', { replace: true, state: { from: location } });
    }
  }, [admin, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center font-sans">
        <svg className="animate-spin h-10 w-10 text-brand-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-neutral-500 font-semibold">Verifying secure administrator session...</p>
      </div>
    );
  }

  return admin ? <>{children}</> : null;
};

// --- Sub-pages ---
const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState('');

  const [routerStatus, setRouterStatus] = useState<any>(null);
  const [loadingRouter, setLoadingRouter] = useState(true);
  const [errorRouter, setErrorRouter] = useState('');

  const fetchDashboardData = async () => {
    setLoadingStats(true);
    setErrorStats('');
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data && response.data.success) {
        setStats(response.data.data);
      } else {
        setErrorStats(response.data.message || 'Failed to fetch dashboard statistics.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorStats(err.response?.data?.message || 'Error occurred while loading dashboard statistics.');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRouterStatus = async () => {
    setLoadingRouter(true);
    setErrorRouter('');
    try {
      const response = await api.get('/router/status');
      if (response.data && response.data.success) {
        setRouterStatus(response.data.data);
      } else {
        setErrorRouter(response.data.message || 'Failed to fetch router status.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorRouter(err.response?.data?.message || 'Error occurred while loading router status.');
    } finally {
      setLoadingRouter(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRouterStatus();
  }, []);

  const getStatusBadge = () => {
    if (loadingRouter) {
      return (
        <div className="flex items-center gap-2 bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-medium font-medium text-sm">
          <svg className="animate-spin h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Router...
        </div>
      );
    }

    if (!routerStatus || routerStatus.status === 'OFFLINE') {
      return (
        <div className="flex items-center gap-2 bg-danger/10 text-danger px-3 py-1.5 rounded-medium font-medium text-sm border border-danger/20">
          <span className="w-2 h-2 rounded-full bg-danger"></span>
          Router Offline
        </div>
      );
    }

    if (routerStatus.status === 'SIMULATED') {
      return (
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-medium font-medium text-sm border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          Simulated Mode
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-medium font-medium text-sm border border-success/20">
        <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
        Router Online
      </div>
    );
  };

  const getModuleBadgeColor = (moduleName: string) => {
    switch (moduleName.toUpperCase()) {
      case 'AUTH':
        return 'bg-blue-50 text-blue-700 border-blue-100 border';
      case 'VOUCHER':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 border';
      case 'ROUTER':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100 border';
      case 'SETTINGS':
        return 'bg-amber-50 text-amber-700 border-amber-100 border';
      case 'SYSTEM':
        return 'bg-rose-50 text-rose-700 border-rose-100 border';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200 border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 font-sans">Dashboard</h1>
          <p className="text-neutral-500 text-sm">Real-time overview of your hotspot system.</p>
        </div>
        {getStatusBadge()}
      </div>

      {errorRouter && (
        <div className="bg-danger/10 border border-danger/25 text-danger px-4 py-3 rounded-medium text-xs font-semibold flex items-center gap-2 animate-scale-in">
          <AlertCircle size={16} />
          <span>Router Error: {errorRouter}</span>
        </div>
      )}

      {errorStats && (
        <div className="bg-danger/10 border border-danger/25 text-danger px-4 py-3 rounded-medium text-xs font-semibold flex items-center gap-2 animate-scale-in">
          <AlertCircle size={16} />
          <span>Stats Error: {errorStats}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { title: 'Total Income', value: stats ? `₦${Number(stats.totalIncome || 0).toLocaleString()}` : '-', change: 'Revenue from active/used plans', color: 'border-brand-600 text-brand-700' },
          { title: 'Online Users', value: stats ? String(stats.onlineUsersCount) : '-', change: 'Active internet sessions', color: 'border-warning text-warning' },
          { title: 'Active Vouchers', value: stats ? String(stats.activeVouchersCount) : '-', change: 'Vouchers currently active', color: 'border-success text-success' },
          { title: 'Unused Vouchers', value: stats ? String(stats.unusedVouchersCount) : '-', change: 'Ready for print/export', color: 'border-info text-info' },
          { title: 'Total Plans', value: stats ? String(stats.plansCount) : '-', change: 'Bronze, Silver, Gold, etc.', color: 'border-neutral-400 text-neutral-600' }
        ].map((card, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-card shadow-small border-l-4 ${card.color} animate-scale-in`}>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">{card.title}</p>
            <p className="text-3xl font-bold mt-2 text-neutral-900">{loadingStats ? '...' : card.value}</p>
            <p className="text-xs text-neutral-500 mt-2">{card.change}</p>
          </div>
        ))}
      </div>

      {/* Health & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-card shadow-small lg:col-span-2 space-y-4 animate-scale-in">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-neutral-900 font-sans">Router Health Monitoring</h3>
            <span className="text-xs text-neutral-400 font-medium">
              Device: {routerStatus?.identity || 'Detecting...'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-neutral-50 p-4 rounded-medium text-center border border-neutral-100 hover:shadow-small transition-shadow">
              <Cpu className="mx-auto text-brand-600 mb-1" size={24} />
              <p className="text-xs text-neutral-500 font-semibold">CPU Usage</p>
              <p className="text-lg font-extrabold text-neutral-800 mt-1">
                {routerStatus ? `${routerStatus.cpuUsage}%` : '-'}
              </p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-medium text-center border border-neutral-100 hover:shadow-small transition-shadow">
              <Activity className="mx-auto text-brand-600 mb-1" size={24} />
              <p className="text-xs text-neutral-500 font-semibold">RAM Usage</p>
              <p className="text-lg font-extrabold text-neutral-800 mt-1">
                {routerStatus ? `${routerStatus.memoryUsage}%` : '-'}
              </p>
              {routerStatus && (
                <span className="text-[10px] text-neutral-400">
                  {routerStatus.memoryFree}MB / {routerStatus.memoryTotal}MB free
                </span>
              )}
            </div>
            <div className="bg-neutral-50 p-4 rounded-medium text-center border border-neutral-100 hover:shadow-small transition-shadow">
              <History className="mx-auto text-brand-600 mb-1" size={24} />
              <p className="text-xs text-neutral-500 font-semibold">Uptime</p>
              <p className="text-base font-extrabold text-neutral-800 mt-1 truncate">
                {routerStatus ? routerStatus.uptime : '-'}
              </p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-medium text-center border border-neutral-100 hover:shadow-small transition-shadow">
              <Users className="mx-auto text-brand-600 mb-1" size={24} />
              <p className="text-xs text-neutral-500 font-semibold">Active Users</p>
              <p className="text-lg font-extrabold text-neutral-800 mt-1">
                {routerStatus ? routerStatus.connectedUsers : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-card shadow-small space-y-4 flex flex-col justify-between animate-scale-in">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 font-sans">Quick Operations</h3>
            <p className="text-sm text-neutral-500 mt-1">Common administrative shortcuts.</p>
          </div>
          <div className="space-y-2">
            <Link to="/admin/vouchers" className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 px-4 rounded-medium text-sm font-semibold transition-colors duration-150 flex items-center justify-between">
              <span>Generate Vouchers</span>
              <ChevronRight size={16} />
            </Link>
            <Link to="/admin/plans" className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2.5 px-4 rounded-medium text-sm font-semibold transition-colors duration-150 flex items-center justify-between">
              <span>Create New Plan</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent System Activity */}
      <div className="bg-white p-6 rounded-card shadow-small space-y-4 animate-scale-in border border-neutral-100">
        <h3 className="text-lg font-bold text-neutral-900 font-sans">Recent System Activity</h3>
        <div className="divide-y divide-neutral-100 font-medium">
          {stats?.recentActivity?.map((activity: any) => (
            <div key={activity.id} className="py-3.5 flex justify-between items-center text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className={`border text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${getModuleBadgeColor(activity.module)}`}>
                    {activity.module}
                  </span>
                  <p className="font-bold text-neutral-900">{activity.action}</p>
                </div>
                <p className="text-xs text-neutral-500 font-normal">{activity.description}</p>
                {activity.admin && (
                  <p className="text-[10px] text-neutral-400 font-normal">
                    By: {activity.admin.fullName} ({activity.admin.email})
                  </p>
                )}
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {new Date(activity.createdAt).toLocaleDateString()} {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
            <p className="text-neutral-500 py-6 text-center text-sm font-normal">No recent activity logged.</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface InternetPlan {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  durationUnit: string;
  bandwidthProfileId: string;
  bandwidthProfile: {
    id: string;
    name: string;
    downloadSpeed: string;
    uploadSpeed: string;
  };
  price: number;
  status: string;
  createdAt: string;
}

const PlansPage = () => {
  const [plans, setPlans] = useState<InternetPlan[]>([]);
  const [profiles, setProfiles] = useState<BandwidthProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InternetPlan | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [duration, setDuration] = useState<number | ''>('');
  const [durationUnit, setDurationUnit] = useState('minutes');
  const [bandwidthProfile, setBandwidthProfile] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch plans
  const fetchPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/plans');
      if (response.data && response.data.success) {
        setPlans(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch plans.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active profiles for dropdown
  const fetchProfiles = async () => {
    try {
      const response = await api.get('/bandwidth-profiles');
      if (response.data && response.data.success) {
        const active = response.data.data.filter((p: any) => p.status === 'ACTIVE');
        setProfiles(active);
        if (active.length > 0) {
          setBandwidthProfile(active[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load bandwidth profiles:', err);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchProfiles();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setPrice('');
    setDuration('');
    setDurationUnit('minutes');
    if (profiles.length > 0) {
      setBandwidthProfile(profiles[0].name);
    } else {
      setBandwidthProfile('');
    }
    setDescription('');
    setStatus('ACTIVE');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (plan: InternetPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPrice(plan.price);
    setDuration(plan.duration);
    setDurationUnit(plan.durationUnit);
    setBandwidthProfile(plan.bandwidthProfile.name);
    setDescription(plan.description || '');
    setStatus(plan.status);
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (price === '' || price <= 0) {
      setFormError('Price must be greater than zero.');
      return;
    }
    if (duration === '' || duration <= 0) {
      setFormError('Duration must be greater than zero.');
      return;
    }
    if (!bandwidthProfile) {
      setFormError('Please select a bandwidth profile. Create one first if none exists.');
      return;
    }

    setFormSubmitting(true);
    const payload = {
      name,
      price: Number(price),
      duration: Number(duration),
      durationUnit,
      bandwidthProfile,
      description: description || undefined,
      status
    };

    try {
      if (editingPlan) {
        const res = await api.put(`/plans/${editingPlan.id}`, payload);
        if (res.data && res.data.success) {
          setModalOpen(false);
          fetchPlans();
        } else {
          setFormError(res.data.message || 'Failed to update plan.');
        }
      } else {
        const res = await api.post('/plans', payload);
        if (res.data && res.data.success) {
          setModalOpen(false);
          fetchPlans();
        } else {
          setFormError(res.data.message || 'Failed to create plan.');
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.error?.details) {
        const details = err.response.data.error.details;
        if (typeof details === 'object') {
          const errors = Object.keys(details)
            .map((k) => `${k}: ${details[k]._errors?.join(', ') || ''}`)
            .join(' | ');
          setFormError(errors || 'Validation failed.');
        } else {
          setFormError(err.response.data.error.details);
        }
      } else {
        setFormError(err.response?.data?.message || 'An error occurred.');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the plan "${name}"?`)) {
      return;
    }
    try {
      const res = await api.delete(`/plans/${id}`);
      if (res.data && res.data.success) {
        fetchPlans();
      } else {
        alert(res.data.message || 'Failed to delete plan.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Cannot delete plan. Make sure no vouchers are generated for this plan.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-card shadow-small space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-sans">Internet Plans</h2>
          <p className="text-sm text-neutral-500">Manage available hotspot bandwidth and duration plans.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-medium text-sm transition-colors duration-150"
        >
          + Create Plan
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/25 text-danger px-4 py-3 rounded-medium text-xs font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <AlertCircle className="mx-auto text-neutral-400" size={36} />
          <p className="text-neutral-500 font-medium">No internet plans configured yet.</p>
          <button onClick={openCreateModal} className="text-brand-600 font-semibold text-sm hover:underline">
            Click here to create your first plan
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-100 rounded-medium">
          <table className="min-w-full divide-y divide-neutral-100 text-left text-sm text-neutral-700">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Plan Name</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Bandwidth Profile</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-neutral-50/50">
                  <td className="px-6 py-4 font-bold text-neutral-900">
                    <div>
                      <p>{plan.name}</p>
                      {plan.description && <p className="text-xs text-neutral-400 font-normal mt-0.5">{plan.description}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">{plan.duration} {plan.durationUnit}</td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-semibold">{plan.bandwidthProfile.name}</span>
                      <span className="text-xs text-neutral-400 block font-normal">
                        ({plan.bandwidthProfile.downloadSpeed}/{plan.bandwidthProfile.uploadSpeed})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-brand-700">₦{plan.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      plan.status === 'ACTIVE' 
                        ? 'bg-success/15 text-success' 
                        : 'bg-danger/15 text-danger'
                    }`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => openEditModal(plan)}
                      className="text-brand-600 hover:text-brand-800 text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(plan.id, plan.name)}
                      className="text-danger hover:text-red-700 text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Overlay Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-modal w-full max-w-md p-6 shadow-xlarge border border-neutral-100 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-neutral-900 font-sans">
                {editingPlan ? 'Edit Internet Plan' : 'Create Internet Plan'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-500 hover:text-neutral-800">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="bg-danger/10 border border-danger/25 text-danger px-4 py-2.5 rounded-medium text-xs font-medium flex items-center gap-2 mb-4">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1 Hour Regular"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-neutral-200 rounded-medium py-2 px-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Price (₦)</label>
                  <input
                    type="number"
                    required
                    min={0.01}
                    step="any"
                    placeholder="100"
                    value={price}
                    onChange={(e) => setPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                    className="w-full border border-neutral-200 rounded-medium py-2 px-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Bandwidth Profile</label>
                  {profiles.length === 0 ? (
                    <div className="text-xs text-danger font-semibold mt-2.5">
                      No active profiles! Please create a profile first.
                    </div>
                  ) : (
                    <select
                      value={bandwidthProfile}
                      onChange={(e) => setBandwidthProfile(e.target.value)}
                      className="w-full border border-neutral-200 rounded-medium py-2.5 px-3 mt-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                    >
                      {profiles.map((p) => (
                        <option key={p.id} value={p.name}>{p.name} ({p.downloadSpeed}/{p.uploadSpeed})</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Duration Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="60"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value !== '' ? Number(e.target.value) : '')}
                    className="w-full border border-neutral-200 rounded-medium py-2 px-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Duration Unit</label>
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="w-full border border-neutral-200 rounded-medium py-2.5 px-3 mt-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Description (Optional)</label>
                <textarea
                  placeholder="Details about speeds, device limits, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-neutral-200 rounded-medium py-2 px-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-neutral-200 rounded-medium py-2.5 px-3 mt-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold py-2 px-4 rounded-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || profiles.length === 0}
                  className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-700 text-white font-semibold py-2 px-4 rounded-medium text-sm transition-colors flex items-center gap-1.5"
                >
                  {formSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Plan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface BandwidthProfile {
  id: string;
  name: string;
  downloadSpeed: string;
  uploadSpeed: string;
  mikrotikQueueName: string;
  status: string;
  createdAt: string;
}

const ProfilesPage = () => {
  const [profiles, setProfiles] = useState<BandwidthProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BandwidthProfile | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [downloadSpeed, setDownloadSpeed] = useState('');
  const [uploadSpeed, setUploadSpeed] = useState('');
  const [mikrotikQueueName, setMikrotikQueueName] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch profiles on mount
  const fetchProfiles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/bandwidth-profiles');
      if (response.data && response.data.success) {
        setProfiles(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch profiles.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error connecting to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const openCreateModal = () => {
    setEditingProfile(null);
    setName('');
    setDownloadSpeed('');
    setUploadSpeed('');
    setMikrotikQueueName('');
    setStatus('ACTIVE');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (profile: BandwidthProfile) => {
    setEditingProfile(profile);
    setName(profile.name);
    setDownloadSpeed(profile.downloadSpeed);
    setUploadSpeed(profile.uploadSpeed);
    setMikrotikQueueName(profile.mikrotikQueueName);
    setStatus(profile.status);
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    const payload = { name, downloadSpeed, uploadSpeed, mikrotikQueueName, status };

    try {
      if (editingProfile) {
        const res = await api.put(`/bandwidth-profiles/${editingProfile.id}`, payload);
        if (res.data && res.data.success) {
          setModalOpen(false);
          fetchProfiles();
        } else {
          setFormError(res.data.message || 'Failed to update profile.');
        }
      } else {
        const res = await api.post('/bandwidth-profiles', payload);
        if (res.data && res.data.success) {
          setModalOpen(false);
          fetchProfiles();
        } else {
          setFormError(res.data.message || 'Failed to create profile.');
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.error?.details) {
        // format validation errors
        const details = err.response.data.error.details;
        if (typeof details === 'object') {
          const errors = Object.keys(details)
            .map((k) => `${k}: ${details[k]._errors?.join(', ') || ''}`)
            .join(' | ');
          setFormError(errors || 'Validation failed.');
        } else {
          setFormError(err.response.data.error.details);
        }
      } else {
        setFormError(err.response?.data?.message || 'An error occurred.');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the profile "${name}"?`)) {
      return;
    }
    try {
      const res = await api.delete(`/bandwidth-profiles/${id}`);
      if (res.data && res.data.success) {
        fetchProfiles();
      } else {
        alert(res.data.message || 'Failed to delete profile.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Cannot delete profile. Make sure it is not referenced by any plan.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-card shadow-small space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-sans">Bandwidth Profiles</h2>
          <p className="text-sm text-neutral-500">Define upload/download rate limits linked to MikroTik Queue profiles.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-medium text-sm transition-colors duration-150"
        >
          + Create Profile
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/25 text-danger px-4 py-3 rounded-medium text-xs font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <AlertCircle className="mx-auto text-neutral-400" size={36} />
          <p className="text-neutral-500 font-medium">No bandwidth profiles configured yet.</p>
          <button onClick={openCreateModal} className="text-brand-600 font-semibold text-sm hover:underline">
            Click here to create your first profile
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-100 rounded-medium">
          <table className="min-w-full divide-y divide-neutral-100 text-left text-sm text-neutral-700">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Profile Name</th>
                <th className="px-6 py-4">Download Speed</th>
                <th className="px-6 py-4">Upload Speed</th>
                <th className="px-6 py-4">MikroTik Queue Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-neutral-50/50">
                  <td className="px-6 py-4 font-bold text-neutral-900">{profile.name}</td>
                  <td className="px-6 py-4">{profile.downloadSpeed}</td>
                  <td className="px-6 py-4">{profile.uploadSpeed}</td>
                  <td className="px-6 py-4 font-mono text-neutral-500">{profile.mikrotikQueueName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      profile.status === 'ACTIVE' 
                        ? 'bg-success/15 text-success' 
                        : 'bg-danger/15 text-danger'
                    }`}>
                      {profile.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => openEditModal(profile)}
                      className="text-brand-600 hover:text-brand-800 text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(profile.id, profile.name)}
                      className="text-danger hover:text-red-700 text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Overlay Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-modal w-full max-w-md p-6 shadow-xlarge border border-neutral-100 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-neutral-900 font-sans">
                {editingProfile ? 'Edit Bandwidth Profile' : 'Create Bandwidth Profile'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-500 hover:text-neutral-800">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="bg-danger/10 border border-danger/25 text-danger px-4 py-2.5 rounded-medium text-xs font-medium flex items-center gap-2 mb-4">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Profile Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Platinum"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-neutral-200 rounded-medium py-2 px-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Download Speed</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5M or 5Mbps"
                    value={downloadSpeed}
                    onChange={(e) => setDownloadSpeed(e.target.value)}
                    className="w-full border border-neutral-200 rounded-medium py-2 px-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Upload Speed</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2M or 2Mbps"
                    value={uploadSpeed}
                    onChange={(e) => setUploadSpeed(e.target.value)}
                    className="w-full border border-neutral-200 rounded-medium py-2 px-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">MikroTik Queue Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. platinum_queue"
                  value={mikrotikQueueName}
                  onChange={(e) => setMikrotikQueueName(e.target.value)}
                  className="w-full border border-neutral-200 rounded-medium py-2 px-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-neutral-200 rounded-medium py-2.5 px-3 mt-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold py-2 px-4 rounded-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-700 text-white font-semibold py-2 px-4 rounded-medium text-sm transition-colors flex items-center gap-1.5"
                >
                  {formSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Profile</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface Voucher {
  id: string;
  code: string;
  planId: string;
  plan: {
    id: string;
    name: string;
    price: number;
    duration: number;
    durationUnit: string;
    bandwidthProfile: {
      name: string;
      downloadSpeed: string;
      uploadSpeed: string;
    };
  };
  status: string;
  createdAt: string;
  activatedAt: string | null;
  expiresAt: string | null;
}

const VouchersPage = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [plans, setPlans] = useState<InternetPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  // Modal bulk generate states
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [generateQuantity, setGenerateQuantity] = useState<number | ''>(50);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchVouchers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/vouchers', {
        params: {
          status: statusFilter,
          planId: planFilter,
          search: searchQuery,
          page,
          limit
        }
      });
      if (response.data && response.data.success) {
        setVouchers(response.data.data.vouchers);
        setTotalPages(response.data.data.totalPages);
        setTotalCount(response.data.data.total);
      } else {
        setError(response.data.message || 'Failed to fetch vouchers.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans');
      if (response.data && response.data.success) {
        const activePlans = response.data.data.filter((p: any) => p.status === 'ACTIVE');
        setPlans(activePlans);
        if (activePlans.length > 0) {
          setSelectedPlanId(activePlans[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [statusFilter, planFilter, searchQuery, page]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handlePlanFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlanFilter(e.target.value);
    setPage(1);
  };

  const openGenerateModal = () => {
    if (plans.length === 0) {
      alert('You must create an active internet plan before generating vouchers.');
      return;
    }
    setFormError('');
    setGenerateQuantity(50);
    if (plans.length > 0) {
      setSelectedPlanId(plans[0].id);
    }
    setGenerateModalOpen(true);
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedPlanId) {
      setFormError('Please select a plan.');
      return;
    }
    if (!generateQuantity || generateQuantity < 1 || generateQuantity > 500) {
      setFormError('Quantity must be between 1 and 500.');
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await api.post('/vouchers/generate', {
        planId: selectedPlanId,
        count: Number(generateQuantity)
      });
      if (res.data && res.data.success) {
        setGenerateModalOpen(false);
        setPage(1);
        fetchVouchers();
      } else {
        setFormError(res.data.message || 'Failed to generate vouchers.');
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error occurred while generating vouchers.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDisable = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to disable voucher "${code}"?`)) {
      return;
    }
    try {
      const res = await api.put(`/vouchers/${id}/disable`);
      if (res.data && res.data.success) {
        fetchVouchers();
      } else {
        alert(res.data.message || 'Failed to disable voucher.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error occurred while disabling voucher.');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete voucher "${code}"?`)) {
      return;
    }
    try {
      const res = await api.delete(`/vouchers/${id}`);
      if (res.data && res.data.success) {
        fetchVouchers();
      } else {
        alert(res.data.message || 'Failed to delete voucher.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error occurred while deleting voucher.');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("WARNING: Are you absolutely sure you want to delete ALL vouchers? This will also clear all online hotspot sessions and active router accounts! This action CANNOT be undone.")) {
      return;
    }
    if (!window.confirm("Double confirmation: Delete everything?")) {
      return;
    }
    try {
      const res = await api.delete('/vouchers/delete-all');
      if (res.data && res.data.success) {
        alert("All vouchers and sessions deleted successfully.");
        fetchVouchers();
      } else {
        alert(res.data.message || 'Failed to delete all vouchers.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error occurred while deleting all vouchers.');
    }
  };

  const exportVouchers = () => {
    if (vouchers.length === 0) return;
    const headers = ['Voucher Code', 'Plan', 'Bandwidth Profile', 'Price', 'Status', 'Generated At'];
    const rows = vouchers.map((v) => [
      v.code,
      v.plan.name,
      `${v.plan.bandwidthProfile.name} (${v.plan.bandwidthProfile.downloadSpeed}/${v.plan.bandwidthProfile.uploadSpeed})`,
      `₦${v.plan.price}`,
      v.status,
      new Date(v.createdAt).toLocaleString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map((e) => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dhos_vouchers_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-card shadow-small space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-sans">Vouchers</h2>
          <p className="text-sm text-neutral-500">Generate, export, and search codes for internet plans.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={openGenerateModal}
            className="flex-1 sm:flex-initial bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-medium text-sm transition-colors duration-150"
          >
            Bulk Generate
          </button>
          <button 
            onClick={exportVouchers}
            disabled={vouchers.length === 0}
            className="flex-1 sm:flex-initial bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-800 font-semibold py-2 px-4 rounded-medium text-sm transition-colors duration-150"
          >
            Export CSV
          </button>
          <button 
            onClick={handleDeleteAll}
            disabled={vouchers.length === 0}
            className="flex-1 sm:flex-initial bg-danger/10 hover:bg-danger/20 disabled:opacity-50 disabled:cursor-not-allowed text-danger font-semibold py-2 px-4 rounded-medium text-sm transition-colors duration-150 border border-danger/25"
          >
            Delete All
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Search voucher codes..." 
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1 border border-neutral-200 rounded-medium py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all" 
        />
        <div className="flex gap-4">
          <select 
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="border border-neutral-200 rounded-medium py-2 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="UNUSED">Unused</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="DISABLED">Disabled</option>
          </select>

          <select 
            value={planFilter}
            onChange={handlePlanFilterChange}
            className="border border-neutral-200 rounded-medium py-2 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all"
          >
            <option value="All">All Plans</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/25 text-danger px-4 py-3 rounded-medium text-xs font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="text-center py-12 space-y-3 border border-neutral-100 rounded-medium bg-neutral-50/50">
          <AlertCircle className="mx-auto text-neutral-400" size={36} />
          <p className="text-neutral-500 font-medium">No vouchers found matching filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-neutral-100 rounded-medium">
            <table className="min-w-full divide-y divide-neutral-100 text-left text-sm text-neutral-700">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Voucher Code</th>
                  <th className="px-6 py-4">Associated Plan</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Generated At</th>
                  <th className="px-6 py-4">Activated At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-neutral-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-neutral-900 tracking-wider">{v.code}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p>{v.plan.name}</p>
                        <span className="text-xs text-neutral-400 font-normal">
                          ({v.plan.bandwidthProfile.name} - {v.plan.duration} {v.plan.durationUnit})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-700">₦{v.plan.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        v.status === 'UNUSED' ? 'bg-neutral-100 text-neutral-700' :
                        v.status === 'ACTIVE' ? 'bg-success/15 text-success' :
                        v.status === 'EXPIRED' ? 'bg-warning/15 text-warning' :
                        'bg-danger/15 text-danger'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 text-xs">
                      {new Date(v.createdAt).toLocaleDateString()} {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-neutral-500 text-xs">
                      {v.activatedAt ? (
                        <>
                          {new Date(v.activatedAt).toLocaleDateString()} {new Date(v.activatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {(v.status === 'UNUSED' || v.status === 'ACTIVE') && (
                        <button 
                          onClick={() => handleDisable(v.id, v.code)}
                          className="text-brand-600 hover:text-brand-800 text-sm font-semibold"
                        >
                          Disable
                        </button>
                      )}
                      {v.status === 'UNUSED' && (
                        <button 
                          onClick={() => handleDelete(v.id, v.code)}
                          className="text-danger hover:text-red-700 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-neutral-50 px-4 py-3 rounded-medium border border-neutral-100 text-sm font-medium text-neutral-600">
              <p>Showing page {page} of {totalPages} ({totalCount} total vouchers)</p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 border border-neutral-200 rounded-medium bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 border border-neutral-200 rounded-medium bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Generate Modal */}
      {generateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-modal w-full max-w-md p-6 shadow-xlarge border border-neutral-100 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-neutral-900 font-sans">Bulk Generate Vouchers</h3>
              <button onClick={() => setGenerateModalOpen(false)} className="text-neutral-500 hover:text-neutral-800">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="bg-danger/10 border border-danger/25 text-danger px-4 py-2.5 rounded-medium text-xs font-medium flex items-center gap-2 mb-4">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Select Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full border border-neutral-200 rounded-medium py-2.5 px-3 mt-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all font-sans"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} (₦{plan.price} - {plan.bandwidthProfile.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Quantity to Generate</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={500}
                  placeholder="50"
                  value={generateQuantity}
                  onChange={(e) => setGenerateQuantity(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full border border-neutral-200 rounded-medium py-2 px-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                />
                <p className="text-xs text-neutral-400 mt-1">Generate up to 500 codes in a single batch.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGenerateModalOpen(false)}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold py-2 px-4 rounded-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-700 text-white font-semibold py-2 px-4 rounded-medium text-sm transition-colors flex items-center gap-1.5"
                >
                  {formSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span>Generate Vouchers</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface HotspotSession {
  id: string;
  voucherId: string;
  voucher: {
    code: string;
    plan: {
      name: string;
      duration: number;
      durationUnit: string;
    };
  };
  username: string;
  ipAddress: string;
  macAddress: string;
  loginTime: string;
  status: string;
}

const SessionsPage = () => {
  const [sessions, setSessions] = useState<HotspotSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const response = await api.get('/hotspot/sessions');
      if (response.data && response.data.success) {
        setSessions(response.data.data.sessions);
      } else {
        setError(response.data.message || 'Failed to fetch active sessions.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDisconnect = async (username: string) => {
    if (!window.confirm(`Are you sure you want to disconnect user "${username}"?`)) {
      return;
    }
    try {
      const res = await api.post('/hotspot/disconnect', { username });
      if (res.data && res.data.success) {
        fetchSessions();
      } else {
        alert(res.data.message || 'Failed to disconnect user.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error occurred while disconnecting user.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-card shadow-small space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-sans">Active Hotspot Sessions</h2>
          <p className="text-sm text-neutral-500">Monitor customers currently online through MikroTik RouterOS.</p>
        </div>
        <button 
          onClick={() => fetchSessions(true)}
          disabled={loading || refreshing}
          className="bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-neutral-800 font-semibold py-2 px-4 rounded-medium text-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Activity size={16} className={refreshing ? 'animate-spin text-brand-600' : ''} /> 
          <span>{refreshing ? 'Refreshing...' : 'Refresh Users'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/25 text-danger px-4 py-3 rounded-medium text-xs font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 space-y-3 border border-neutral-100 rounded-medium bg-neutral-50/50 animate-scale-in">
          <Wifi className="mx-auto text-neutral-400 animate-pulse" size={36} />
          <p className="text-neutral-500 font-medium">No hotspot sessions are currently active.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-100 rounded-medium animate-scale-in">
          <table className="min-w-full divide-y divide-neutral-100 text-left text-sm text-neutral-700">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Username (Voucher)</th>
                <th className="px-6 py-4">Plan Name</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">MAC Address</th>
                <th className="px-6 py-4">Login Time</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50/50">
                  <td className="px-6 py-4 font-mono font-bold text-neutral-900">{s.username}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p>{s.voucher.plan.name}</p>
                      <span className="text-xs text-neutral-400 font-normal">
                        ({s.voucher.plan.duration} {s.voucher.plan.durationUnit})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{s.ipAddress}</td>
                  <td className="px-6 py-4 font-mono text-neutral-500">{s.macAddress}</td>
                  <td className="px-6 py-4 text-xs text-neutral-500">
                    {new Date(s.loginTime).toLocaleDateString()} {new Date(s.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDisconnect(s.username)}
                      className="text-danger hover:text-red-700 text-sm font-semibold bg-danger/10 hover:bg-danger/20 py-1.5 px-3 rounded-medium transition-colors"
                    >
                      Disconnect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

interface ActivityLog {
  id: string;
  adminId: string | null;
  admin: {
    fullName: string;
    email: string;
    role: string;
  } | null;
  action: string;
  module: string;
  description: string;
  ipAddress: string | null;
  createdAt: string;
}

const LogsPage = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and pagination
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // For expanding descriptions (VPS/MikroTik errors)
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/logs', {
        params: {
          search: search || undefined,
          module: moduleFilter !== 'All' ? moduleFilter : undefined,
          page,
          limit: 15
        }
      });
      if (response.data && response.data.success) {
        setLogs(response.data.data.logs);
        setTotalPages(response.data.data.totalPages);
        setTotalLogs(response.data.data.total);
      } else {
        setError(response.data.message || 'Failed to fetch logs.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while loading activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getModuleBadgeColor = (moduleName: string) => {
    switch (moduleName.toUpperCase()) {
      case 'AUTH':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'VOUCHER':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'ROUTER':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'SETTINGS':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'SYSTEM':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <div className="bg-white p-6 rounded-card shadow-small space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-sans">Activity Audit Logs</h2>
          <p className="text-sm text-neutral-500">Immutable trace of administrator log-ins, voucher generations, and router alerts.</p>
        </div>

        {/* Search and Filters */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search action or desc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-neutral-200 rounded-medium px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 w-48"
          />
          
          <select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setPage(1);
            }}
            className="border border-neutral-200 rounded-medium px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
          >
            <option value="All">All Modules</option>
            <option value="AUTH">AUTH</option>
            <option value="VOUCHER">VOUCHER</option>
            <option value="ROUTER">ROUTER</option>
            <option value="SETTINGS">SETTINGS</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>

          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-4 rounded-medium text-sm transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/25 text-danger px-4 py-3 rounded-medium text-xs font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 space-y-3 border border-neutral-100 rounded-medium bg-neutral-50/50">
          <History className="mx-auto text-neutral-400" size={36} />
          <p className="text-neutral-500 font-medium">No activity log entries found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-neutral-100 rounded-medium">
            <table className="min-w-full divide-y divide-neutral-100 text-left text-sm text-neutral-700">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Performed By</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const hasDetails = log.description && log.description !== log.action;

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4 text-neutral-500 text-xs">
                          {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`border text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${getModuleBadgeColor(log.module)}`}>
                            {log.module}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-neutral-900 font-bold">{log.action}</span>
                            {hasDetails && !isExpanded && (
                              <span className="text-xs text-neutral-400 font-normal line-clamp-1 max-w-xs md:max-w-md">
                                {log.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-700 text-xs">
                          {log.admin ? (
                            <div>
                              <p className="font-bold">{log.admin.fullName}</p>
                              <span className="text-neutral-400 font-normal">{log.admin.email}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">SYSTEM (Customer / Portal)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-neutral-500 font-mono text-xs">{log.ipAddress || '-'}</td>
                        <td className="px-6 py-4 text-right">
                          {hasDetails ? (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="text-brand-600 hover:text-brand-800 text-xs font-bold underline focus:outline-none"
                            >
                              {isExpanded ? 'Hide' : 'View Info'}
                            </button>
                          ) : (
                            <span className="text-neutral-300 text-xs font-bold">-</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && hasDetails && (
                        <tr className="bg-neutral-50/80">
                          <td colSpan={6} className="px-6 py-4 text-xs font-mono text-neutral-600 border-t border-b border-neutral-100 whitespace-pre-wrap max-w-0 break-words leading-relaxed">
                            <div className="bg-white p-3 border border-neutral-100 rounded-medium shadow-inner">
                              <p className="font-semibold text-neutral-500 mb-1 font-sans">LOG ENTRY DETAILS:</p>
                              {log.description}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center text-sm font-medium text-neutral-500 pt-2">
            <span>
              Showing Page {page} of {totalPages} ({totalLogs} total logs)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || loading}
                className="border border-neutral-200 rounded-medium px-3.5 py-1.5 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || loading}
                className="border border-neutral-200 rounded-medium px-3.5 py-1.5 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsPage = () => {
  const [companyName, setCompanyName] = useState('DeRoyal Hotspot');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [voucherLength, setVoucherLength] = useState(10);

  const [routerHost, setRouterHost] = useState('');
  const [routerPort, setRouterPort] = useState(8728);
  const [routerUsername, setRouterUsername] = useState('');
  const [routerPassword, setRouterPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await api.get('/settings');
        if (response.data && response.data.success) {
          const s = response.data.data;
          setCompanyName(s.company_name);
          setSupportPhone(s.support_phone);
          setSupportEmail(s.support_email);
          setVoucherLength(s.voucher_length);
          setRouterHost(s.router_host);
          setRouterPort(s.router_port);
          setRouterUsername(s.router_username);
        } else {
          setError('Failed to fetch settings from server.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Error occurred while loading settings.');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setSuccess('');
    setError('');
    try {
      const response = await api.post('/router/test', {
        host: routerHost,
        port: Number(routerPort),
        username: routerUsername,
        password: routerPassword
      });
      if (response.data && response.data.success) {
        setTestResult({ success: true, message: 'Router connection successful!' });
      } else {
        setTestResult({ success: false, message: response.data.message || 'Connection test failed.' });
      }
    } catch (err: any) {
      console.error(err);
      setTestResult({ success: false, message: err.response?.data?.message || 'Connection test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    setTestResult(null);

    const payload: any = {
      company_name: companyName,
      support_phone: supportPhone,
      support_email: supportEmail,
      voucher_length: Number(voucherLength),
      router_host: routerHost,
      router_port: Number(routerPort),
      router_username: routerUsername,
    };

    if (routerPassword.trim() !== '') {
      payload.router_password = routerPassword;
    }

    try {
      const response = await api.put('/settings', payload);
      if (response.data && response.data.success) {
        setSuccess('System configurations and RouterOS credentials updated successfully!');
        setRouterPassword(''); // Clear password field after save
        
        // Update local state values
        const s = response.data.data;
        setCompanyName(s.company_name);
        setSupportPhone(s.support_phone);
        setSupportEmail(s.support_email);
        setVoucherLength(s.voucher_length);
        setRouterHost(s.router_host);
        setRouterPort(s.router_port);
        setRouterUsername(s.router_username);
      } else {
        setError(response.data.message || 'Failed to save settings.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while saving configurations.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-card shadow-small py-16 flex justify-center items-center">
        <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="bg-white p-6 rounded-card shadow-small space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 font-sans">System & Router Settings</h2>
        <p className="text-sm text-neutral-500">Configure portal identifiers and MikroTik RouterOS connection details.</p>
      </div>

      {success && (
        <div className="bg-success/10 border border-success/25 text-success px-4 py-3 rounded-medium text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-danger/10 border border-danger/25 text-danger px-4 py-3 rounded-medium text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Portal Configuration */}
        <div className="space-y-4 border border-neutral-100 p-6 rounded-card shadow-inner bg-neutral-50/20">
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2 font-sans">
            <Settings className="text-brand-600" /> Portal Configurations
          </h3>
          
          <div className="space-y-3 font-medium">
            <div>
              <label htmlFor="companyName" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Company Name</label>
              <input
                id="companyName"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-neutral-200 rounded-medium py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent mt-1 bg-white"
              />
            </div>
            <div>
              <label htmlFor="supportPhone" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Support Phone</label>
              <input
                id="supportPhone"
                type="text"
                required
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full border border-neutral-200 rounded-medium py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent mt-1 bg-white"
              />
            </div>
            <div>
              <label htmlFor="supportEmail" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Support Email</label>
              <input
                id="supportEmail"
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full border border-neutral-200 rounded-medium py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent mt-1 bg-white"
              />
            </div>
            <div>
              <label htmlFor="voucherLength" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Voucher Character Length</label>
              <input
                id="voucherLength"
                type="number"
                required
                min={4}
                max={20}
                value={voucherLength}
                onChange={(e) => setVoucherLength(Number(e.target.value))}
                className="w-full border border-neutral-200 rounded-medium py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent mt-1 bg-white"
              />
            </div>
          </div>
        </div>

        {/* RouterOS Configuration */}
        <div className="space-y-4 border border-neutral-100 p-6 rounded-card shadow-inner bg-neutral-50/20">
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2 font-sans">
            <Network className="text-brand-600" /> MikroTik API Configuration
          </h3>
          
          <div className="space-y-3 font-medium">
            <div>
              <label htmlFor="routerHost" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Router Host (IP / Domain)</label>
              <input
                id="routerHost"
                type="text"
                required
                value={routerHost}
                onChange={(e) => setRouterHost(e.target.value)}
                className="w-full border border-neutral-200 rounded-medium py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent mt-1 bg-white"
              />
            </div>
            <div>
              <label htmlFor="routerPort" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">API Port</label>
              <input
                id="routerPort"
                type="number"
                required
                value={routerPort}
                onChange={(e) => setRouterPort(Number(e.target.value))}
                className="w-full border border-neutral-200 rounded-medium py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent mt-1 bg-white"
              />
            </div>
            <div>
              <label htmlFor="routerUsername" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">API Username</label>
              <input
                id="routerUsername"
                type="text"
                required
                value={routerUsername}
                onChange={(e) => setRouterUsername(e.target.value)}
                className="w-full border border-neutral-200 rounded-medium py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent mt-1 bg-white"
              />
            </div>
            <div>
              <label htmlFor="routerPassword" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">API Password (Optional)</label>
              <input
                id="routerPassword"
                type="password"
                placeholder="Leave blank to keep current"
                value={routerPassword}
                onChange={(e) => setRouterPassword(e.target.value)}
                className="w-full border border-neutral-200 rounded-medium py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent mt-1 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3 pt-2">
        {testResult && (
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-medium ${testResult.success ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
            {testResult.message}
          </span>
        )}
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testing || saving}
          className="bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-neutral-800 font-semibold py-2.5 px-6 rounded-medium text-sm transition-colors duration-150 flex items-center gap-2"
        >
          {testing ? 'Testing...' : 'Test Router Connection'}
        </button>
        <button
          type="submit"
          disabled={saving || testing}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-medium text-sm transition-colors duration-150 flex items-center gap-2"
        >
          {saving ? 'Saving...' : 'Save Configurations'}
        </button>
      </div>
    </form>
  );
};

// --- Admin Layout Wrapper ---
const AdminLayout = ({ children, onLogout, admin }: { children: React.ReactNode; onLogout: () => void; admin: AdminUser | null }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Internet Plans', path: '/admin/plans', icon: FileSpreadsheet },
    { label: 'Bandwidth Profiles', path: '/admin/profiles', icon: Network },
    { label: 'Vouchers', path: '/admin/vouchers', icon: History },
    { label: 'Active Sessions', path: '/admin/sessions', icon: Users },
    { label: 'Activity Logs', path: '/admin/logs', icon: Terminal },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-neutral-900 text-white flex-shrink-0">
        <div className="h-72px flex items-center px-6 border-b border-neutral-800 gap-3">
          <Wifi className="text-brand-600 animate-pulse" size={28} />
          <span className="font-extrabold text-lg tracking-tight">DeRoyal Hotspot</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-medium text-sm font-semibold transition-all duration-150 ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-medium' 
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={onLogout}
            className="flex items-center w-full gap-3 px-4 py-3 rounded-medium text-sm font-semibold text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile/Tablet Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/50">
          <div className="w-[260px] bg-neutral-900 text-white flex flex-col">
            <div className="h-72px flex items-center justify-between px-6 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Wifi className="text-brand-600" size={24} />
                <span className="font-bold">DeRoyal Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-medium text-sm font-semibold transition-all duration-150 ${
                      isActive 
                        ? 'bg-brand-600 text-white shadow-medium' 
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-neutral-800">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  onLogout();
                }}
                className="flex items-center w-full gap-3 px-4 py-3 rounded-medium text-sm font-semibold text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-72px bg-white border-b border-neutral-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-neutral-600 hover:text-neutral-900"
            >
              <Menu size={24} />
            </button>
            <h2 className="hidden sm:block text-lg font-bold text-neutral-800">
              Administrator Console
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="/" 
              target="_blank" 
              className="text-neutral-500 hover:text-brand-600 text-sm font-semibold flex items-center gap-1 transition-colors"
            >
              <span>View Portal</span>
              <ExternalLink size={14} />
            </a>
            <div className="h-8 w-px bg-neutral-200"></div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-small uppercase">
                {admin?.fullName.substring(0, 2) || 'AD'}
              </div>
              <span className="hidden md:block text-sm font-bold text-neutral-800">{admin?.fullName || 'Administrator'}</span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-neutral-50">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// --- App Component ---
function App() {
  const navigate = useNavigate();

  // Authentication State
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Form submission and error states (Login)
  const [loginEmail, setLoginEmail] = useState('admin@deroyalhotspot.name.ng');
  const [loginPassword, setLoginPassword] = useState('DeRoyalAdmin2026!');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [voucherCode, setVoucherCode] = useState('');
  const [activationStatus, setActivationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [activatedVoucher, setActivatedVoucher] = useState<any>(null);
  const [autoAuthenticating, setAutoAuthenticating] = useState(false);

  // Read MikroTik redirect query parameters from Starlink/hAP ax3 gateway
  const queryParams = new URLSearchParams(window.location.search);
  const isRedirection = queryParams.has('mac') || queryParams.has('nux-mac') || queryParams.has('link-login') || queryParams.has('link_login');
  
  const linkLogin = queryParams.get('link-login') || queryParams.get('link_login') || queryParams.get('link-login-only') || 'http://hotspot.lan/login';
  const linkOrig = queryParams.get('link-orig') || queryParams.get('link_orig') || 'https://google.com';

  // Automatic Device Reauthentication check on mount
  useEffect(() => {
    const mac = queryParams.get('mac') || queryParams.get('nux-mac');
    const ip = queryParams.get('ip') || queryParams.get('nux-ip');
    
    // Only check if we are on the customer portal (root path) and have a client MAC address
    if (window.location.pathname === '/' && mac) {
      async function autoReauthenticate() {
        try {
          // 1. Call GET /api/v1/device/check
          const checkRes = await api.get(`/device/check?mac=${mac}`);
          if (checkRes.data && checkRes.data.success && checkRes.data.data.registered && checkRes.data.data.voucherActive) {
            console.log('[Auto-Auth] Device is registered and voucher is active. Triggering reauthentication...');
            setAutoAuthenticating(true);
            setActivationStatus('loading');
            
            // 2. Call POST /api/v1/device/reauthenticate
            const reauthRes = await api.post('/device/reauthenticate', { mac, ip: ip || '' });
            if (reauthRes.data && reauthRes.data.success) {
              console.log('[Auto-Auth] Reauthenticated successfully!');
              
              // We simulate the success state so the user lands on the success view
              setActivatedVoucher({
                code: checkRes.data.data.code || 'Auto-Login',
                expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
                plan: {
                  name: 'Automatic Reconnection',
                  price: 0,
                  duration: 1,
                  durationUnit: 'Hours',
                  bandwidthProfile: 'Auto Profile'
                }
              });
              setActivationStatus('success');
            } else {
              console.warn('[Auto-Auth] Reauthentication failed:', reauthRes.data.message);
              setActivationStatus('idle');
            }
          }
        } catch (err) {
          console.warn('[Auto-Auth] Automatic device reauthentication failed:', err);
          setActivationStatus('idle');
        } finally {
          setAutoAuthenticating(false);
        }
      }
      autoReauthenticate();
    }
  }, []);

  // Auto-submit hotspot login form on activation success
  useEffect(() => {
    if (activationStatus === 'success' && isRedirection) {
      const timer = setTimeout(() => {
        const form = document.getElementById('hotspot-login-form') as HTMLFormElement;
        if (form) {
          form.submit();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activationStatus, isRedirection]);

  // 1. Check if user has an active, valid session on load
  useEffect(() => {
    async function verifySession() {
      const token = localStorage.getItem('dhos_token');
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          if (response.data && response.data.success) {
            setAdmin(response.data.data);
          } else {
            handleLocalClear();
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
          handleLocalClear();
        }
      }
      setAuthLoading(false);
    }
    verifySession();
  }, []);

  const handleLocalClear = () => {
    localStorage.removeItem('dhos_token');
    setAdmin(null);
  };

  // 2. Perform backend login request
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);

    try {
      const response = await api.post('/auth/login', {
        email: loginEmail,
        password: loginPassword
      });

      if (response.data && response.data.success) {
        const { token, admin: adminProfile } = response.data.data;
        localStorage.setItem('dhos_token', token);
        setAdmin(adminProfile);
        navigate('/admin');
      } else {
        setLoginError(response.data.message || 'Login failed.');
      }
    } catch (err: any) {
      console.error('Login error details:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setLoginError(err.response.data.message);
      } else {
        setLoginError('Could not connect to the authentication server. Ensure the backend is running.');
      }
    } finally {
      setLoginSubmitting(false);
    }
  };

  // 3. Perform backend logout request
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Failed to logout gracefully from backend:', err);
    } finally {
      handleLocalClear();
      navigate('/admin/login');
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = voucherCode.trim().toUpperCase();
    if (!code) return;

    setActivationStatus('loading');
    setErrorMessage('');
    setActivatedVoucher(null);

    try {
      const response = await api.post('/activate', { 
        voucher: code,
        ip: queryParams.get('ip') || queryParams.get('nux-ip') || '',
        mac: queryParams.get('mac') || queryParams.get('nux-mac') || ''
      });
      if (response.data && response.data.success) {
        setActivatedVoucher(response.data.data);
        setActivationStatus('success');
      } else {
        setActivationStatus('error');
        setErrorMessage(response.data.message || 'Activation failed.');
      }
    } catch (err: any) {
      console.error(err);
      setActivationStatus('error');
      setErrorMessage(err.response?.data?.message || 'Invalid voucher code or connection error.');
    }
  };

  return (
    <Routes>
      {/* Customer Captive Portal Route */}
      <Route path="/" element={
        <div className="min-h-screen bg-gradient-to-tr from-brand-800 via-brand-700 to-brand-900 flex flex-col justify-between py-12 px-4 relative overflow-hidden font-sans">
          
          <div className="absolute w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -top-64 -left-32 pointer-events-none"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full bg-brand-600/20 blur-3xl -bottom-32 -right-16 pointer-events-none"></div>

          <div className="text-center relative z-10">
            <div className="inline-flex p-3.5 bg-white/10 backdrop-blur-md rounded-xlarge border border-white/20 shadow-large text-white mb-4 animate-bounce">
              <Wifi size={36} />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">DeRoyal Hotspot</h1>
            <p className="text-brand-100 mt-2 font-medium">Fast, secure internet access. Enter your voucher to connect.</p>
          </div>

          <div className="max-w-md w-full mx-auto bg-white/95 backdrop-blur-md p-8 rounded-card shadow-xlarge border border-white/50 relative z-10 my-8">
            {autoAuthenticating ? (
              <div className="text-center space-y-6 py-6 animate-scale-in">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto border border-brand-300">
                  <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Welcome Back!</h3>
                  <p className="text-neutral-500 font-medium mt-1 text-sm">
                    Reconnecting your device to the internet...
                  </p>
                </div>
              </div>
            ) : activationStatus === 'idle' || activationStatus === 'loading' ? (
              <form onSubmit={handleActivate} className="space-y-6">
                <div>
                  <label htmlFor="voucher" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Voucher Code
                  </label>
                  <input
                    id="voucher"
                    type="text"
                    required
                    placeholder="e.g. SLV19AKLD2"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    disabled={activationStatus === 'loading'}
                    className="w-full text-center font-mono text-xl font-bold tracking-widest border border-neutral-200 rounded-medium py-3.5 px-4 mt-2 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={activationStatus === 'loading'}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-700 text-white font-bold py-4 px-4 rounded-button shadow-medium hover:shadow-large transition-all duration-150 flex items-center justify-center gap-2"
                >
                  {activationStatus === 'loading' ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Activating Access...</span>
                    </>
                  ) : (
                    <span>Activate Internet</span>
                  )}
                </button>
              </form>
            ) : activationStatus === 'success' ? (
              <div className="text-center space-y-6 animate-scale-in">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto border border-success/30">
                  <CheckCircle className="text-success" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Activation Successful!</h3>
                  <p className="text-neutral-500 mt-1">You are now successfully connected to the internet.</p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-medium space-y-2 border border-neutral-100 text-left font-medium text-sm text-neutral-600">
                  <div className="flex justify-between">
                    <span>Voucher:</span>
                    <span className="font-mono font-bold text-neutral-800">{activatedVoucher?.code || voucherCode.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-bold text-neutral-800">{activatedVoucher?.plan?.name || 'Hotspot Access'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400 font-normal">
                    <span>Speed Profile:</span>
                    <span className="font-semibold">{activatedVoucher?.plan?.bandwidthProfile || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires At:</span>
                    <span className="text-brand-700 font-bold">
                      {activatedVoucher?.expiresAt 
                        ? new Date(activatedVoucher.expiresAt).toLocaleString() 
                        : '-'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {isRedirection && (
                    <form id="hotspot-login-form" action={linkLogin} method="POST" className="hidden">
                      <input type="hidden" name="username" value={voucherCode.trim().toUpperCase()} />
                      <input type="hidden" name="password" value={voucherCode.trim().toUpperCase()} />
                      <input type="hidden" name="dst" value={linkOrig} />
                    </form>
                  )}
                  <a
                    href={isRedirection ? "#" : "https://google.com"}
                    onClick={(e) => {
                      if (isRedirection) {
                        e.preventDefault();
                        const form = document.getElementById('hotspot-login-form') as HTMLFormElement;
                        if (form) form.submit();
                      }
                    }}
                    className="w-full inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-4 rounded-button shadow-medium transition-all text-sm"
                  >
                    {isRedirection ? "Connecting you..." : "Start Browsing"}
                  </a>
                  <button
                    onClick={() => {
                      setActivationStatus('idle');
                      setVoucherCode('');
                    }}
                    className="text-neutral-500 hover:text-neutral-800 text-sm font-semibold transition-colors"
                  >
                    Activate Another Voucher
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 animate-scale-in">
                <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto border border-danger/30">
                  <AlertCircle className="text-danger" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Activation Failed</h3>
                  <p className="text-danger font-medium mt-1 text-sm">{errorMessage}</p>
                </div>

                <div className="bg-neutral-50 p-4 rounded-medium space-y-1.5 border border-neutral-100 text-left text-xs text-neutral-500">
                  <p className="font-semibold text-neutral-700 mb-1">Common Solutions:</p>
                  <p>• Make sure the code is typed exactly as shown on your voucher.</p>
                  <p>• Check that you are connected to the DeRoyal Hotspot WiFi signal.</p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActivationStatus('idle')}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-4 rounded-button shadow-medium transition-all text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-center relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-brand-100 text-sm font-semibold">
              <div className="flex items-center gap-1.5">
                <Phone size={16} />
                <span>+234 701 774 1881</span>
              </div>
              <div className="hidden sm:block h-3 w-px bg-white/20"></div>
              <div className="flex items-center gap-1.5">
                <Mail size={16} />
                <span>support@deroyalhotspot.name.ng</span>
              </div>
            </div>
            <p className="text-white/40 text-xs font-medium">
              &copy; {new Date().getFullYear()} DeRoyal Hotspot OS. All Rights Reserved.
            </p>
          </div>
        </div>
      } />

      {/* Admin Login Route */}
      <Route path="/admin/login" element={
        <div className="min-h-screen bg-neutral-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
          <div className="max-w-md w-full mx-auto space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-medium animate-pulse">
                <Wifi size={24} />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-neutral-900 font-sans tracking-tight">
                Administrator Log in
              </h2>
              <p className="mt-2 text-sm text-neutral-500 font-medium">
                DeRoyal Hotspot Management OS
              </p>
            </div>

            <div className="bg-white py-8 px-8 shadow-large rounded-card border border-neutral-200/50">
              <form className="space-y-6" onSubmit={handleLoginSubmit}>
                {loginError && (
                  <div className="bg-danger/10 border border-danger/25 text-danger px-4 py-3 rounded-medium text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loginSubmitting}
                    className="w-full border border-neutral-200 rounded-medium py-2.5 px-3 mt-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loginSubmitting}
                    className="w-full border border-neutral-200 rounded-medium py-2.5 px-3 mt-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loginSubmitting}
                    className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-700 text-white font-bold py-3 px-4 rounded-button shadow-medium transition-all text-sm flex justify-center items-center gap-2"
                  >
                    {loginSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
            <p className="text-center text-xs text-neutral-400 font-medium">
              Authorized personnel only. Logs are maintained for all access attempts.
            </p>
          </div>
        </div>
      } />

      {/* Protected Admin Layout Routes */}
      <Route path="/admin" element={
        <ProtectedRoute admin={admin} loading={authLoading}>
          <AdminLayout onLogout={handleLogout} admin={admin}><AdminDashboard /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/plans" element={
        <ProtectedRoute admin={admin} loading={authLoading}>
          <AdminLayout onLogout={handleLogout} admin={admin}><PlansPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/profiles" element={
        <ProtectedRoute admin={admin} loading={authLoading}>
          <AdminLayout onLogout={handleLogout} admin={admin}><ProfilesPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/vouchers" element={
        <ProtectedRoute admin={admin} loading={authLoading}>
          <AdminLayout onLogout={handleLogout} admin={admin}><VouchersPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/sessions" element={
        <ProtectedRoute admin={admin} loading={authLoading}>
          <AdminLayout onLogout={handleLogout} admin={admin}><SessionsPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/logs" element={
        <ProtectedRoute admin={admin} loading={authLoading}>
          <AdminLayout onLogout={handleLogout} admin={admin}><LogsPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute admin={admin} loading={authLoading}>
          <AdminLayout onLogout={handleLogout} admin={admin}><SettingsPage /></AdminLayout>
        </ProtectedRoute>
      } />
      
      {/* 404 Fallback */}
      <Route path="*" element={
        <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-6 text-center font-sans">
          <AlertCircle className="text-danger mb-4" size={48} />
          <h2 className="text-2xl font-bold text-neutral-900 font-sans">Page Not Found</h2>
          <p className="text-neutral-500 mt-2 max-w-sm">The URL you requested does not exist in DeRoyal Hotspot OS.</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-6 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-medium text-sm transition-all shadow-medium"
          >
            Go to Captive Portal
          </button>
        </div>
      } />
    </Routes>
  );
}

export default App;
