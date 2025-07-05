import React, { useState } from 'react';
import { 
  User, 
  FileText, 
  Briefcase, 
  Shield, 
  Copy, 
  Bell,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Eye
} from 'lucide-react';
import { fetchDashboard, fetchProfile } from '../../../components/api/api';
import { UserContext } from '../../../components/context/UseContext';

const EmpDashboard = () => {
  const [copiedId, setCopiedId] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const itemsPerPage = 5;
  
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch dashboard data for employee role
        const dashboardResponse = await fetchDashboard('employee');
        setDashboardData(dashboardResponse);
        
        // Fetch user profile data
        const profileResponse = await fetchProfile();
        setProfileData(profileResponse);
        
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
  const employeeData = {
    fullName: profileData?.firstName && profileData?.lastName ? `${profileData.firstName} ${profileData.lastName}` : user?.fullName || "Loading...",
    staffProofId: profileData?.staffProofId || user?.staffProofId || "SP-2024001",
    isVerified: profileData?.isVerified === true,
    stats: dashboardData?.stats || {
      documentsUploaded: 0,
      jobRecords: 0,
      pendingVerifications: 0,
      accessRequests: 0,
      profileViews: 0,
      verificationScore: 0
    },
    recentActivities: dashboardData?.recentActivities || []
  };

  const copyStaffProofId = () => {
    navigator.clipboard.writeText(employeeData.staffProofId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getStatusConfig = (isVerified) => {
    if (isVerified) {
      return {
        text: 'Verified',
        bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        icon: CheckCircle,
        badge: '🟢'
      };
    } else {
      return {
        text: 'Pending',
        bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
        icon: Clock,
        badge: '🟡'
      };
    }
  };

  const statusConfig = getStatusConfig(employeeData.isVerified);
  const StatusIcon = statusConfig.icon;

  const getActivityIcon = (type) => {
    switch (type) {
      case 'job': return Briefcase;
      case 'request': return Download;
      case 'verification': return CheckCircle;
      case 'upload': return Upload;
      case 'profile': return User;
      case 'view': return Eye;
      default: return Bell;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'job': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'request': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'verification': return 'text-green-600 bg-green-50 border-green-200';
      case 'upload': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'profile': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'view': return 'text-teal-600 bg-teal-50 border-teal-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(employeeData.recentActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = employeeData.recentActivities.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm rounded-md transition-colors ${
            currentPage === i
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(endIndex, employeeData.recentActivities.length)} of{' '}
          {employeeData.recentActivities.length} activities
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <XCircle size={48} className="mx-auto" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
                Welcome back, {employeeData.fullName}
              </h1>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600">Your StaffProof ID:</span>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                  <span className="font-mono text-sm font-bold text-gray-800">
                    {employeeData.staffProofId}
                  </span>
                  <button
                    onClick={copyStaffProofId}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-white rounded-md"
                    title="Copy ID"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                {copiedId && (
                  <span className="text-xs text-green-600 font-semibold animate-pulse">Copied!</span>
                )}
              </div>
            </div>
            
            {/* Verification Status */}
            <div className={`inline-flex items-center px-6 py-3 rounded-2xl border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} shadow-lg`}>
              <StatusIcon size={22} className="mr-3" />
              <span className="font-bold text-lg">Status: {statusConfig.text}</span>
              <span className="ml-3 text-xl">{statusConfig.badge}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
      
          {/* Job Records Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {employeeData.stats.jobRecords}
                </p>
                <div className="flex items-center text-green-600 text-xs font-medium mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +1 this month
                </div>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600">Job Records</p>
            <p className="text-xs text-gray-500">Work history</p>
          </div>

          {/* Pending Verifications Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {employeeData.stats.pendingVerifications}
                </p>
                <p className="text-xs text-yellow-600 font-medium mt-1">In review</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600">Pending</p>
            <p className="text-xs text-gray-500">Verifications</p>
          </div>

          {/* Access Requests Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {employeeData.stats.accessRequests}
                </p>
                <div className="flex items-center text-green-600 text-xs font-medium mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +3 today
                </div>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600">Access Requests</p>
            <p className="text-xs text-gray-500">From employers</p>
          </div>

        </div>

        {/* Recent Activity Section with Pagination */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Activity</h2>
                <p className="text-sm text-gray-600">Stay updated with your latest actions and notifications</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="p-8">
            {currentActivities.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No recent activity</p>
                <p className="text-gray-400 text-sm">Your activities will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentActivities.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  const iconColorClass = getActivityColor(activity.type);
                  
                  return (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={`p-3 rounded-xl border ${iconColorClass} shadow-sm`}>
                        <ActivityIcon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-semibold leading-relaxed">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {employeeData.recentActivities.length > itemsPerPage && renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpDashboard;