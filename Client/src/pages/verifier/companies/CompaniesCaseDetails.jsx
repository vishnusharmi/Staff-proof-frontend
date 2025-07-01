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

const CompaniesCaseDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Mock data for company cases
  const [companyCases] = useState([
    {
      id: "CP001234",
      companyName: "Tech Solutions Pvt Ltd",
      profileStatus: "New",
      assignedDate: "2024-06-10",
      priority: "High",
      documentsCount: 12,
      completedDocs: 3,
      employeeCount: 250,
      industry: "Information Technology",
      location: "Mumbai, Maharashtra",
      contactInfo: {
        email: "hr@techsolutions.com",
        phone: "+91 22 1234 5678",
        website: "www.techsolutions.com",
      },
      verificationProgress: 25,
      lastActivity: "2024-06-12 09:30 AM",
      registrationNumber: "U72200MH2015PTC123456",
      foundedYear: "2015",
      headquarters: "Mumbai, Maharashtra",
    },
    {
      id: "CP001235",
      companyName: "Digital Innovations Inc",
      profileStatus: "In Progress",
      assignedDate: "2024-06-08",
      priority: "Medium",
      documentsCount: 10,
      completedDocs: 7,
      employeeCount: 150,
      industry: "Software Development",
      location: "Pune, Maharashtra",
      contactInfo: {
        email: "verification@digitalinn.com",
        phone: "+91 20 9876 5432",
        website: "www.digitalinnovations.com",
      },
      verificationProgress: 70,
      lastActivity: "2024-06-12 11:15 AM",
      registrationNumber: "U72200PN2018PTC234567",
      foundedYear: "2018",
      headquarters: "Pune, Maharashtra",
    },
    {
      id: "CP001236",
      companyName: "StartUp Solutions",
      profileStatus: "Completed",
      assignedDate: "2024-06-05",
      priority: "Low",
      documentsCount: 8,
      completedDocs: 8,
      employeeCount: 45,
      industry: "Consulting",
      location: "Bangalore, Karnataka",
      contactInfo: {
        email: "admin@startupsol.com",
        phone: "+91 80 5555 6666",
        website: "www.startupsolutions.com",
      },
      verificationProgress: 100,
      lastActivity: "2024-06-11 04:30 PM",
      registrationNumber: "U74999KA2020PTC345678",
      foundedYear: "2020",
      headquarters: "Bangalore, Karnataka",
    },
    {
      id: "CP001237",
      companyName: "Manufacturing Corp Ltd",
      profileStatus: "New",
      assignedDate: "2024-06-11",
      priority: "High",
      documentsCount: 15,
      completedDocs: 2,
      employeeCount: 500,
      industry: "Manufacturing",
      location: "Chennai, Tamil Nadu",
      contactInfo: {
        email: "compliance@mfgcorp.com",
        phone: "+91 44 7777 8888",
        website: "www.manufacturingcorp.com",
      },
      verificationProgress: 13,
      lastActivity: "2024-06-12 08:45 AM",
      registrationNumber: "U25191TN2012PTC456789",
      foundedYear: "2012",
      headquarters: "Chennai, Tamil Nadu",
    },
    {
      id: "CP001238",
      companyName: "FinTech Innovators",
      profileStatus: "In Progress",
      assignedDate: "2024-06-07",
      priority: "High",
      documentsCount: 14,
      completedDocs: 9,
      employeeCount: 320,
      industry: "Financial Technology",
      location: "Hyderabad, Telangana",
      contactInfo: {
        email: "kyc@fintechinnovators.com",
        phone: "+91 40 9999 0000",
        website: "www.fintechinnovators.com",
      },
      verificationProgress: 64,
      lastActivity: "2024-06-12 02:20 PM",
      registrationNumber: "U67190TG2017PTC567890",
      foundedYear: "2017",
      headquarters: "Hyderabad, Telangana",
    },
    {
      id: "CP001239",
      companyName: "Green Energy Solutions",
      profileStatus: "Completed",
      assignedDate: "2024-06-03",
      priority: "Medium",
      documentsCount: 11,
      completedDocs: 11,
      employeeCount: 180,
      industry: "Renewable Energy",
      location: "Jaipur, Rajasthan",
      contactInfo: {
        email: "info@greenenergy.com",
        phone: "+91 141 1111 2222",
        website: "www.greenenergysolutions.com",
      },
      verificationProgress: 100,
      lastActivity: "2024-06-10 05:15 PM",
      registrationNumber: "U40106RJ2019PTC678901",
      foundedYear: "2019",
      headquarters: "Jaipur, Rajasthan",
    },
  ]);

  // Filter companies based on search, status, and priority
  const filteredCompanies = companyCases.filter((company) => {
    const matchesSearch =
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "new" && company.profileStatus === "New") ||
      (statusFilter === "in-progress" &&
        company.profileStatus === "In Progress") ||
      (statusFilter === "completed" && company.profileStatus === "Completed");

    const matchesPriority =
      priorityFilter === "all" ||
      company.priority.toLowerCase() === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter]);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers for pagination
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
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const handleOpenCase = (company) => {
    // This is where you would integrate with your main component
    console.log("Opening case for:", company.id);
  };

  const handlePreview = (company) => {
    setSelectedCompany(company);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedCompany(null);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Cases</h1>
            <p className="text-gray-600 mt-1">
              Manage and verify company profiles
            </p>
          </div>
          <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg shadow-sm border">
            {filteredCompanies.length} of {companyCases.length} cases
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by Company Name, ID, or Industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <button className="flex items-center space-x-2 border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Company Cases Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentCompanies.map((company) => {
            const borderColor =
              company.profileStatus === "New"
                ? "border-l-blue-500"
                : company.profileStatus === "In Progress"
                ? "border-l-yellow-500"
                : "border-l-green-500";

            return (
              <div
                key={company.id}
                className={`bg-white rounded-lg shadow-sm border border-l-4 ${borderColor} hover:shadow-md transition-all duration-200 overflow-hidden`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base leading-tight">
                          {company.companyName}
                        </h3>
                        <p className="text-xs text-gray-600">{company.id}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          company.profileStatus
                        )}`}
                      >
                        {company.profileStatus}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                          company.priority
                        )}`}
                      >
                        {company.priority}
                      </span>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Building2 className="w-3 h-3" />
                      <span>{company.industry}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Users className="w-3 h-3" />
                      <span>{company.employeeCount} employees</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Assigned:{" "}
                        {new Date(company.assignedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePreview(company)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => handleOpenCase(company)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <ExternalLink className="w-3 h-3" />

                      <span>
                        <Link to="/verifier/companyCase">Open Case </Link>{" "}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No company cases found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredCompanies.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-4 mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Items per page selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                  <option value={24}>24</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCompanies.length)} of {filteredCompanies.length} results
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center space-x-1">
                {/* First page button */}
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous page button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && goToPage(page)}
                    disabled={page === '...'}
                    className={`px-3 py-2 rounded-md border transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : page === '...'
                        ? 'border-gray-300 text-gray-400 cursor-default'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next page button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last page button */}
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Company Preview
                </h2>
                <button
                  onClick={closePreview}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Company Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedCompany.companyName}
                    </h3>
                    <p className="text-gray-600">{selectedCompany.id}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          selectedCompany.profileStatus
                        )}`}
                      >
                        {selectedCompany.profileStatus}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                          selectedCompany.priority
                        )}`}
                      >
                        {selectedCompany.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>

                {/* Company Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Company Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Industry</p>
                          <p className="font-medium">
                            {selectedCompany.industry}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Employee Count
                          </p>
                          <p className="font-medium">
                            {selectedCompany.employeeCount}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Founded</p>
                          <p className="font-medium">
                            {selectedCompany.foundedYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-medium">
                            {selectedCompany.headquarters}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">
                            {selectedCompany.contactInfo.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">
                            {selectedCompany.contactInfo.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Website</p>
                          <p className="font-medium">
                            {selectedCompany.contactInfo.website}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Registration Number
                          </p>
                          <p className="font-medium">
                            {selectedCompany.registrationNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Progress */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Verification Status
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progress
                      </span>
                      <span className="text-sm text-gray-600">
                        {selectedCompany.verificationProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(
                          selectedCompany.verificationProgress
                        )}`}
                        style={{
                          width: `${selectedCompany.verificationProgress}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        {selectedCompany.completedDocs} of{" "}
                        {selectedCompany.documentsCount} documents completed
                      </span>
                      <span>Last activity: {selectedCompany.lastActivity}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      closePreview();
                      handleOpenCase(selectedCompany);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Case</span>
                  </button>
                  <button
                    onClick={closePreview}
                    className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesCaseDetails;
