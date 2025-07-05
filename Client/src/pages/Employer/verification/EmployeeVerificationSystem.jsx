import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Calendar,
  Building,
  GraduationCap,
  FileText,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { fetchVerifications, assignVerification, fetchCaseAssignments } from '../../../components/api/api';

const CaseAssign = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCases, setSelectedCases] = useState([]);
  const [selectedVerifier, setSelectedVerifier] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("unassigned");
  const [filterUserType, setFilterUserType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [cases, setCases] = useState([]);
  const [verifiers, setVerifiers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [assigning, setAssigning] = useState(false);

  // Fetch verification cases and verifiers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch verification cases
        const casesResponse = await fetchVerifications({
          page: currentPage,
          limit: itemsPerPage,
          status: filterStatus,
          type: filterUserType,
          priority: filterPriority,
          search: searchTerm
        });
        
        // Fetch case assignments for verifiers
        const assignmentsResponse = await fetchCaseAssignments();
        
        setCases(casesResponse.data.verifications || []);
        setTotalPages(casesResponse.data.pagination?.totalPages || 1);
        setVerifiers(assignmentsResponse.data.verifiers || []);
      } catch (err) {
        setError(err.message || 'Failed to load verification data');
        console.error('Error fetching verification data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage, filterStatus, filterUserType, filterPriority, searchTerm]);

  const handleCaseSelection = (caseId) => {
    setSelectedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const handleSelectAllOnPage = (checked) => {
    if (checked) {
      const currentPageCaseIds = cases.map(caseItem => caseItem.id);
      setSelectedCases(prev => [...new Set([...prev, ...currentPageCaseIds])]);
    } else {
      const currentPageCaseIds = cases.map(caseItem => caseItem.id);
      setSelectedCases(prev => prev.filter(id => !currentPageCaseIds.includes(id)));
    }
  };

  const handleAssignCases = async () => {
    if (!selectedVerifier || selectedCases.length === 0) {
      setError('Please select a verifier and at least one case');
      return;
    }

    try {
      setAssigning(true);
      setError(null);

      // Assign each selected case
      const assignPromises = selectedCases.map(caseId =>
        assignVerification(caseId, { verifierId: selectedVerifier })
      );

      await Promise.all(assignPromises);

      // Refresh data
      const casesResponse = await fetchVerifications({
        page: currentPage,
        limit: itemsPerPage,
        status: filterStatus,
        type: filterUserType,
        priority: filterPriority,
        search: searchTerm
      });

      setCases(casesResponse.data.verifications || []);
      setSelectedCases([]);
      setSelectedVerifier("");
      
      alert('Cases assigned successfully!');
    } catch (err) {
      setError(err.message || 'Failed to assign cases');
      console.error('Error assigning cases:', err);
    } finally {
      setAssigning(false);
    }
  };

  const handleReassignCase = async (caseId) => {
    if (!selectedVerifier) {
      setError('Please select a verifier');
      return;
    }

    try {
      setAssigning(true);
      setError(null);

      await assignVerification(caseId, { verifierId: selectedVerifier });

      // Refresh data
      const casesResponse = await fetchVerifications({
        page: currentPage,
        limit: itemsPerPage,
        status: filterStatus,
        type: filterUserType,
        priority: filterPriority,
        search: searchTerm
      });

      setCases(casesResponse.data.verifications || []);
      setSelectedVerifier("");
      
      alert('Case reassigned successfully!');
    } catch (err) {
      setError(err.message || 'Failed to reassign case');
      console.error('Error reassigning case:', err);
    } finally {
      setAssigning(false);
    }
  };

  const getVerifierWorkload = (verifierId) => {
    const verifier = verifiers.find(v => v.id === verifierId);
    return verifier ? verifier.assignedCases : 0;
  };

  const getVerifierWorkloadColor = (verifierId) => {
    const workload = getVerifierWorkload(verifierId);
    if (workload >= 15) return "text-red-600";
    if (workload >= 10) return "text-yellow-600";
    return "text-green-600";
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "unassigned":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_verification":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "reassign_needed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "unassigned":
        return <Clock className="w-4 h-4" />;
      case "assigned":
        return <AlertTriangle className="w-4 h-4" />;
      case "in_verification":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "reassign_needed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Employee Verification System
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and assign verification cases to verifiers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {cases.filter(c => c.status === 'completed').length} Completed
                  </span>
                </div>
              </div>
              <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    {cases.filter(c => c.status === 'unassigned').length} Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertTriangle size={18} className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="unassigned">Unassigned</option>
                <option value="assigned">Assigned</option>
                <option value="in_verification">In Verification</option>
                <option value="completed">Completed</option>
                <option value="reassign_needed">Reassign Needed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filterUserType}
                onChange={(e) => setFilterUserType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="employee">Employee</option>
                <option value="company">Company</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verifier</label>
              <select
                value={selectedVerifier}
                onChange={(e) => setSelectedVerifier(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Verifier</option>
                {verifiers.map((verifier) => (
                  <option key={verifier.id} value={verifier.id}>
                    {verifier.name} ({verifier.assignedCases}/{verifier.maxCapacity})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Verification Cases</h2>
              <button
                onClick={handleAssignCases}
                disabled={selectedCases.length === 0 || !selectedVerifier || assigning}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {assigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} />
                    Assign Selected ({selectedCases.length})
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectAllOnPage(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verifier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No verification cases found</p>
                    </td>
                  </tr>
                ) : (
                  cases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCases.includes(caseItem.id)}
                          onChange={() => handleCaseSelection(caseItem.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {caseItem.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{caseItem.name}</div>
                          <div className="text-sm text-gray-500">{caseItem.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          caseItem.type === 'employee' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {caseItem.type === 'employee' ? <User className="w-3 h-3 mr-1" /> : <Building className="w-3 h-3 mr-1" />}
                          {caseItem.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(caseItem.status)}`}>
                          {getStatusIcon(caseItem.status)}
                          <span className="ml-1">{caseItem.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(caseItem.priority)}`}>
                          {caseItem.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {caseItem.verifier ? (
                          <div>
                            <div>{caseItem.verifier}</div>
                            <div className={`text-xs ${getVerifierWorkloadColor(caseItem.verifierId)}`}>
                              {getVerifierWorkload(caseItem.verifierId)} cases
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleReassignCase(caseItem.id)}
                          disabled={!selectedVerifier || assigning}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Reassign
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        disabled={page === '...'}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : page === '...'
                            ? 'text-gray-400 cursor-default'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default CaseAssign;