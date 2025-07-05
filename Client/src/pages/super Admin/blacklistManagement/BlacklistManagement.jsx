import React, { useState, useEffect, useContext } from "react";
import { Search, AlertTriangle } from "lucide-react";
import { fetchBlacklist, updateBlacklistStatus } from '../../../components/api/api';
import { UserContext } from '../../../components/context/UseContext';

const BlacklistManagement = () => {
  const [blacklist, setBlacklist] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [search, setSearch] = useState("");
  const [reportedByFilter, setReportedByFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const itemsPerPage = 5;

  const { user } = useContext(UserContext);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchBlacklist({
        page,
        limit: itemsPerPage,
        search,
        reportedBy: reportedByFilter
      });
      
      setBlacklist(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalEntries(response.pagination?.total || 0);
      
      // Extract unique employers for filter
      const uniqueEmployers = [...new Set(response.data?.map(item => item.reported_by) || [])];
      setEmployers(uniqueEmployers.map(name => ({ id: name, name })));
      
    } catch (err) {
      console.error('Error fetching blacklist data:', err);
      setError(err.response?.data?.message || 'Failed to load blacklist data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, page, search, reportedByFilter]);

  const handleAction = async (action, id, firstName, lastName) => {
    setLoading(true);
    setError(null);
    try {
      await updateBlacklistStatus(id, { status: action === 'approve' ? 'Approved' : 'Rejected' });
      
      setBlacklist((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                status: action === "approve" ? "Approved" : "Rejected",
              }
            : entry
        )
      );
      
      alert(`${action === 'approve' ? 'Approved' : 'Rejected'} blacklist entry for ${firstName} ${lastName}`);
    } catch (err) {
      console.error(`Error ${action}ing blacklist entry:`, err);
      setError(`Failed to ${action} blacklist entry for ${firstName} ${lastName}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && blacklist.length === 0) {
    return (
      <div className="min-h-screen p-6 bg-teal-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <span className="ml-3 text-teal-600">Loading blacklist data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-teal-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-teal-800">
            Blacklist Management
          </h1>
          {loading && (
            <div className="flex items-center text-teal-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600 mr-2"></div>
              Processing...
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600">Total Entries</p>
                <p className="text-2xl font-bold text-teal-800">{totalEntries}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-teal-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {blacklist.filter(item => item.status === "Pending").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {blacklist.filter(item => item.status === "Approved").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {blacklist.filter(item => item.status === "Rejected").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-teal-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 text-sm border-2 border-teal-100 rounded-lg focus:border-teal-300 focus:ring-2 focus:ring-teal-50"
                  placeholder="Search by name or ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-teal-700 mb-1">
                Reported By
              </label>
              <select
                className="w-full px-3 py-2 text-sm border-2 border-teal-100 rounded-lg focus:border-teal-300 focus:ring-2 focus:ring-teal-50"
                value={reportedByFilter}
                onChange={(e) => setReportedByFilter(e.target.value)}
              >
                <option value="">All Employers</option>
                {employers.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-teal-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-teal-200">
              <thead className="bg-teal-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                    StaffProof ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                    Report Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-teal-100">
                {blacklist.map((item) => (
                  <tr key={item.id} className="hover:bg-teal-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-teal-900">
                        {item.employee_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                      {item.staffproof_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                      {item.reported_by}
                    </td>
                    <td className="px-6 py-4 text-sm text-teal-900 max-w-xs truncate">
                      {item.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                      {formatDate(item.report_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                        item.status === "Pending" 
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                          : item.status === "Approved"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : "bg-red-100 text-red-800 border-red-300"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {item.status === "Pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAction("approve", item.id, item.first_name, item.last_name)}
                            disabled={loading}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction("reject", item.id, item.first_name, item.last_name)}
                            disabled={loading}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-teal-300 text-sm font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-teal-300 text-sm font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-teal-700">
                    Showing page <span className="font-medium">{page}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-teal-300 bg-white text-sm font-medium text-teal-500 hover:bg-teal-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
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
      </div>
    </div>
  );
};

export default BlacklistManagement;
