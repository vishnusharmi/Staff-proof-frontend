import React, { useState, useEffect, useContext } from 'react';
import { 
  Users, 
  Shield, 
  UserX, 
  Send, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDashboard, fetchCompany } from '../../../components/api/api';
import { UserContext } from '../../../components/context/UseContext';

const EmprDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const itemsPerPage = 5;

  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch dashboard data for employer role
        const dashboardResponse = await fetchDashboard('employer');
        setDashboardData(dashboardResponse);
        
        // Fetch company data if user has company
        if (user?.company) {
          const companyResponse = await fetchCompany(user.company);
          setCompanyData(companyResponse);
        }
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Use real data or fallback to mock data structure
  const recentActivities = dashboardData?.recentActivities || [
    {
      id: 1,
      type: 'access_request',
      message: 'Sent Access Request to John Doe (SP-123456)',
      timestamp: '2025-07-01 14:30:00',
      status: 'pending'
    },
    {
      id: 2,
      type: 'blacklist',
      message: 'Blacklisted Jane Smith (SP-789012)',
      timestamp: '2025-07-01 13:15:00',
      status: 'approved'
    }
  ];

  const stats = dashboardData?.stats || {
    employeesVerified: 324,
    accessRequests: 89,
    blacklistedEmployees: 12,
    pendingVerifications: 5
  };

  const subscription = dashboardData?.subscription || {
    plan: 'Pro Plan',
    lookupsUsed: 147,
    totalLookups: 250,
    expiresAt: '2026-03-15'
  };

  const totalPages = Math.ceil(recentActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentActivities = recentActivities.slice(startIndex, startIndex + itemsPerPage);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'access_request':
        return <Send className="w-5 h-5 text-blue-600" />;
      case 'blacklist':
        return <UserX className="w-5 h-5 text-red-600" />;
      case 'access_granted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'verification':
        return <Shield className="w-5 h-5 text-purple-600" />;
      case 'access_denied':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'search':
        return <Users className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md',
      approved: 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-md',
      denied: 'bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-md',
      completed: 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-md'
    };

    return (
      <span className={`px-4 py-2 text-sm font-bold rounded-full ${statusStyles[status] || 'bg-gradient-to-r from-gray-400 to-slate-400 text-white shadow-md'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {companyData?.name || user?.companyName || 'Company'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your employee verification dashboard
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">
                Verified Company
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Subscription Info Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">{subscription.plan} Active</h3>
              <p className="text-blue-100">Employee Lookups Used: {subscription.lookupsUsed}/{subscription.totalLookups}</p>
              <p className="text-blue-100">Expires: {new Date(subscription.expiresAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <CreditCard className="w-8 h-8 mb-2 opacity-80" />
              <Link to="/employer/plans">
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Upgrade Plan
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  +12% ↗
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Employees Verified
              </p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.employeesVerified}</p>
              <p className="text-sm text-gray-500">Total verified employees</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                <Send className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  +5 this week
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Access Requests
              </p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.accessRequests}</p>
              <p className="text-sm text-gray-500">Total requests sent</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
                <UserX className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  No change
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Blacklisted
              </p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.blacklistedEmployees}</p>
              <p className="text-sm text-gray-500">Total blacklisted</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  +8% ↗
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Verifications
              </p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.pendingVerifications}</p>
              <p className="text-sm text-gray-500">Document verifications</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmprDashboard;