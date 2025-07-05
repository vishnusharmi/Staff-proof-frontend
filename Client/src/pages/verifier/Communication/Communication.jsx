import React, { useState, useEffect } from "react";
import {
  Send,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
  Users,
  Mail,
  Building2,
  Search,
  ChevronDown,
  User,
  Eye,
} from "lucide-react";
import {
  fetchVerifierEmployees,
  fetchVerifierCompanies,
  fetchVerifierClarifications,
  sendVerifierClarification,
} from "../../../components/api/api";

const Communication = ({
  employeeId,
  verifierId,
  employeeName = "John Smith",
  staffProofId = "SP12345",
}) => {
  const [activeTab, setActiveTab] = useState("clarification");
  const [clarificationMessage, setClarificationMessage] = useState("");
  const [companyMessage, setCompanyMessage] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [clarificationRequests, setClarificationRequests] = useState([]);
  const [companyRequests, setCompanyRequests] = useState([]);
  const [adminChats, setAdminChats] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Employee and Company selection states
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Load data from APIs
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [empRes, compRes, clarRes] = await Promise.all([
          fetchVerifierEmployees(employeeSearchTerm),
          fetchVerifierCompanies(companySearchTerm),
          fetchVerifierClarifications(),
        ]);
        
        setEmployees(empRes.data || []);
        setCompanies(compRes.data || []);
        setClarificationRequests(clarRes.data || []);
      } catch (err) {
        console.error('Error loading communication data:', err);
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [employeeSearchTerm, companySearchTerm]);

  // Filter functions
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.staffProofId
        .toLowerCase()
        .includes(employeeSearchTerm.toLowerCase())
  );

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(companySearchTerm.toLowerCase())
  );

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeSearchTerm(employee.name);
    setShowEmployeeDropdown(false);
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setCompanySearchTerm(company.name);
    setShowCompanyDropdown(false);
  };

  const handlePreview = (type) => {
    let previewData = null;
    
    if (type === "employee" && selectedEmployee) {
      previewData = {
        type: "Employee Clarification",
        recipient: selectedEmployee.name,
        email: selectedEmployee.email,
        staffProofId: selectedEmployee.staffProofId,
        message: clarificationMessage,
      };
    } else if (type === "company" && selectedCompany) {
      previewData = {
        type: "Company Clarification",
        recipient: selectedCompany.name,
        email: selectedCompany.email,
        industry: selectedCompany.industry,
        message: companyMessage,
      };
    }
    
    setPreviewData(previewData);
    setShowPreview(true);
  };

  const handleClarificationSubmit = async () => {
    if (!clarificationMessage.trim() || !selectedEmployee) {
      return;
    }

    setIsSubmitting(true);
    try {
      const clarificationData = {
        type: "employee",
        recipientId: selectedEmployee.id,
        recipientType: "employee",
        message: clarificationMessage.trim(),
      };

      await sendVerifierClarification(clarificationData);
      
      // Refresh clarifications
      const clarRes = await fetchVerifierClarifications();
      setClarificationRequests(clarRes.data || []);
      
      setClarificationMessage("");
      setSelectedEmployee(null);
      setEmployeeSearchTerm("");
    } catch (err) {
      console.error('Error sending clarification:', err);
      setError(err.response?.data?.message || 'Failed to send clarification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompanyMessageSubmit = async () => {
    if (!companyMessage.trim() || !selectedCompany) {
      return;
    }

    setIsSubmitting(true);
    try {
      const clarificationData = {
        type: "company",
        recipientId: selectedCompany.id,
        recipientType: "company",
        message: companyMessage.trim(),
      };

      await sendVerifierClarification(clarificationData);
      
      // Refresh clarifications
      const clarRes = await fetchVerifierClarifications();
      setClarificationRequests(clarRes.data || []);
      
      setCompanyMessage("");
      setSelectedCompany(null);
      setCompanySearchTerm("");
    } catch (err) {
      console.error('Error sending company message:', err);
      setError(err.response?.data?.message || 'Failed to send company message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminMessageSubmit = async () => {
    if (!adminMessage.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Add admin message to local state for now
      const newAdminChat = {
        id: Date.now(),
        sender: "verifier",
        senderName: "Current Verifier",
        message: adminMessage.trim(),
        sentAt: new Date().toISOString(),
      };

      setAdminChats((prev) => [newAdminChat, ...prev]);
      setAdminMessage("");
    } catch (err) {
      console.error('Error sending admin message:', err);
      setError(err.response?.data?.message || 'Failed to send admin message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "responded":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const sanitizeInput = (input) => {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading communication data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Communication Center
              </h1>
              <p className="text-gray-600">
                Manage clarifications and communications
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("clarification")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "clarification"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Clarification Requests
            </button>
            <button
              onClick={() => setActiveTab("company")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "company"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Company Communications
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "admin"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Admin Chat
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "clarification" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Send Employee Clarification
              </h2>
              
              {/* Employee Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search employees by name, email, or StaffProof ID..."
                    value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    onFocus={() => setShowEmployeeDropdown(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {showEmployeeDropdown && filteredEmployees.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredEmployees.map((employee) => (
                        <button
                          key={employee.id}
                          onClick={() => handleEmployeeSelect(employee)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-500">
                            {employee.email} • {employee.staffProofId}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Message Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clarification Message
                </label>
                <textarea
                  value={clarificationMessage}
                  onChange={(e) => setClarificationMessage(sanitizeInput(e.target.value))}
                  placeholder="Enter your clarification request..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handlePreview("employee")}
                  disabled={!selectedEmployee || !clarificationMessage.trim()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Preview
                </button>
                <button
                  onClick={handleClarificationSubmit}
                  disabled={!selectedEmployee || !clarificationMessage.trim() || isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Clarification"}
                </button>
              </div>
            </div>

            {/* Existing Clarifications */}
            <div className="border-t border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Clarifications
              </h3>
              <div className="space-y-4">
                {clarificationRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {request.employeeName || request.companyName}
                          </span>
                          {getStatusIcon(request.status)}
                          <span className="text-xs text-gray-500">
                            {formatDateTime(request.sentAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {request.message}
                        </p>
                        {request.employeeResponse && (
                          <div className="bg-white rounded p-3 border-l-4 border-blue-500">
                            <p className="text-sm text-gray-700">
                              <strong>Response:</strong> {request.employeeResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {clarificationRequests.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No clarification requests found.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "company" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Send Company Communication
              </h2>
              
              {/* Company Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Company
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search companies by name, email, or industry..."
                    value={companySearchTerm}
                    onChange={(e) => setCompanySearchTerm(e.target.value)}
                    onFocus={() => setShowCompanyDropdown(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {showCompanyDropdown && filteredCompanies.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCompanies.map((company) => (
                        <button
                          key={company.id}
                          onClick={() => handleCompanySelect(company)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-gray-500">
                            {company.email} • {company.industry}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Message Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Communication Message
                </label>
                <textarea
                  value={companyMessage}
                  onChange={(e) => setCompanyMessage(sanitizeInput(e.target.value))}
                  placeholder="Enter your communication message..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handlePreview("company")}
                  disabled={!selectedCompany || !companyMessage.trim()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Preview
                </button>
                <button
                  onClick={handleCompanyMessageSubmit}
                  disabled={!selectedCompany || !companyMessage.trim() || isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "admin" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Admin Communication
              </h2>
              
              {/* Message Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to Admin Team
                </label>
                <textarea
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(sanitizeInput(e.target.value))}
                  placeholder="Enter your message to the admin team..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Send Button */}
              <div className="mb-6">
                <button
                  onClick={handleAdminMessageSubmit}
                  disabled={!adminMessage.trim() || isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </div>

              {/* Chat History */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Chat History
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {adminChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex ${
                        chat.sender === "verifier" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          chat.sender === "verifier"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <div className="text-xs opacity-75 mb-1">
                          {chat.senderName} • {formatDateTime(chat.sentAt)}
                        </div>
                        <p className="text-sm">{chat.message}</p>
                      </div>
                    </div>
                  ))}
                  {adminChats.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No messages yet. Start a conversation with the admin team.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && previewData && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Preview Message
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="mb-2">
                    <strong>Type:</strong> {previewData.type}
                  </div>
                  <div className="mb-2">
                    <strong>Recipient:</strong> {previewData.recipient}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {previewData.email}
                  </div>
                  {previewData.staffProofId && (
                    <div className="mb-2">
                      <strong>StaffProof ID:</strong> {previewData.staffProofId}
                    </div>
                  )}
                  {previewData.industry && (
                    <div className="mb-2">
                      <strong>Industry:</strong> {previewData.industry}
                    </div>
                  )}
                  <div className="mb-2">
                    <strong>Message:</strong>
                  </div>
                  <div className="bg-white rounded p-3 border">
                    {previewData.message}
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (previewData.type === "Employee Clarification") {
                        handleClarificationSubmit();
                      } else if (previewData.type === "Company Clarification") {
                        handleCompanyMessageSubmit();
                      }
                      setShowPreview(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Send
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

export default Communication;
