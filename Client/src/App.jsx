// import React, { useState, useEffect } from "react";
// import {
//   Search,
//   FileText,
//   Clock,
//   CheckCircle,
//   AlertTriangle,
//   XCircle,
//   Filter,
//   Eye,
//   Upload,
//   MessageSquare,
// } from "lucide-react";

// // Mock backend data
// const mockData = {
//   verifier: {
//     name: "Sarah Johnson",
//     id: "VER_001",
//   },
//   stats: {
//     totalAssigned: 24,
//     casesVerified: 18,
//     casesFlagged: 4,
//     averageVerificationTime: "2.5 hours",
//   },
//   assignedCases: [
//     {
//       id: "SP_001234",
//       employeeName: "Rahul Sharma",
//       profileStatus: "In Progress",
//       assignedDate: "2025-06-08",
//       status: "new",
//       priority: "medium",
//       documents: {
//         resume: "submitted",
//         govtId: "submitted",
//         payslips: "submitted",
//         experienceLetters: "submitted",
//         educationalCerts: "pending",
//       },
//     },
//     {
//       id: "SP_001235",
//       employeeName: "Priya Patel",
//       profileStatus: "Completed",
//       assignedDate: "2025-06-07",
//       status: "verified",
//       priority: "low",
//       documents: {
//         resume: "verified",
//         govtId: "verified",
//         payslips: "verified",
//         experienceLetters: "verified",
//         educationalCerts: "verified",
//       },
//     },
//     {
//       id: "SP_001236",
//       employeeName: "Amit Kumar",
//       profileStatus: "Flagged",
//       assignedDate: "2025-06-09",
//       status: "flagged",
//       priority: "high",
//       documents: {
//         resume: "flagged",
//         govtId: "verified",
//         payslips: "flagged",
//         experienceLetters: "incomplete",
//         educationalCerts: "submitted",
//       },
//     },
//     {
//       id: "SP_001237",
//       employeeName: "Sneha Reddy",
//       profileStatus: "In Progress",
//       assignedDate: "2025-06-10",
//       status: "in_progress",
//       priority: "medium",
//       documents: {
//         resume: "submitted",
//         govtId: "verified",
//         payslips: "submitted",
//         experienceLetters: "submitted",
//         educationalCerts: "submitted",
//       },
//     },
//   ],
// };

// const StaffProofVerifierDashboard = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [assignedCases, setAssignedCases] = useState(mockData.assignedCases);
//   const [selectedCase, setSelectedCase] = useState(null);
//   const [showNotes, setShowNotes] = useState(false);

//   // Mock backend functions
//   const fetchAssignedCases = () => {
//     // Simulate API call
//     return mockData.assignedCases;
//   };

//   const updateCaseStatus = (caseId, newStatus) => {
//     setAssignedCases((prev) =>
//       prev.map((case_) =>
//         case_.id === caseId
//           ? {
//               ...case_,
//               status: newStatus,
//               profileStatus: getProfileStatusFromStatus(newStatus),
//             }
//           : case_
//       )
//     );
//   };

//   const getProfileStatusFromStatus = (status) => {
//     switch (status) {
//       case "verified":
//         return "Completed";
//       case "flagged":
//         return "Flagged";
//       case "rejected":
//         return "Rejected";
//       default:
//         return "In Progress";
//     }
//   };

//   const filteredCases = assignedCases.filter((case_) => {
//     const matchesSearch =
//       case_.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       case_.id.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus =
//       statusFilter === "all" || case_.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "verified":
//         return "text-green-600 bg-green-50";
//       case "flagged":
//         return "text-yellow-600 bg-yellow-50";
//       case "rejected":
//         return "text-red-600 bg-red-50";
//       case "in_progress":
//         return "text-blue-600 bg-blue-50";
//       default:
//         return "text-gray-600 bg-gray-50";
//     }
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case "high":
//         return "border-l-red-500";
//       case "medium":
//         return "border-l-yellow-500";
//       case "low":
//         return "border-l-green-500";
//       default:
//         return "border-l-gray-300";
//     }
//   };

