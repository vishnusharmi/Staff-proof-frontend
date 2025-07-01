import React, { useState } from 'react';
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

const EmprDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Mock data for recent activities
  const recentActivities = [
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
    },
    {
      id: 3,
      type: 'access_granted',
      message: 'Access Request Approved by Mike Johnson (SP-345678)',
      timestamp: '2025-07-01 12:45:00',
      status: 'approved'
    },
    {
      id: 4,
      type: 'verification',
      message: 'Employee Sarah Wilson (SP-901234) verified documents',
      timestamp: '2025-07-01 11:20:00',
      status: 'completed'
    },
    {
      id: 5,
      type: 'access_denied',
      message: 'Access Request Denied by Tom Brown (SP-567890)',
      timestamp: '2025-07-01 10:30:00',
      status: 'denied'
    },
    {
      id: 6,
      type: 'search',
      message: 'Searched employee with ID SP-111222',
      timestamp: '2025-07-01 09:15:00',
      status: 'completed'
    },
    {
      id: 7,
      type: 'access_request',
      message: 'Sent Access Request to Lisa Davis (SP-333444)',
      timestamp: '2025-06-30 16:45:00',
      status: 'pending'
    },
    {
      id: 8,
      type: 'verification',
      message: 'Employee Robert Lee (SP-555666) completed verification',
      timestamp: '2025-06-30 15:30:00',
      status: 'completed'
    }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, TechCorp Solutions
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
              <h3 className="text-lg font-semibold mb-2">Pro Plan Active</h3>
              <p className="text-blue-100">Employee Lookups Used: 147/250</p>
              <p className="text-blue-100">Expires: March 15, 2026</p>
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
              <p className="text-4xl font-bold text-gray-900 mb-2">324</p>
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
              <p className="text-4xl font-bold text-gray-900 mb-2">89</p>
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
              <p className="text-4xl font-bold text-gray-900 mb-2">7</p>
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
              <p className="text-4xl font-bold text-gray-900 mb-2">156</p>
              <p className="text-sm text-gray-500">Document verifications</p>
            </div>
          </div>
        </div>
{/* 
        Enhanced Recent Activity */}
        {/* <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-6">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <p className="text-slate-300 mt-1">
              Track your latest actions and updates
            </p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {currentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`flex items-start space-x-6 p-6 rounded-xl transition-all duration-300 hover:shadow-md ${
                    index % 2 === 0
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50"
                      : "bg-gradient-to-r from-purple-50 to-pink-50"
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="p-3 bg-white rounded-full shadow-md">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-base font-semibold text-gray-900 mb-1">
                      {activity.message}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {activity.timestamp}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(activity.status)}
                  </div>
                </div>
              ))}
            </div>

          
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="text-base text-gray-700 font-medium">
                Showing{" "}
                <span className="font-bold text-blue-600">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-blue-600">
                  {Math.min(startIndex + itemsPerPage, recentActivities.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-blue-600">
                  {recentActivities.length}
                </span>{" "}
                activities
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-3 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      currentPage === i + 1
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-3 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default EmprDashboard;