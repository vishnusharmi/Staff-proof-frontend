import React, { useState, useEffect, useMemo } from "react";
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

// Static data to simulate audit logs
const staticLogs = [
  {
    id: 1,
    timestamp: "2025-05-26T09:00:00Z",
    admin: "John Doe",
    admin_email: "john.doe@example.com",
    admin_id: "admin1",
    action: "VERIFY_DOCUMENT",
    details: "Verified Aadhaar for user Jane Smith",
    target_user: "Jane Smith",
    target_type: "User",
    ip_address: "192.168.1.1",
    device: "Chrome/120.0",
    status: "Success",
  },
  {
    id: 2,
    timestamp: "2025-05-25T14:30:00Z",
    admin: "Alice Johnson",
    admin_email: "alice.johnson@example.com",
    admin_id: "admin2",
    action: "ACCESS_REQUEST_APPROVE",
    details: "Approved access request for Resume",
    target_user: "Bob Brown",
    target_type: "User",
    ip_address: "192.168.1.2",
    device: "Firefox/115.0",
    status: "Success",
  },
  {
    id: 3,
    timestamp: "2025-05-25T11:15:00Z",
    admin: "John Doe",
    admin_email: "john.doe@example.com",
    admin_id: "admin1",
    action: "LOGIN_ATTEMPT",
    details: "Admin login attempt",
    target_user: "John Doe",
    target_type: "Admin",
    ip_address: "192.168.1.3",
    device: "Safari/16.0",
    status: "Failed",
  },
  {
    id: 4,
    timestamp: "2025-05-24T16:45:00Z",
    admin: "Emma Davis",
    admin_email: "emma.davis@example.com",
    admin_id: "admin3",
    action: "BLACKLIST_USER",
    details: "Added user to blacklist",
    target_user: "Mike Wilson",
    target_type: "User",
    ip_address: "192.168.1.4",
    device: "Chrome/120.0",
    status: "Success",
  },
  {
    id: 5,
    timestamp: "2025-05-24T10:20:00Z",
    admin: "Alice Johnson",
    admin_email: "alice.johnson@example.com",
    admin_id: "admin2",
    action: "PROFILE_UPDATE",
    details: "Updated user profile details",
    target_user: "Jane Smith",
    target_type: "User",
    ip_address: "192.168.1.5",
    device: "Edge/118.0",
    status: "Success",
  },
  {
    id: 6,
    timestamp: "2025-05-23T12:00:00Z",
    admin: "Emma Davis",
    admin_email: "emma.davis@example.com",
    admin_id: "admin3",
    action: "SETTINGS_UPDATE",
    details: "Updated system email template",
    target_user: "System",
    target_type: "System",
    ip_address: "192.168.1.6",
    device: "Chrome/120.0",
    status: "Success",
  },
  {
    id: 7,
    timestamp: "2025-05-26T08:00:00Z",
    admin: "John Doe",
    admin_email: "john.doe@example.com",
    admin_id: "admin1",
    action: "APPROVE_EMPLOYER",
    details: "Approved employer registration",
    target_user: "Acme Corp",
    target_type: "Employer",
    ip_address: "192.168.1.7",
    device: "Firefox/115.0",
    status: "Success",
  },
  {
    id: 8,
    timestamp: "2025-05-22T15:30:00Z",
    admin: "Alice Johnson",
    admin_email: "alice.johnson@example.com",
    admin_id: "admin2",
    action: "IMPERSONATE_USER",
    details: "Impersonated user for troubleshooting",
    target_user: "Bob Brown",
    target_type: "User",
    ip_address: "192.168.1.8",
    device: "Chrome/120.0",
    status: "Success",
  },
  {
    id: 9,
    timestamp: "2025-05-21T09:45:00Z",
    admin: "Emma Davis",
    admin_email: "emma.davis@example.com",
    admin_id: "admin3",
    action: "REJECT_DOCUMENT",
    details: "Rejected invalid passport",
    target_user: "Mike Wilson",
    target_type: "User",
    ip_address: "192.168.1.9",
    device: "Safari/16.0",
    status: "Success",
  },
  {
    id: 10,
    timestamp: "2025-05-20T14:00:00Z",
    admin: "John Doe",
    admin_email: "john.doe@example.com",
    admin_id: "admin1",
    action: "ANNOUNCEMENT_CREATE",
    details: "Created new system announcement",
    target_user: "System",
    target_type: "System",
    ip_address: "192.168.1.10",
    device: "Edge/118.0",
    status: "Success",
  },
  {
    id: 11,
    timestamp: "2025-05-26T10:00:00Z",
    admin: "Alice Johnson",
    admin_email: "alice.johnson@example.com",
    admin_id: "admin2",
    action: "LOGIN_ATTEMPT",
    details: "Admin login attempt",
    target_user: "Alice Johnson",
    target_type: "Admin",
    ip_address: "192.168.1.11",
    device: "Chrome/120.0",
    status: "Success",
  },
];

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedAdmin, setSelectedAdmin] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const itemsPerPage = 10;

  const categoryIcons = {
    verification: <UserCheck className="w-4 h-4" />,
    access: <Shield className="w-4 h-4" />,
    security: <Shield className="w-4 h-4" />,
    blacklist: <FileText className="w-4 h-4" />,
    profile: <User className="w-4 h-4" />,
    settings: <Settings className="w-4 h-4" />,
  };

  const categoryColors = {
    verification: "bg-teal-100 text-teal-800",
    access: "bg-blue-100 text-blue-800",
    security: "bg-red-100 text-red-800",
    blacklist: "bg-orange-100 text-orange-800",
    profile: "bg-purple-100 text-purple-800",
    settings: "bg-gray-100 text-gray-800",
  };

  const statusColors = {
    Success: "bg-teal-100 text-teal-800",
    Failed: "bg-red-100 text-red-800",
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      setLogs(staticLogs);
      setAdmins([
        { name: "John Doe", admin_id: "admin1" },
        { name: "Alice Johnson", admin_id: "admin2" },
        { name: "Emma Davis", admin_id: "admin3" },
      ]);
    } catch (err) {
      setError("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    // Simulate API delay for animation demo
    const timer = setTimeout(() => {
      fetchLogs();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const exportLogs = () => {
    const csvContent = [
      [
        "Timestamp",
        "Admin",
        "Action",
        "Details",
        "Target User",
        "IP Address",
        "Status",
      ],
      ...logs.map((log) => [
        log.timestamp,
        `${log.admin} (${log.admin_email})`,
        log.action,
        log.details,
        `${log.target_user} (${log.target_type})`,
        log.ip_address,
        log.status,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredLogs = useMemo(() => logs, [logs]);

  const getCategory = (action) => {
    if (
      action.includes("VERIFY") ||
      action.includes("REJECT") ||
      action.includes("APPROVE_EMPLOYER")
    )
      return "verification";
    if (action.includes("ACCESS")) return "access";
    if (action.includes("LOGIN")) return "security";
    if (action.includes("BLACKLIST")) return "blacklist";
    if (action.includes("PROFILE") || action.includes("IMPERSONATE"))
      return "profile";
    if (
      action.includes("SETTINGS") ||
      action.includes("EMAIL_TEMPLATE") ||
      action.includes("ANNOUNCEMENT")
    )
      return "settings";
    return "other";
  };

  return (
    <ThemeProvider theme={tealTheme}>
      <div className="min-h-screen bg-gray-50 p-6">
        <Slide in={isMounted} direction="down" timeout={500}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <Zoom in={isMounted} timeout={600}>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Audit Logs
                </h1>
                <p className="text-gray-600">
                  Track all administrative activities and system changes
                </p>
              </div>
            </Zoom>

            {/* Filters and Search */}
            <Fade in={isMounted} timeout={700}>
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 transition-all duration-500 hover:shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                      disabled={loading}
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none transition-all duration-300"
                      disabled={loading}
                    >
                      <option value="all">All Categories</option>
                      <option value="verification">Verification</option>
                      <option value="access">Access Control</option>
                      <option value="security">Security</option>
                      <option value="blacklist">Blacklist</option>
                      <option value="profile">Profile Changes</option>
                      <option value="settings">Settings</option>
                    </select>
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={selectedAdmin}
                      onChange={(e) => setSelectedAdmin(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none transition-all duration-300"
                      disabled={loading}
                    >
                      <option value="all">All Admins</option>
                      {admins.map((admin) => (
                        <option key={admin.admin_id} value={admin.name}>
                          {admin.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                      disabled={loading}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={exportLogs}
                    className="flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50"
                    disabled={loading || logs.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                </div>
              </div>
            </Fade>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Grow in={isMounted} timeout={800}>
                <div className="bg-white rounded-lg shadow-sm border p-4 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Total Logs</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {logs.length}
                      </p>
                    </div>
                  </div>
                </div>
              </Grow>
              <Grow in={isMounted} timeout={1000}>
                <div className="bg-white rounded-lg shadow-sm border p-4 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <UserCheck className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Verifications</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {
                          logs.filter(
                            (log) => getCategory(log.action) === "verification"
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </Grow>
              <Grow in={isMounted} timeout={1200}>
                <div className="bg-white rounded-lg shadow-sm border p-4 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Security Events</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {
                          logs.filter(
                            (log) => getCategory(log.action) === "security"
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </Grow>
              <Grow in={isMounted} timeout={1400}>
                <div className="bg-white rounded-lg shadow-sm border p-4 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Today's Actions</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {
                          logs.filter(
                            (log) =>
                              new Date(log.timestamp).toDateString() ===
                              new Date().toDateString()
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </Grow>
            </div>

            {/* Audit Logs Table */}
            <Fade in={isMounted} timeout={1600}>
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-500 hover:shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Target
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading &&
                        [...Array(5)].map((_, i) => (
                          <tr key={`skeleton-${i}`}>
                            <td className="px-6 py-4">
                              <Skeleton animation="wave" height={24} />
                            </td>
                            <td className="px-6 py-4">
                              <Skeleton
                                animation="wave"
                                height={24}
                                width="80%"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <Skeleton
                                animation="wave"
                                height={24}
                                width="70%"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <Skeleton animation="wave" height={24} />
                            </td>
                            <td className="px-6 py-4">
                              <Skeleton
                                animation="wave"
                                height={24}
                                width="60%"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <Skeleton
                                animation="wave"
                                height={24}
                                width="50%"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <Skeleton
                                animation="wave"
                                height={24}
                                width="40%"
                              />
                            </td>
                          </tr>
                        ))}
                      {!loading && logs.length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center">
                            <Fade in={true}>
                              <div className="text-gray-500 py-8">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2">
                                  No audit logs found matching your criteria.
                                </p>
                              </div>
                            </Fade>
                          </td>
                        </tr>
                      )}
                      {!loading &&
                        logs.length > 0 &&
                        logs.map((log, index) => (
                          <Grow
                            in={!loading}
                            timeout={index * 100}
                            key={log.id}
                          >
                            <tr
                              className={`transition-all duration-200 ${
                                hoveredRow === log.id
                                  ? "bg-teal-50 shadow-inner"
                                  : "hover:bg-gray-50"
                              }`}
                              onMouseEnter={() => setHoveredRow(log.id)}
                              onMouseLeave={() => setHoveredRow(null)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-600" />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {log.admin}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {log.admin_email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      categoryColors[getCategory(log.action)]
                                    } transition-colors duration-300`}
                                  >
                                    {categoryIcons[getCategory(log.action)]}
                                    <span className="ml-1">{log.action}</span>
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                {log.details}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {log.target_user}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {log.target_type}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div>{log.ip_address}</div>
                                <div className="text-xs text-gray-400">
                                  {log.device}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    statusColors[log.status]
                                  } transition-colors duration-300`}
                                >
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          </Grow>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Fade>

            {/* Pagination */}
            <Fade in={isMounted} timeout={1800}>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(page - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * itemsPerPage, logs.length)}
                  </span>{" "}
                  of <span className="font-medium">{logs.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                          p === page
                            ? "text-white bg-teal-600 shadow-md transform scale-105"
                            : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => setPage(p)}
                        disabled={loading}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages || loading}
                  >
                    Next
                  </button>
                </div>
              </div>
            </Fade>

            {/* Error Message */}
            {error && (
              <Fade in={!!error}>
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                  {error}
                </div>
              </Fade>
            )}
          </div>
        </Slide>
      </div>
    </ThemeProvider>
  );
};

export default AuditLogs;