//   const getDocumentStatusIcon = (status) => {
//     switch (status) {
//       case "verified":
//         return <CheckCircle className="h-4 w-4 text-green-500" />;
//       case "flagged":
//         return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
//       case "rejected":
//         return <XCircle className="h-4 w-4 text-red-500" />;
//       case "incomplete":
//         return <Clock className="h-4 w-4 text-gray-400" />;
//       default:
//         return <FileText className="h-4 w-4 text-blue-500" />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Welcome, {mockData.verifier.name}
//               </h1>
//               <p className="text-sm text-gray-500">
//                 Verifier ID: {mockData.verifier.id}
//               </p>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="text-sm text-gray-500">
//                 Session expires in:{" "}
//                 <span className="font-medium text-red-600">12:45</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Stats Section */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-lg shadow-sm border">
//             <div className="flex items-center">
//               <FileText className="h-8 w-8 text-blue-500" />
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-500">
//                   Total Assigned Cases
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {mockData.stats.totalAssigned}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-sm border">
//             <div className="flex items-center">
//               <CheckCircle className="h-8 w-8 text-green-500" />
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-500">
//                   Cases Verified
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {mockData.stats.casesVerified}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-sm border">
//             <div className="flex items-center">
//               <AlertTriangle className="h-8 w-8 text-yellow-500" />
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-500">
//                   Cases Flagged
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {mockData.stats.casesFlagged}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-sm border">
//             <div className="flex items-center">
//               <Clock className="h-8 w-8 text-purple-500" />
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-500">
//                   Avg. Verification Time
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {mockData.stats.averageVerificationTime}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filters and Search */}
//         <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="flex-1">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                 <input
//                   type="text"
//                   placeholder="Search by StaffProof ID or Employee Name"
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <select
//                 className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//               >
//                 <option value="all">All Status</option>
//                 <option value="new">New</option>
//                 <option value="in_progress">In Progress</option>
//                 <option value="verified">Verified</option>
//                 <option value="flagged">Flagged</option>
//                 <option value="rejected">Rejected</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Cases List */}
//         <div className="space-y-4">
//           {filteredCases.map((case_) => (
//             <div
//               key={case_.id}
//               className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(
//                 case_.priority
//               )}`}
//             >
//               <div className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center space-x-4">
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-900">
//                           {case_.employeeName}
//                         </h3>
//                         <p className="text-sm text-gray-500">
//                           StaffProof ID: {case_.id}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           Assigned: {case_.assignedDate}
//                         </p>
//                       </div>
//                       <div
//                         className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
//                           case_.status
//                         )}`}
//                       >
//                         {case_.profileStatus}
//                       </div>
//                     </div>

