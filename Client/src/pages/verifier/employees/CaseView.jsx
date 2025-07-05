import React, { useState, useEffect, useContext } from "react";
import {
  FileText,
  Upload,
  Eye,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Building,
  MapPin,
  Mail,
  Phone,
  Download,
} from "lucide-react";
import { useParams } from 'react-router-dom';
import { fetchVerificationCase, updateCaseStatus, addCaseNote, requestClarification } from '../../../components/api/api';
import { UserContext } from '../../../components/context/UseContext';

const flagReasons = [
  "Document Quality Poor",
  "Information Mismatch",
  "Suspected Forgery",
  "Incomplete Information",
  "Salary Discrepancy",
  "Employment Gap",
  "Other",
];

const statusTags = [
  "MNC Experience",
  "Fresher",
  "Salary Mismatch",
  "Incomplete Docs",
  "Suspected Forgery",
];

const CaseView = () => {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentStatuses, setDocumentStatuses] = useState({});
  const [flagReasons, setFlagReasons] = useState({});
  const [customFlagReason, setCustomFlagReason] = useState({});
  const [finalStatus, setFinalStatus] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [clarificationRequest, setClarificationRequest] = useState("");
  const [showClarificationForm, setShowClarificationForm] = useState(false);
  const [supportingEvidence, setSupportingEvidence] = useState({});

  const { user } = useContext(UserContext);

  useEffect(() => {
    const loadCaseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchVerificationCase(caseId);
        setCaseData(response);
        setNotes(response.notes || []);
        
        // Initialize document statuses from case data
        const initialStatuses = {};
        response.documents?.forEach(doc => {
          initialStatuses[doc.id] = doc.status;
        });
        setDocumentStatuses(initialStatuses);
        
      } catch (err) {
        console.error('Error loading case data:', err);
        setError(err.response?.data?.message || 'Failed to load case data');
      } finally {
        setLoading(false);
      }
    };

    if (caseId && user) {
      loadCaseData();
    }
  }, [caseId, user]);

  const updateDocumentStatus = async (docId, status) => {
    try {
      await updateCaseStatus(caseId, { documentId: docId, status });
      
      setDocumentStatuses((prev) => ({
        ...prev,
        [docId]: status,
      }));

      // Update activity log
      const newActivity = {
        id: Date.now(),
        action: `Document ${docId} marked as ${status}`,
        timestamp: new Date().toLocaleString(),
        verifier: `${user?.firstName} ${user?.lastName}`,
      };

      setCaseData((prev) => ({
        ...prev,
        activityLog: [newActivity, ...(prev.activityLog || [])],
      }));
    } catch (err) {
      console.error('Error updating document status:', err);
      setError(err.response?.data?.message || 'Failed to update document status');
    }
  };

  const addNote = async () => {
    if (newNote.trim()) {
      try {
        const noteData = {
          caseId,
          content: newNote,
          verifierId: user?.id
        };
        
        const response = await addCaseNote(noteData);
        const note = {
          id: response.id,
          content: newNote,
          timestamp: new Date().toLocaleString(),
          verifier: `${user?.firstName} ${user?.lastName}`,
        };
        
        setNotes((prev) => [note, ...prev]);
        setNewNote("");

        // Update activity log
        const newActivity = {
          id: Date.now(),
          action: "Note Added",
          timestamp: new Date().toLocaleString(),
          verifier: `${user?.firstName} ${user?.lastName}`,
        };

        setCaseData((prev) => ({
          ...prev,
          activityLog: [newActivity, ...(prev.activityLog || [])],
        }));
      } catch (err) {
        console.error('Error adding note:', err);
        setError(err.response?.data?.message || 'Failed to add note');
      }
    }
  };

  const submitClarificationRequest = async () => {
    if (clarificationRequest.trim()) {
      try {
        await requestClarification({
          caseId,
          message: clarificationRequest,
          verifierId: user?.id
        });
        
        alert(`Clarification request sent to ${caseData.employee.firstName} ${caseData.employee.lastName}`);

        // Update activity log
        const newActivity = {
          id: Date.now(),
          action: "Clarification Request Sent",
          timestamp: new Date().toLocaleString(),
          verifier: `${user?.firstName} ${user?.lastName}`,
        };

        setCaseData((prev) => ({
          ...prev,
          activityLog: [newActivity, ...(prev.activityLog || [])],
        }));
        
        setClarificationRequest("");
        setShowClarificationForm(false);
      } catch (err) {
        console.error('Error sending clarification request:', err);
        setError(err.response?.data?.message || 'Failed to send clarification request');
      }
    }
  };

  const handleFinalSubmission = () => {
    if (!finalStatus) {
      alert("Please select a final status before submitting");
      return;
    }

    // Mock OTP verification
    const otp = prompt("Enter OTP to confirm verification submission:");
    if (otp === "123456") {
      alert(`Case ${finalStatus.toLowerCase()} successfully!`);

      // Mock activity log update
      const newActivity = {
        id: Date.now(),
        action: `Case ${finalStatus}`,
        timestamp: new Date().toLocaleString(),
        verifier: `${user?.firstName} ${user?.lastName}`,
      };

      setCaseData((prev) => ({
        ...prev,
        activityLog: [newActivity, ...prev.activityLog],
      }));
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  const handleFileUpload = (docId, files) => {
    if (files.length > 0) {
      setSupportingEvidence((prev) => ({
        ...prev,
        [docId]: [
          ...(prev[docId] || []),
          ...Array.from(files).map((f) => f.name),
        ],
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "text-green-600 bg-green-50";
      case "flagged":
        return "text-yellow-600 bg-yellow-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4" />;
      case "flagged":
        return <AlertTriangle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Case Review</h1>
              <p className="text-gray-600">
                StaffProof ID: {caseData?.employee.id}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClarificationForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <MessageSquare className="w-4 h-4" />
                Request Clarification
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Employee Info & Documents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Employee Summary Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Employee Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {caseData?.employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {caseData?.employee.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          caseData?.employee.profileStatus === "Under Review"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {caseData?.employee.profileStatus}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {caseData?.employee.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {caseData?.employee.phone}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {caseData?.employee.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {caseData?.employee.appliedPosition}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {caseData?.employee.experience} Experience
                  </div>
                </div>
              </div>
            </div>

            {/* Job History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Job History (Read-only)
              </h2>
              <div className="space-y-4">
                {caseData?.jobHistory.map((job) => (
                  <div
                    key={job.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {job.position}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {job.duration}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">{job.company}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{job.location}</span>
                      <span className="font-medium">{job.salary}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Review Module */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Document Review
              </h2>
              <div className="space-y-4">
                {caseData?.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(documentStatuses[doc.id])}
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {doc.type}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {doc.filename}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDocument(doc)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            documentStatuses[doc.id]
                          )}`}
                        >
                          {documentStatuses[doc.id] || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={documentStatuses[doc.id] || ""}
                          onChange={(e) =>
                            updateDocumentStatus(doc.id, e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Status</option>
                          <option value="verified">Verified</option>
                          <option value="flagged">Flagged</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      {(documentStatuses[doc.id] === "flagged" ||
                        documentStatuses[doc.id] === "rejected") && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Flag Reason
                          </label>
                          <select
                            value={flagReasons[doc.id] || ""}
                            onChange={(e) =>
                              setFlagReasons((prev) => ({
                                ...prev,
                                [doc.id]: e.target.value,
                              }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Reason</option>
                            {flagReasons.map((reason) => (
                              <option key={reason} value={reason}>
                                {reason}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {flagReasons[doc.id] === "Other" && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Reason
                        </label>
                        <input
                          type="text"
                          value={customFlagReason[doc.id] || ""}
                          onChange={(e) =>
                            setCustomFlagReason((prev) => ({
                              ...prev,
                              [doc.id]: e.target.value,
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter custom reason..."
                        />
                      </div>
                    )}

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supporting Evidence
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          onChange={(e) =>
                            handleFileUpload(doc.id, e.target.files)
                          }
                          className="hidden"
                          id={`evidence-${doc.id}`}
                        />
                        <label
                          htmlFor={`evidence-${doc.id}`}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Evidence
                        </label>
                      </div>
                      {supportingEvidence[doc.id] && (
                        <div className="mt-2">
                          {supportingEvidence[doc.id].map((file, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs mr-2 mb-1"
                            >
                              {file}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Notes, Tags, Status */}
          <div className="space-y-6">
            {/* Final Status & Tags */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Final Status & Tags
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Status
                  </label>
                  <select
                    value={finalStatus}
                    onChange={(e) => setFinalStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Verified">✅ Verified</option>
                    <option value="Flagged">⚠ Flagged</option>
                    <option value="Rejected">❌ Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (Optional)
                  </label>
                  <div className="space-y-2">
                    {statusTags.map((tag) => (
                      <label key={tag} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags((prev) => [...prev, tag]);
                            } else {
                              setSelectedTags((prev) =>
                                prev.filter((t) => t !== tag)
                              );
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleFinalSubmission}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium"
                >
                  Submit Verification
                </button>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Internal Notes
              </h2>

              <div className="space-y-4">
                <div>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add internal notes (visible to Admin only)..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                  <button
                    onClick={addNote}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Note
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-800 mb-1">
                        {note.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        {note.timestamp} - {note.verifier}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Activity Log
              </h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {caseData?.activityLog.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-md"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.timestamp} - {activity.verifier}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Document Preview Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedDocument.type} - {selectedDocument.filename}
                </h3>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="bg-gray-100 p-8 rounded-lg text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  Document preview would be displayed here
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  In a real implementation, this would show the actual PDF/image
                  content
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Clarification Request Modal */}
        {showClarificationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Request Clarification
              </h3>
              <textarea
                value={clarificationRequest}
                onChange={(e) => setClarificationRequest(e.target.value)}
                placeholder="Enter your clarification request..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                rows="4"
              />
              <div className="flex gap-3">
                <button
                  onClick={submitClarificationRequest}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Send Request
                </button>
                <button
                  onClick={() => setShowClarificationForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseView;
