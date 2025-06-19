import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Upload,
  Flag,
  Send,
  Filter,
} from "lucide-react";

const Notes = () => {
  // Mock data - replace with actual API calls
  const [notes, setNotes] = useState([
    {
      id: 1,
      verifierId: "VER001",
      verifierName: "Sarah Johnson",
      message:
        "Experience letter from TechCorp appears authentic. Verified company letterhead and HR contact details.",
      timestamp: "2024-06-11T10:30:00Z",
      isPrivate: true,
      attachments: [],
    },
    {
      id: 2,
      verifierId: "VER001",
      verifierName: "Sarah Johnson",
      message: "Payslip amounts match declared salary. No discrepancies found.",
      timestamp: "2024-06-11T09:15:00Z",
      isPrivate: true,
      attachments: ["payslip_verification.png"],
    },
  ]);

  const [activities, setActivities] = useState([
    {
      id: 1,
      action: "document_viewed",
      actionText: "Viewed Experience Letter",
      verifierId: "VER001",
      verifierName: "Sarah Johnson",
      timestamp: "2024-06-11T11:45:00Z",
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: 2,
      action: "document_verified",
      actionText: "Verified Payslip Documents",
      verifierId: "VER001",
      verifierName: "Sarah Johnson",
      timestamp: "2024-06-11T11:30:00Z",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: 3,
      action: "document_flagged",
      actionText: "Flagged Educational Certificate",
      verifierId: "VER001",
      verifierName: "Sarah Johnson",
      timestamp: "2024-06-11T10:45:00Z",
      icon: Flag,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      details: "Reason: University seal unclear",
    },
    {
      id: 4,
      action: "evidence_uploaded",
      actionText: "Uploaded Supporting Evidence",
      verifierId: "VER001",
      verifierName: "Sarah Johnson",
      timestamp: "2024-06-11T09:20:00Z",
      icon: Upload,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: 5,
      action: "case_assigned",
      actionText: "Case Assigned to Verifier",
      verifierId: "ADMIN",
      verifierName: "System Admin",
      timestamp: "2024-06-11T08:00:00Z",
      icon: User,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ]);

  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [activityFilter, setActivityFilter] = useState("all");

  // Simulate current verifier
  const currentVerifier = {
    id: "VER001",
    name: "Sarah Johnson",
  };

  // Filter activities based on selected filter
  const filteredActivities = activities.filter((activity) => {
    if (activityFilter === "all") return true;
    return activity.action === activityFilter;
  });

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Handle note submission
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    const noteData = {
      id: Date.now(),
      verifierId: currentVerifier.id,
      verifierName: currentVerifier.name,
      message: newNote.trim(),
      timestamp: new Date().toISOString(),
      isPrivate: true,
      attachments: [],
    };

    // Add to notes
    setNotes((prev) => [noteData, ...prev]);

    // Add to activity log
    const activityData = {
      id: Date.now() + 1,
      action: "note_added",
      actionText: "Added Internal Note",
      verifierId: currentVerifier.id,
      verifierName: currentVerifier.name,
      timestamp: new Date().toISOString(),
      icon: MessageSquare,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    };

    setActivities((prev) => [activityData, ...prev]);
    setNewNote("");
    setIsSubmitting(false);

    // Here you would make actual API calls:
    // await addNote(noteData);
    // await logActivity(activityData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className=" border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("notes")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === "notes"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Internal Notes
            </button>
            {/* <button
              onClick={() => setActiveTab("activity")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === "activity"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Activity Log
            </button> */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-2">
        {activeTab === "notes" ? (
          <div className="space-y-6">
            {/* Add New Note Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label
                htmlFor="new-note"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Add Internal Comment
              </label>
              <textarea
                id="new-note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter your verification findings or notes (visible only to Admin)..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    handleNoteSubmit(e);
                  }
                }}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-500">
                  <span className="inline-flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Admin-only visibility • Ctrl+Enter to submit
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleNoteSubmit}
                  disabled={!newNote.trim() || isSubmitting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Add Note
                </button>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">
                Previous Notes ({notes.length})
              </h4>
              {notes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No internal notes yet</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {note.verifierName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(note.timestamp)}
                          </p>
                        </div>
                      </div>
                      {note.isPrivate && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Admin Only
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-700">{note.message}</p>
                      {note.attachments.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">
                            Attachments:
                          </p>
                          {note.attachments.map((attachment, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded mr-2"
                            >
                              📎 {attachment}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Activity Filter */}
            {/* <div className="flex items-center space-x-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Activities</option>
                <option value="document_viewed">Document Views</option>
                <option value="document_verified">Verifications</option>
                <option value="document_flagged">Flags</option>
                <option value="evidence_uploaded">Evidence Uploads</option>
                <option value="note_added">Notes Added</option>
              </select>
            </div> */}

            {/* Activity Timeline */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">
                Activity Timeline ({filteredActivities.length})
              </h4>
              {filteredActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No activities found</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  {filteredActivities.map((activity, index) => {
                    const IconComponent = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className="relative flex items-start space-x-4 pb-6"
                      >
                        {/* Timeline dot */}
                        <div
                          className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${activity.bgColor}`}
                        >
                          <IconComponent
                            className={`w-5 h-5 ${activity.color}`}
                          />
                        </div>

                        {/* Activity content */}
                        <div className="flex-1 min-w-0">
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.actionText}
                              </p>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(activity.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              by {activity.verifierName}
                            </p>
                            {activity.details && (
                              <p className="text-sm text-gray-700 mt-2">
                                {activity.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