//                     {/* Document Status */}
//                     <div className="mt-4">
//                       <p className="text-sm font-medium text-gray-700 mb-2">
//                         Document Status:
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         {Object.entries(case_.documents).map(
//                           ([docType, status]) => (
//                             <div
//                               key={docType}
//                               className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded"
//                             >
//                               {getDocumentStatusIcon(status)}
//                               <span className="text-xs text-gray-600 capitalize">
//                                 {docType.replace(/([A-Z])/g, " $1").trim()}
//                               </span>
//                             </div>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-2">
//                     <button
//                       onClick={() => setSelectedCase(case_)}
//                       className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <Eye className="h-4 w-4 mr-1" />
//                       Open Case
//                     </button>
//                     <button
//                       onClick={() => setShowNotes(!showNotes)}
//                       className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <Upload className="h-4 w-4 mr-1" />
//                       Notes
//                     </button>

//                     {/* Quick Action Buttons */}
//                     <div className="flex space-x-1">
//                       <button
//                         onClick={() => updateCaseStatus(case_.id, "verified")}
//                         className="p-2 text-green-600 hover:bg-green-50 rounded-md"
//                         title="Mark as Verified"
//                       >
//                         <CheckCircle className="h-5 w-5" />
//                       </button>
//                       <button
//                         onClick={() => updateCaseStatus(case_.id, "flagged")}
//                         className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md"
//                         title="Flag Case"
//                       >
//                         <AlertTriangle className="h-5 w-5" />
//                       </button>
//                       <button
//                         onClick={() => updateCaseStatus(case_.id, "rejected")}
//                         className="p-2 text-red-600 hover:bg-red-50 rounded-md"
//                         title="Reject Case"
//                       >
//                         <XCircle className="h-5 w-5" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {filteredCases.length === 0 && (
//           <div className="text-center py-12">
//             <FileText className="mx-auto h-12 w-12 text-gray-400" />
//             <h3 className="mt-2 text-sm font-medium text-gray-900">
//               No cases found
//             </h3>
//             <p className="mt-1 text-sm text-gray-500">
//               Try adjusting your search criteria or filter settings.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Case Detail Modal */}
//       {selectedCase && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-xl font-bold text-gray-900">
//                   Case Details - {selectedCase.employeeName}
//                 </h2>
//                 <button
//                   onClick={() => setSelectedCase(null)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <XCircle className="h-6 w-6" />
//                 </button>
//               </div>
//             </div>
//             <div className="p-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-lg font-medium text-gray-900 mb-4">
//                     Employee Information
//                   </h3>
//                   <div className="space-y-2">
//                     <p>
//                       <span className="font-semibold">Name:</span>{" "}
//                       {selectedCase.employeeName}
//                     </p>
//                     <p>
//                       <span className="font-semibold">StaffProof ID:</span>{" "}
//                       {selectedCase.id}
//                     </p>
//                     <p>
//                       <span className="font-semibold">Status:</span>{" "}
//                       {selectedCase.profileStatus}
//                     </p>
//                     <p>
//                       <span className="font-semibold">Assigned Date:</span>{" "}
//                       {selectedCase.assignedDate}
//                     </p>
//                     <p>
//                       <span className="font-semibold">Priority:</span>
//                       <span
//                         className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
//                           selectedCase.priority === "high"
//                             ? "bg-red-100 text-red-800"
//                             : selectedCase.priority === "medium"
//                             ? "bg-yellow-100 text-yellow-800"
//                             : "bg-green-100 text-green-800"
//                         }`}
//                       >
//                         {selectedCase.priority.toUpperCase()}
//                       </span>
//                     </p>
//                   </div>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-medium text-gray-900 mb-4">
//                     Document Status
//                   </h3>
//                   <div className="space-y-2">
//                     {Object.entries(selectedCase.documents).map(
//                       ([docType, status]) => (
//                         <div
//                           key={docType}
//                           className="flex justify-between items-center"
//                         >
//                           <span className="capitalize">
//                             {docType.replace(/([A-Z])/g, " $1").trim()}:
//                           </span>
//                           <div className="flex items-center space-x-1">
//                             {getDocumentStatusIcon(status)}
//                             <span className="text-sm capitalize">{status}</span>
//                           </div>
//                         </div>
//                       )
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6 flex justify-end space-x-3">
//                 <button
//                   onClick={() => {
//                     // Handle clarification request
//                     alert("Clarification request sent to employee");
//                   }}
//                   className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//                 >
//                   <MessageSquare className="h-4 w-4 mr-2" />
//                   Request Clarification
//                 </button>
//                 <button
//                   onClick={() => updateCaseStatus(selectedCase.id, "verified")}
//                   className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
//                 >
//                   Mark as Verified
//                 </button>
//                 <button
//                   onClick={() => updateCaseStatus(selectedCase.id, "flagged")}
//                   className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
//                 >
//                   Flag Case
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Notes Modal */}
//       {showNotes && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-2xl w-full">
//             <div className="p-6 border-b">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-xl font-bold text-gray-900">
//                   Verification Notes
//                 </h2>
//                 <button
//                   onClick={() => setShowNotes(false)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <XCircle className="h-6 w-6" />
//                 </button>
//               </div>
//             </div>
//             <div className="p-6">
//               <textarea
//                 className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Add your verification notes here..."
//               />
//               <div className="mt-4 flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowNotes(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => {
//                     alert("Notes saved successfully");
//                     setShowNotes(false);
//                   }}
//                   className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
//                 >
//                   Save Notes
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StaffProofVerifierDashboard;





// import React, { useState, useEffect } from "react";
// import {
//   FileText,
//   Upload,
//   Eye,
//   Flag,
//   CheckCircle,
//   XCircle,
//   AlertTriangle,
//   MessageSquare,
//   Calendar,
//   Building,
//   MapPin,
//   Mail,
//   Phone,
//   Download,
// } from "lucide-react";

// // Mock backend data
// const mockCaseData = {
//   employee: {
//     id: "SP001234",
//     name: "Rajesh Kumar",
//     email: "rajesh.kumar@email.com",
//     phone: "+91 9876543210",
//     profileStatus: "Under Review",
//     location: "Hyderabad, Telangana",
//     appliedPosition: "Software Engineer",
//     experience: "3 Years",
//   },
//   jobHistory: [
//     {
//       id: 1,
//       company: "Tech Solutions Pvt Ltd",
//       position: "Software Developer",
//       duration: "Jan 2022 - Present",
//       salary: "₹8,50,000",
//       location: "Hyderabad",
//     },
//     {
//       id: 2,
//       company: "InnovateX Technologies",
//       position: "Junior Developer",
//       duration: "Jun 2020 - Dec 2021",
//       salary: "₹4,50,000",
//       location: "Bangalore",
//     },
//   ],
//   documents: [
//     {
//       id: 1,
//       type: "Resume",
//       filename: "Rajesh_Kumar_Resume.pdf",
//       uploadDate: "2024-06-08",
//       status: "pending",
//       url: "#",
//     },
//     {
//       id: 2,
//       type: "Aadhaar Card",
//       filename: "Aadhaar_Copy.pdf",
//       uploadDate: "2024-06-08",
//       status: "pending",
//       url: "#",
//     },
//     {
//       id: 3,
//       type: "PAN Card",
//       filename: "PAN_Copy.pdf",
//       uploadDate: "2024-06-08",
//       status: "pending",
//       url: "#",
//     },
//     {
//       id: 4,
//       type: "Current Payslip",
//       filename: "May_2024_Payslip.pdf",
//       uploadDate: "2024-06-08",
//       status: "pending",
//       url: "#",
//     },
//     {
//       id: 5,
//       type: "Experience Letter",
//       filename: "InnovateX_Experience.pdf",
//       uploadDate: "2024-06-08",
//       status: "pending",
//       url: "#",
//     },
//     {
//       id: 6,
//       type: "Educational Certificate",
//       filename: "BTech_Certificate.pdf",
//       uploadDate: "2024-06-08",
//       status: "pending",
//       url: "#",
//     },
//   ],
//   notes: [],
//   activityLog: [
//     {
//       id: 1,
//       action: "Case Assigned",
//       timestamp: "2024-06-08 10:30 AM",
//       verifier: "System",
//     },
//     {
//       id: 2,
//       action: "Case Opened",
//       timestamp: "2024-06-08 11:15 AM",
//       verifier: "Priya Sharma",
//     },
//   ],
// };

// const flagReasons = [
//   "Document Quality Poor",
//   "Information Mismatch",
//   "Suspected Forgery",
//   "Incomplete Information",
//   "Salary Discrepancy",
//   "Employment Gap",
//   "Other",
// ];

// const statusTags = [
//   "MNC Experience",
//   "Fresher",
//   "Salary Mismatch",
//   "Incomplete Docs",
//   "Suspected Forgery",
// ];

// const AssignedCaseView = () => {
//   const [caseData, setCaseData] = useState(mockCaseData);
//   const [selectedDocument, setSelectedDocument] = useState(null);
//   const [documentStatuses, setDocumentStatuses] = useState({});
//   const [flagReasons, setFlagReasons] = useState({});
//   const [customFlagReason, setCustomFlagReason] = useState({});
//   const [finalStatus, setFinalStatus] = useState("");
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [notes, setNotes] = useState([]);
//   const [newNote, setNewNote] = useState("");
//   const [clarificationRequest, setClarificationRequest] = useState("");
//   const [showClarificationForm, setShowClarificationForm] = useState(false);
//   const [supportingEvidence, setSupportingEvidence] = useState({});

//   // Mock backend functions
//   const updateDocumentStatus = (docId, status) => {
//     setDocumentStatuses((prev) => ({
//       ...prev,
//       [docId]: status,
//     }));

//     // Mock activity log update
//     const newActivity = {
//       id: Date.now(),
//       action: `Document ${docId} marked as ${status}`,
//       timestamp: new Date().toLocaleString(),
//       verifier: "Priya Sharma",
//     };

//     setCaseData((prev) => ({
//       ...prev,
//       activityLog: [newActivity, ...prev.activityLog],
//     }));
//   };

//   const addNote = () => {
//     if (newNote.trim()) {
//       const note = {
//         id: Date.now(),
//         content: newNote,
//         timestamp: new Date().toLocaleString(),
//         verifier: "Priya Sharma",
//       };
//       setNotes((prev) => [note, ...prev]);
//       setNewNote("");

//       // Mock activity log update
//       const newActivity = {
//         id: Date.now(),
//         action: "Note Added",
//         timestamp: new Date().toLocaleString(),
//         verifier: "Priya Sharma",
//       };

//       setCaseData((prev) => ({
//         ...prev,
//         activityLog: [newActivity, ...prev.activityLog],
//       }));
//     }
//   };

//   const submitClarificationRequest = () => {
//     if (clarificationRequest.trim()) {
//       alert(`Clarification request sent to ${caseData.employee.name}`);

//       // Mock activity log update
//       const newActivity = {
//         id: Date.now(),
//         action: "Clarification Request Sent",
//         timestamp: new Date().toLocaleString(),
//         verifier: "Priya Sharma",
//       };

//       setCaseData((prev) => ({
//         ...prev,
//         activityLog: [newActivity, ...prev.activityLog],
//       }));

//       setClarificationRequest("");
//       setShowClarificationForm(false);
//     }
//   };

//   const handleFinalSubmission = () => {
//     if (!finalStatus) {
//       alert("Please select a final status before submitting");
//       return;
//     }

//     // Mock OTP verification
//     const otp = prompt("Enter OTP to confirm verification submission:");
//     if (otp === "123456") {
//       alert(`Case ${finalStatus.toLowerCase()} successfully!`);

//       // Mock activity log update
//       const newActivity = {
//         id: Date.now(),
//         action: `Case ${finalStatus}`,
//         timestamp: new Date().toLocaleString(),
//         verifier: "Priya Sharma",
//       };

//       setCaseData((prev) => ({
//         ...prev,
//         activityLog: [newActivity, ...prev.activityLog],
//       }));
//     } else {
//       alert("Invalid OTP. Please try again.");
//     }
//   };

//   const handleFileUpload = (docId, files) => {
//     if (files.length > 0) {
//       setSupportingEvidence((prev) => ({
//         ...prev,
//         [docId]: [
//           ...(prev[docId] || []),
//           ...Array.from(files).map((f) => f.name),
//         ],
//       }));
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "verified":
//         return "text-green-600 bg-green-50";
//       case "flagged":
//         return "text-yellow-600 bg-yellow-50";
//       case "rejected":
//         return "text-red-600 bg-red-50";
//       default:
//         return "text-gray-600 bg-gray-50";
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "verified":
//         return <CheckCircle className="w-4 h-4" />;
//       case "flagged":
//         return <AlertTriangle className="w-4 h-4" />;
//       case "rejected":
//         return <XCircle className="w-4 h-4" />;
//       default:
//         return <FileText className="w-4 h-4" />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Case Review</h1>
//               <p className="text-gray-600">
//                 StaffProof ID: {caseData.employee.id}
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowClarificationForm(true)}
//                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//               >
//                 <MessageSquare className="w-4 h-4" />
//                 Request Clarification
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Employee Info & Documents */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Employee Summary Card */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Employee Summary
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-3">
//                   <div className="flex items-center gap-2">
//                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                       <span className="text-blue-600 font-semibold">
//                         {caseData.employee.name
//                           .split(" ")
//                           .map((n) => n[0])
//                           .join("")}
//                       </span>
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-gray-900">
//                         {caseData.employee.name}
//                       </h3>
//                       <span
//                         className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                           caseData.employee.profileStatus === "Under Review"
//                             ? "bg-yellow-100 text-yellow-800"
//                             : "bg-gray-100 text-gray-800"
//                         }`}
//                       >
//                         {caseData.employee.profileStatus}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="space-y-2 text-sm text-gray-600">
//                     <div className="flex items-center gap-2">
//                       <Mail className="w-4 h-4" />
//                       {caseData.employee.email}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Phone className="w-4 h-4" />
//                       {caseData.employee.phone}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="space-y-2 text-sm text-gray-600">
//                   <div className="flex items-center gap-2">
//                     <MapPin className="w-4 h-4" />
//                     {caseData.employee.location}
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Building className="w-4 h-4" />
//                     {caseData.employee.appliedPosition}
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Calendar className="w-4 h-4" />
//                     {caseData.employee.experience} Experience
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Job History */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Job History (Read-only)
//               </h2>
//               <div className="space-y-4">
//                 {caseData.jobHistory.map((job) => (
//                   <div
//                     key={job.id}
//                     className="border border-gray-200 rounded-lg p-4"
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <h3 className="font-medium text-gray-900">
//                         {job.position}
//                       </h3>
//                       <span className="text-sm text-gray-500">
//                         {job.duration}
//                       </span>
//                     </div>
//                     <p className="text-gray-600 mb-1">{job.company}</p>
//                     <div className="flex items-center justify-between text-sm text-gray-500">
//                       <span>{job.location}</span>
//                       <span className="font-medium">{job.salary}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Document Review Module */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Document Review
//               </h2>
//               <div className="space-y-4">
//                 {caseData.documents.map((doc) => (
//                   <div
//                     key={doc.id}
//                     className="border border-gray-200 rounded-lg p-4"
//                   >
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center gap-3">
//                         {getStatusIcon(documentStatuses[doc.id])}
//                         <div>
//                           <h3 className="font-medium text-gray-900">
//                             {doc.type}
//                           </h3>
//                           <p className="text-sm text-gray-500">
//                             {doc.filename}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => setSelectedDocument(doc)}
//                           className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
//                         >
//                           <Eye className="w-4 h-4" />
//                           Preview
//                         </button>
//                         <span
//                           className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                             documentStatuses[doc.id]
//                           )}`}
//                         >
//                           {documentStatuses[doc.id] || "Pending"}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Status
//                         </label>
//                         <select
//                           value={documentStatuses[doc.id] || ""}
//                           onChange={(e) =>
//                             updateDocumentStatus(doc.id, e.target.value)
//                           }
//                           className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         >
//                           <option value="">Select Status</option>
//                           <option value="verified">Verified</option>
//                           <option value="flagged">Flagged</option>
//                           <option value="rejected">Rejected</option>
//                         </select>
//                       </div>

