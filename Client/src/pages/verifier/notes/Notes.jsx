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
import { fetchVerifierNotes, addVerifierNote, fetchVerifierActivity } from "../../../components/api/api";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [activityFilter, setActivityFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load notes and activities from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [notesRes, activityRes] = await Promise.all([
          fetchVerifierNotes(),
          fetchVerifierActivity({ action: activityFilter !== 'all' ? activityFilter : undefined })
        ]);
        
        setNotes(notesRes.data || []);
        setActivities(activityRes.data?.activities || []);
      } catch (err) {
        console.error('Error loading notes and activities:', err);
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activityFilter]);

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
    try {
      const noteData = {
        message: newNote.trim(),
        type: 'internal',
        isPrivate: true,
        attachments: []
      };

      const response = await addVerifierNote(noteData);
      
      // Add new note to the beginning of the list
      setNotes((prev) => [response.data, ...prev]);
      setNewNote("");
      
      // Refresh activities to show the new note action
      const activityRes = await fetchVerifierActivity();
      setActivities(activityRes.data?.activities || []);
    } catch (err) {
      console.error('Error adding note:', err);
      setError(err.response?.data?.message || 'Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes and activities...</p>
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-gray-200 px-6 py-2">
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
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === "activity"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Activity Log
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "notes" && (
        <div className="p-6">
          {/* Add Note Form */}
          <div className="mb-6">
            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                  Add Internal Note
                </label>
                <textarea
                  id="note"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter your internal note..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNote.trim() || isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Adding..." : "Add Note"}
                </button>
              </div>
            </form>
          </div>

          {/* Notes List */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Recent Notes</h4>
            {notes.map((note) => (
              <div key={note.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {note.verifierName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(note.timestamp)}
                    </span>
                  </div>
                  {note.isPrivate && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Private
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{note.message}</p>
                {note.attachments && note.attachments.length > 0 && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Upload className="w-3 h-3" />
                    <span>{note.attachments.length} attachment(s)</span>
                  </div>
                )}
              </div>
            ))}
            {notes.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No notes found. Add your first internal note above.
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="p-6">
          {/* Activity Filter */}
          <div className="mb-6">
            <label htmlFor="activity-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter Activities
            </label>
            <select
              id="activity-filter"
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Activities</option>
              <option value="note_created">Notes Added</option>
              <option value="case_status_updated">Case Status Updated</option>
              <option value="document_viewed">Documents Viewed</option>
              <option value="document_verified">Documents Verified</option>
              <option value="document_flagged">Documents Flagged</option>
              <option value="clarification_sent">Clarifications Sent</option>
            </select>
          </div>

          {/* Activity List */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Activity Log</h4>
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.bgColor}`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.actionText}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    by {activity.verifierName}
                  </p>
                  {activity.details && (
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {filteredActivities.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No activities found for the selected filter.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
