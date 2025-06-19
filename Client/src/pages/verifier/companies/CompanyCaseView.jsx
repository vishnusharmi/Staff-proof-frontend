import React, { useState, useEffect } from "react";
import {
  Building2,
  FileText,
  Eye,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  MessageSquare,
  Clock,
  User,
  MapPin,
  Globe,
  Phone,
  Mail,
  Calendar,
  Download,
  Save,
  Send,
} from "lucide-react";

const CompanyCaseView = () => {
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeDocument, setActiveDocument] = useState(null);
  const [documentStatuses, setDocumentStatuses] = useState({});
  const [flagReasons, setFlagReasons] = useState({});
  const [customReasons, setCustomReasons] = useState({});
  const [internalNotes, setInternalNotes] = useState("");
  const [clarificationRequest, setClarificationRequest] = useState("");
  const [finalStatus, setFinalStatus] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [supportingEvidence, setSupportingEvidence] = useState({});

  // Mock data for company case
  const mockCompanyCase = {
    id: "COMP_001",
    companyName: "TechCorp Solutions Pvt Ltd",
    staffProofId: "SP-COMP-2025-001",
    registrationNumber: "U72900MH2018PTC123456",
    gstNumber: "27AABCT1234C1Z5",
    profileStatus: "Under Review",
    assignedDate: "2025-06-10",
    verifier: "John Doe",
    priority: "High",
    companyDetails: {
      incorporationDate: "2018-03-15",
      address: "1234 Tech Park, Andheri East, Mumbai, Maharashtra 400069",
      contactEmail: "hr@techcorp.com",
      contactPhone: "+91-9876543210",
      website: "www.techcorp.com",
      employeeCount: "250-500",
      industry: "Information Technology",
      businessType: "Private Limited Company",
    },
    documents: {
      incorporationCertificate: {
        name: "Certificate of Incorporation",
        status: "pending",
        uploadDate: "2025-06-08",
        fileType: "PDF",
        size: "2.4 MB",
      },
      gstCertificate: {
        name: "GST Registration Certificate",
        status: "pending",
        uploadDate: "2025-06-08",
        fileType: "PDF",
        size: "1.8 MB",
      },
      panCard: {
        name: "Company PAN Card",
        status: "pending",
        uploadDate: "2025-06-08",
        fileType: "PDF",
        size: "890 KB",
      },
      addressProof: {
        name: "Address Proof (Utility Bill)",
        status: "pending",
        uploadDate: "2025-06-08",
        fileType: "PDF",
        size: "1.2 MB",
      },
      directorDetails: {
        name: "Director Details & KYC",
        status: "pending",
        uploadDate: "2025-06-08",
        fileType: "PDF",
        size: "3.1 MB",
      },
      bankStatement: {
        name: "Bank Statement (Last 3 months)",
        status: "pending",
        uploadDate: "2025-06-08",
        fileType: "PDF",
        size: "2.7 MB",
      },
    },
    activityLog: [
      {
        timestamp: "2025-06-10 14:30",
        action: "Case assigned to verifier",
        user: "System",
      },
      {
        timestamp: "2025-06-08 16:45",
        action: "Documents uploaded by company",
        user: "TechCorp Solutions",
      },
      {
        timestamp: "2025-06-08 10:20",
        action: "Company profile created",
        user: "System",
      },
    ],
  };

  const flagReasonOptions = [
    "Document Quality Poor",
    "Information Mismatch",
    "Incomplete Documentation",
    "Suspected Forgery",
    "Address Verification Required",
    "GST Number Invalid",
    "Incorporation Details Unclear",
    "Director Information Missing",
    "Financial Documents Unclear",
    "Other",
  ];

  const tagOptions = [
    "Startup",
    "MNC",
    "Government Contractor",
    "Export Business",
    "Service Provider",
    "Manufacturing",
    "High Risk",
    "New Registration",
    "Address Mismatch",
    "Financial Concern",
  ];

  useEffect(() => {
    // Initialize with mock data
    setSelectedCase(mockCompanyCase);
  }, []);

  const handleDocumentStatusChange = (docKey, status) => {
    setDocumentStatuses((prev) => ({
      ...prev,
      [docKey]: status,
    }));
  };

  const handleFlagReasonChange = (docKey, reason) => {
    setFlagReasons((prev) => ({
      ...prev,
      [docKey]: reason,
    }));
  };

  const handleCustomReasonChange = (docKey, reason) => {
    setCustomReasons((prev) => ({
      ...prev,
      [docKey]: reason,
    }));
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSupportingEvidenceUpload = (docKey) => {
    // Mock file upload
    setSupportingEvidence((prev) => ({
      ...prev,
      [docKey]: "evidence_uploaded.jpg",
    }));
  };

  const handleSubmitVerification = () => {
    const verificationData = {
      companyId: selectedCase.id,
      documentStatuses,
      flagReasons,
      customReasons,
      finalStatus,
      selectedTags,
      internalNotes,
      supportingEvidence,
      verifiedBy: selectedCase.verifier,
      verificationDate: new Date().toISOString(),
    };

    console.log("Submitting verification:", verificationData);
    alert("Company verification submitted successfully!");
  };

  const handleSendClarification = () => {
    if (!clarificationRequest.trim()) return;

    const clarificationData = {
      companyId: selectedCase.id,
      message: clarificationRequest,
      sentBy: selectedCase.verifier,
      sentDate: new Date().toISOString(),
    };

    console.log("Sending clarification:", clarificationData);
    alert("Clarification request sent to company!");
    setClarificationRequest("");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "flagged":
        return <Flag className="w-4 h-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "flagged":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!selectedCase) {
    return <div className="p-6">Loading company case...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCase.companyName}
                </h1>
                <p className="text-gray-600">
                  StaffProof ID: {selectedCase.staffProofId}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  "pending"
                )}`}
              >
                {selectedCase.profileStatus}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCase.priority === "High"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {selectedCase.priority} Priority
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Details Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Company Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                Company Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Registration:</span>
                  <span className="ml-2 font-medium">
                    {selectedCase.registrationNumber}
                  </span>
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">GST Number:</span>
                  <span className="ml-2 font-medium">
                    {selectedCase.gstNumber}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Incorporated:</span>
                  <span className="ml-2 font-medium">
                    {selectedCase.companyDetails.incorporationDate}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Address:</span>
                  <span className="ml-2 font-medium text-xs">
                    {selectedCase.companyDetails.address}
                  </span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">
                    {selectedCase.companyDetails.contactEmail}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium">
                    {selectedCase.companyDetails.contactPhone}
                  </span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Website:</span>
                  <span className="ml-2 font-medium">
                    {selectedCase.companyDetails.website}
                  </span>
                </div>
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Employees:</span>
                  <span className="ml-2 font-medium">
                    {selectedCase.companyDetails.employeeCount}
                  </span>
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Industry:</span>
                  <span className="ml-2 font-medium">
                    {selectedCase.companyDetails.industry}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Tags */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                Final Status & Tags
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Status
                </label>
                <select
                  value={finalStatus}
                  onChange={(e) => setFinalStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Status</option>
                  <option value="verified">✅ Verified</option>
                  <option value="flagged">⚠ Flagged</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {tagOptions.map((tag) => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        className="mr-2"
                      />
                      <span className="text-sm">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Log */}
            {/* <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-600" />
                Activity Log
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedCase.activityLog.map((activity, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-gray-900">
                      {activity.action}
                    </div>
                    <div className="text-gray-500">
                      {activity.timestamp} - {activity.user}
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

          {/* Document Review Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Documents Grid */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Company Documents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedCase.documents).map(([docKey, doc]) => (
                  <div
                    key={docKey}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{doc.name}</h4>
                      {getStatusIcon(documentStatuses[docKey] || "pending")}
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      <div>Uploaded: {doc.uploadDate}</div>
                      <div>
                        Size: {doc.size} • {doc.fileType}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveDocument(docKey)}
                        className="w-full flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Document
                      </button>

                      <select
                        value={documentStatuses[docKey] || ""}
                        onChange={(e) =>
                          handleDocumentStatusChange(docKey, e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Select Status</option>
                        <option value="verified">✅ Verified</option>
                        <option value="flagged">⚠ Flagged</option>
                        <option value="rejected">❌ Rejected</option>
                      </select>

                      {(documentStatuses[docKey] === "flagged" ||
                        documentStatuses[docKey] === "rejected") && (
                        <div className="space-y-2">
                          <select
                            value={flagReasons[docKey] || ""}
                            onChange={(e) =>
                              handleFlagReasonChange(docKey, e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="">Select Reason</option>
                            {flagReasonOptions.map((reason) => (
                              <option key={reason} value={reason}>
                                {reason}
                              </option>
                            ))}
                          </select>

                          {flagReasons[docKey] === "Other" && (
                            <textarea
                              value={customReasons[docKey] || ""}
                              onChange={(e) =>
                                handleCustomReasonChange(docKey, e.target.value)
                              }
                              placeholder="Enter custom reason..."
                              className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              rows="2"
                            />
                          )}

                          <button
                            onClick={() =>
                              handleSupportingEvidenceUpload(docKey)
                            }
                            className="w-full flex items-center justify-center px-3 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-sm"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {supportingEvidence[docKey]
                              ? "Evidence Uploaded"
                              : "Upload Evidence"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Notes */}
            {/* <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                Internal Notes
              </h3>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add internal notes visible only to admin..."
                className="w-full p-3 border border-gray-300 rounded-md"
                rows="4"
              />
            </div> */}

            {/* Clarification Request */}
            {/* <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
                Request Clarification
              </h3>
              <div className="space-y-3">
                <textarea
                  value={clarificationRequest}
                  onChange={(e) => setClarificationRequest(e.target.value)}
                  placeholder="Request additional information from the company..."
                  className="w-full p-3 border border-gray-300 rounded-md"
                  rows="3"
                />
                <button
                  onClick={handleSendClarification}
                  disabled={!clarificationRequest.trim()}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Clarification Request
                </button>
              </div>
            </div> */}

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex space-x-4">
                <button
                  onClick={handleSubmitVerification}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Submit Verification
                </button>
                {/* <button className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium">
                  <Download className="w-5 h-5 mr-2" />
                  Generate Report
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Document Preview Modal */}
        {activeDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">
                  {selectedCase.documents[activeDocument].name}
                </h3>
                <button
                  onClick={() => setActiveDocument(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 h-96 bg-gray-100 flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Document preview would appear here</p>
                  <p className="text-sm">
                    ({selectedCase.documents[activeDocument].fileType} -{" "}
                    {selectedCase.documents[activeDocument].size})
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyCaseView;