//                       {(documentStatuses[doc.id] === "flagged" ||
//                         documentStatuses[doc.id] === "rejected") && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">
//                             Flag Reason
//                           </label>
//                           <select
//                             value={flagReasons[doc.id] || ""}
//                             onChange={(e) =>
//                               setFlagReasons((prev) => ({
//                                 ...prev,
//                                 [doc.id]: e.target.value,
//                               }))
//                             }
//                             className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           >
//                             <option value="">Select Reason</option>
//                             {flagReasons.map((reason) => (
//                               <option key={reason} value={reason}>
//                                 {reason}
//                               </option>
//                             ))}
//                           </select>
//                         </div>
//                       )}
//                     </div>

//                     {flagReasons[doc.id] === "Other" && (
//                       <div className="mt-3">
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Custom Reason
//                         </label>
//                         <input
//                           type="text"
//                           value={customFlagReason[doc.id] || ""}
//                           onChange={(e) =>
//                             setCustomFlagReason((prev) => ({
//                               ...prev,
//                               [doc.id]: e.target.value,
//                             }))
//                           }
//                           className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="Enter custom reason..."
//                         />
//                       </div>
//                     )}

//                     <div className="mt-3">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Supporting Evidence
//                       </label>
//                       <div className="flex items-center gap-2">
//                         <input
//                           type="file"
//                           multiple
//                           accept="image/*,.pdf"
//                           onChange={(e) =>
//                             handleFileUpload(doc.id, e.target.files)
//                           }
//                           className="hidden"
//                           id={`evidence-${doc.id}`}
//                         />
//                         <label
//                           htmlFor={`evidence-${doc.id}`}
//                           className="flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 cursor-pointer"
//                         >
//                           <Upload className="w-4 h-4" />
//                           Upload Evidence
//                         </label>
//                       </div>
//                       {supportingEvidence[doc.id] && (
//                         <div className="mt-2">
//                           {supportingEvidence[doc.id].map((file, idx) => (
//                             <span
//                               key={idx}
//                               className="inline-block bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs mr-2 mb-1"
//                             >
//                               {file}
//                             </span>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Notes, Tags, Status */}
//           <div className="space-y-6">
//             {/* Final Status & Tags */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Final Status & Tags
//               </h2>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Final Status
//                   </label>
//                   <select
//                     value={finalStatus}
//                     onChange={(e) => setFinalStatus(e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     <option value="">Select Status</option>
//                     <option value="Verified">✅ Verified</option>
//                     <option value="Flagged">⚠ Flagged</option>
//                     <option value="Rejected">❌ Rejected</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Tags (Optional)
//                   </label>
//                   <div className="space-y-2">
//                     {statusTags.map((tag) => (
//                       <label key={tag} className="flex items-center">
//                         <input
//                           type="checkbox"
//                           checked={selectedTags.includes(tag)}
//                           onChange={(e) => {
//                             if (e.target.checked) {
//                               setSelectedTags((prev) => [...prev, tag]);
//                             } else {
//                               setSelectedTags((prev) =>
//                                 prev.filter((t) => t !== tag)
//                               );
//                             }
//                           }}
//                           className="mr-2"
//                         />
//                         <span className="text-sm text-gray-700">{tag}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 <button
//                   onClick={handleFinalSubmission}
//                   className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium"
//                 >
//                   Submit Verification
//                 </button>
//               </div>
//             </div>

