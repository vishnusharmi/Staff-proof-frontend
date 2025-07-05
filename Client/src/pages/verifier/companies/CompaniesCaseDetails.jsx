import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Eye,
  CheckCircle,
  Clock,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Link } from "react-router";
import { fetchVerifierCompanyCases } from "../../../components/api/api";

const CompaniesCaseDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [companyCases, setCompanyCases] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 6
  });

  // Load company cases from API
  useEffect(() => {
    const loadCompanyCases = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
          page: currentPage,
          limit: itemsPerPage
        };

        const response = await fetchVerifierCompanyCases(params);
        setCompanyCases(response.data?.cases || []);
        setPagination(response.data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 6
        });
      } catch (err) {
        console.error('Error loading company cases:', err);
        setError(err.response?.data?.message || 'Failed to load company cases');
      } finally {
        setLoading(false);
      }
    };

    loadCompanyCases();
  }, [searchTerm, statusFilter, priorityFilter, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, pagination.totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(pagination.totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (pagination.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(pagination.totalPages);
      } else if (currentPage >= pagination.totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = pagination.totalPages - 3; i <= pagination.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(pagination.totalPages);
      }
    }
    
    return pages;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Flagged":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleOpenCase = (company) => {
    // Navigate to case details page
    console.log("Opening case for:", company.companyName);
  };

  const handlePreview = (company) => {
    setSelectedCompany(company);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedCompany(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company cases...</p>
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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Company Verification Cases
              </h1>
              <p className="text-gray-600">
                Manage and track company verification progress
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Items Per Page */}
            <div>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={6}>6 per page</option>
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Company Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companyCases.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {company.companyName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{company.id}</p>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          company.profileStatus
                        )}`}
                      >
                        {company.profileStatus}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                          company.priority
                        )}`}
                      >
                        {company.priority}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePreview(company)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Verification Progress</span>
                    <span>{company.verificationProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(
                        company.verificationProgress
                      )}`}
                      style={{ width: `${company.verificationProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Documents</p>
                    <p className="font-medium">
                      {company.completedDocs}/{company.documentsCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Employees</p>
                    <p className="font-medium">{company.employeeCount}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Assigned: {new Date(company.assignedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{company.lastActivity}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenCase(company)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Open Case
                  </button>
                  <button
                    onClick={() => handlePreview(company)}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {companyCases.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No company cases found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, pagination.totalItems)} of{" "}
                  {pagination.totalItems} results
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && goToPage(page)}
                    disabled={page === '...'}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : page === "..."
                        ? "text-gray-400 cursor-default"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedCompany && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Company Details - {selectedCompany.companyName}
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Company ID:</span>
                    <span className="font-medium">{selectedCompany.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Industry:</span>
                    <span className="font-medium">{selectedCompany.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium">{selectedCompany.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Founded Year:</span>
                    <span className="font-medium">{selectedCompany.foundedYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Registration:</span>
                    <span className="font-medium">{selectedCompany.registrationNumber}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{selectedCompany.contactInfo.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{selectedCompany.contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{selectedCompany.contactInfo.website}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{selectedCompany.headquarters}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Progress */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Verification Progress</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{selectedCompany.verificationProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className={`h-3 rounded-full ${getProgressBarColor(
                      selectedCompany.verificationProgress
                    )}`}
                    style={{ width: `${selectedCompany.verificationProgress}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Documents Verified</p>
                    <p className="font-medium">
                      {selectedCompany.completedDocs} of {selectedCompany.documentsCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Employees</p>
                    <p className="font-medium">{selectedCompany.employeeCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closePreview}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleOpenCase(selectedCompany);
                  closePreview();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Open Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesCaseDetails;
