import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  Search,
  Filter,
  Download,
  User,
  Shield,
  FileText,
  UserCheck,
  Settings,
  Calendar,
} from "lucide-react";
import {
  Fade,
  Grow,
  Slide,
  Zoom,
  Skeleton,
  CircularProgress,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { fetchAuditLogs } from '../../../components/api/api';
import { UserContext } from '../../../components/context/UseContext';

// Create teal color theme
const tealTheme = createTheme({
  palette: {
    primary: {
      main: "#008080",
      contrastText: "#fff",
    },
    secondary: {
      main: "#4db6ac",
    },
  },
  transitions: {
    duration: {
      enteringScreen: 500,
      leavingScreen: 300,
    },
  },
});

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const itemsPerPage = 10;

  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchAuditLogs({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          action: filterAction,
          status: filterStatus,
          date: filterDate
        });
        
        setLogs(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
        setTotalLogs(response.pagination?.total || 0);
        
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setError(err.response?.data?.message || 'Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLogs();
    }
  }, [user, currentPage, searchTerm, filterAction, filterStatus, filterDate]);

  const exportLogs = () => {
    // In real app, this would trigger CSV/PDF export
    const csvContent = logs.map(log => 
      `${log.timestamp},${log.admin},${log.action},${log.details},${log.target_user},${log.status}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getCategory = (action) => {
    if (action.includes('LOGIN') || action.includes('AUTH')) return 'Authentication';
    if (action.includes('DOCUMENT') || action.includes('VERIFY')) return 'Documentation';
    if (action.includes('USER') || action.includes('PROFILE')) return 'User Management';
    if (action.includes('ACCESS') || action.includes('PERMISSION')) return 'Access Control';
    if (action.includes('BLACKLIST') || action.includes('FLAG')) return 'Security';
    if (action.includes('SETTINGS') || action.includes('CONFIG')) return 'System';
    if (action.includes('EMPLOYER') || action.includes('COMPANY')) return 'Employer';
    return 'Other';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('LOGIN')) return <User className="w-4 h-4" />;
    if (action.includes('DOCUMENT') || action.includes('VERIFY')) return <FileText className="w-4 h-4" />;
    if (action.includes('USER') || action.includes('PROFILE')) return <UserCheck className="w-4 h-4" />;
    if (action.includes('ACCESS') || action.includes('PERMISSION')) return <Shield className="w-4 h-4" />;
    if (action.includes('SETTINGS')) return <Settings className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen p-6 bg-teal-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <CircularProgress sx={{ color: '#008080' }} />
            <span className="ml-3 text-teal-600">Loading audit logs...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={tealTheme}>
      <div className="min-h-screen p-6 bg-teal-50">
        <div className="max-w-7xl mx-auto space-y-6">
          <Fade in={true} timeout={500}>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-teal-800">
                Audit Logs Management
              </h1>
              <button
                onClick={exportLogs}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Logs
              </button>
            </div>
          </Fade>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Filters */}
          <Slide direction="up" in={true} timeout={600}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 text-sm border-2 border-teal-100 rounded-lg focus:border-teal-300 focus:ring-2 focus:ring-teal-50"
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Action Type
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm border-2 border-teal-100 rounded-lg focus:border-teal-300 focus:ring-2 focus:ring-teal-50"
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                  >
                    <option value="">All Actions</option>
                    <option value="LOGIN">Login</option>
                    <option value="VERIFY">Verification</option>
                    <option value="ACCESS">Access Control</option>
                    <option value="USER">User Management</option>
                    <option value="BLACKLIST">Blacklist</option>
                    <option value="SETTINGS">Settings</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm border-2 border-teal-100 rounded-lg focus:border-teal-300 focus:ring-2 focus:ring-teal-50"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Success">Success</option>
                    <option value="Failed">Failed</option>
                    <option value="Warning">Warning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border-2 border-teal-100 rounded-lg focus:border-teal-300 focus:ring-2 focus:ring-teal-50"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Slide>

          {/* Stats */}
          <Grow in={true} timeout={700}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-teal-600">Total Logs</p>
                    <p className="text-2xl font-bold text-teal-800">{totalLogs}</p>
                  </div>
                  <FileText className="w-8 h-8 text-teal-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-teal-600">Success Rate</p>
                    <p className="text-2xl font-bold text-teal-800">
                      {logs.length > 0 ? Math.round((logs.filter(log => log.status === 'Success').length / logs.length) * 100) : 0}%
                    </p>
                  </div>
                  <UserCheck className="w-8 h-8 text-teal-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-teal-600">Failed Actions</p>
                    <p className="text-2xl font-bold text-teal-800">
                      {logs.filter(log => log.status === 'Failed').length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-teal-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-teal-600">Today's Logs</p>
                    <p className="text-2xl font-bold text-teal-800">
                      {logs.filter(log => {
                        const today = new Date().toDateString();
                        return new Date(log.timestamp).toDateString() === today;
                      }).length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-teal-500" />
                </div>
              </div>
            </div>
          </Grow>

          {/* Table */}
          <Zoom in={true} timeout={800}>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-teal-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-teal-200">
                  <thead className="bg-teal-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                        Target
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-teal-100">
                    {logs.map((log, index) => (
                      <tr key={log.id} className="hover:bg-teal-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-teal-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-teal-900">
                                {log.admin_firstName && log.admin_lastName ? `${log.admin_firstName} ${log.admin_lastName}` : log.admin}
                              </div>
                              <div className="text-sm text-teal-500">
                                {log.admin_email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getActionIcon(log.action)}
                            <span className="ml-2 text-sm text-teal-900">
                              {log.action}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-teal-900 max-w-xs truncate">
                          {log.details}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                          {log.target_firstName && log.target_lastName ? `${log.target_firstName} ${log.target_lastName}` : log.target_user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                          {log.ip_address}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-teal-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-teal-300 text-sm font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-teal-300 text-sm font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-teal-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-teal-300 bg-white text-sm font-medium text-teal-500 hover:bg-teal-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-teal-300 bg-white text-sm font-medium text-teal-500 hover:bg-teal-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Zoom>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AuditLogs;