//             {/* Notes Section */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Internal Notes
//               </h2>

//               <div className="space-y-4">
//                 <div>
//                   <textarea
//                     value={newNote}
//                     onChange={(e) => setNewNote(e.target.value)}
//                     placeholder="Add internal notes (visible to Admin only)..."
//                     className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     rows="3"
//                   />
//                   <button
//                     onClick={addNote}
//                     className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
//                   >
//                     Add Note
//                   </button>
//                 </div>

//                 <div className="space-y-3 max-h-60 overflow-y-auto">
//                   {notes.map((note) => (
//                     <div key={note.id} className="bg-gray-50 p-3 rounded-md">
//                       <p className="text-sm text-gray-800 mb-1">
//                         {note.content}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {note.timestamp} - {note.verifier}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Activity Log */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Activity Log
//               </h2>
//               <div className="space-y-3 max-h-60 overflow-y-auto">
//                 {caseData.activityLog.map((activity) => (
//                   <div
//                     key={activity.id}
//                     className="flex items-center gap-3 p-2 bg-gray-50 rounded-md"
//                   >
//                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-gray-900">
//                         {activity.action}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {activity.timestamp} - {activity.verifier}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Document Preview Modal */}
//         {selectedDocument && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold">
//                   {selectedDocument.type} - {selectedDocument.filename}
//                 </h3>
//                 <button
//                   onClick={() => setSelectedDocument(null)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <XCircle className="w-6 h-6" />
//                 </button>
//               </div>
//               <div className="bg-gray-100 p-8 rounded-lg text-center">
//                 <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//                 <p className="text-gray-600">
//                   Document preview would be displayed here
//                 </p>
//                 <p className="text-sm text-gray-500 mt-2">
//                   In a real implementation, this would show the actual PDF/image
//                   content
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Clarification Request Modal */}
//         {showClarificationForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//               <h3 className="text-lg font-semibold mb-4">
//                 Request Clarification
//               </h3>
//               <textarea
//                 value={clarificationRequest}
//                 onChange={(e) => setClarificationRequest(e.target.value)}
//                 placeholder="Enter your clarification request..."
//                 className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
//                 rows="4"
//               />
//               <div className="flex gap-3">
//                 <button
//                   onClick={submitClarificationRequest}
//                   className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
//                 >
//                   Send Request
//                 </button>
//                 <button
//                   onClick={() => setShowClarificationForm(false)}
//                   className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AssignedCaseView;




// App.jsx or main entry file
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AllRoutes from "../src/components/ṛoutes/AllRoutes"; // adjust path if needed
import { UserProvider } from "./components/context/UseContext";

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AllRoutes />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
