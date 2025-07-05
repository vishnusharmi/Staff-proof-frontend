import React, { useState, useEffect, useContext } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  FileText,
  Eye,
  MessageSquare,
} from "lucide-react";
import { fetchDashboard, fetchVerifications } from '../../../components/api/api';
import { UserContext } from '../../../components/context/UseContext';

const VerifierDashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [assignedCases, setAssignedCases] = useState([]);

  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch dashboard data for verifier role
        const dashboardResponse = await fetchDashboard('verifier');
        setDashboardData(dashboardResponse);
        
        // Fetch assigned verification cases
        const verificationsResponse = await fetchVerifications({ 
          assignedTo: user?.id,
          status: 'assigned,in_progress'
        });
        setAssignedCases(verificationsResponse.data || []);
        
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
  const dashboardStats = dashboardData?.stats || {
    totalAssigned: 156,
    casesVerified: 98,
    casesFlagged: 24,
    casesRejected: 12,
    avgVerificationTime: 2.5, // hours
  };

  const caseStatusData = dashboardData?.caseStatusData || [
    { name: "Verified", value: 98, color: "#10B981" },
    { name: "Flagged", value: 24, color: "#F59E0B" },
    { name: "Rejected", value: 12, color: "#EF4444" },
    { name: "In Progress", value: 22, color: "#3B82F6" },
  ];

  const documentTypeData = dashboardData?.documentTypeData || [
    { name: "Resume", verified: 45, flagged: 8, rejected: 3 },
    { name: "Government ID", verified: 52, flagged: 4, rejected: 2 },
    { name: "Payslips", verified: 38, flagged: 12, rejected: 6 },
    { name: "Experience Letters", verified: 41, flagged: 15, rejected: 4 },
    { name: "Educational Certificates", verified: 43, flagged: 9, rejected: 2 },
  ];

  const tagsData = dashboardData?.tagsData || [
    { name: "MNC Experience", value: 35, color: "#8B5CF6" },
    { name: "Fresher", value: 28, color: "#06B6D4" },
    { name: "Salary Mismatch", value: 18, color: "#F97316" },
    { name: "Incomplete Docs", value: 15, color: "#84CC16" },
    { name: "Suspected Forgery", value: 8, color: "#EF4444" },
  ];

  const verificationTimeData = dashboardData?.verificationTimeData || [
    { day: "Mon", avgTime: 2.2, cases: 18 },
    { day: "Tue", avgTime: 2.8, cases: 22 },
    { day: "Wed", avgTime: 2.1, cases: 25 },
    { day: "Thu", avgTime: 2.9, cases: 20 },
    { day: "Fri", avgTime: 2.3, cases: 24 },
    { day: "Sat", avgTime: 1.8, cases: 15 },
    { day: "Sun", avgTime: 1.5, cases: 12 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "flagged":
        return "text-yellow-600 bg-yellow-100";
      case "new":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} className="mx-auto" />
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                StaffProof Verifier Panel
              </h1>
              <p className="text-gray-600">Welcome, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Verifier'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Session expires in: 12:34
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                V
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Assigned Cases
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardStats.totalAssigned}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Cases Verified
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardStats.casesVerified}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Cases Flagged
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardStats.casesFlagged}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Avg Verification Time
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardStats.avgVerificationTime}h
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          {/* Case Status Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Case Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={caseStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {caseStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Document Type Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Document Verification Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={documentTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="verified" fill="#10B981" name="Verified" />
                <Bar dataKey="flagged" fill="#F59E0B" name="Flagged" />
                <Bar dataKey="rejected" fill="#EF4444" name="Rejected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}

        {/* Search and Filter Section */}
        {/* <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by StaffProof ID or Employee Name"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {["All", "New", "In Progress", "Completed", "Flagged"].map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      selectedFilter === filter
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    StaffProof ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignedCases.map((case_item) => (
                  <tr key={case_item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {case_item.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {case_item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          case_item.status
                        )}`}
                      >
                        {case_item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                          case_item.priority
                        )}`}
                      >
                        {case_item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-1" />
                        {case_item.documents}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        Open Case
                      </button>
                      <button className="text-green-600 hover:text-green-900 inline-flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Notes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}

        {/* Activity Summary */}
        {/* <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Verified documents for Rahul Sharma (SP001)
                </p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Flagged salary mismatch for Priya Patel (SP002)
                </p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Sent clarification request to Amit Kumar (SP003)
                </p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default VerifierDashboard;
