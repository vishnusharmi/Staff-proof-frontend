// import { useState } from "react";
// import {
//   Search,
//   Plus,
//   Upload,
//   FileText,
//   Calendar,
//   AlertTriangle,
//   X,
//   CheckCircle,
//   AlertCircle,
// } from "lucide-react";

// // Modal component (simplified version since react-modal isn't available)
// function Modal({ isOpen, onClose, children }) {
//   if (!isOpen) return null;
  
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-end mb-4">
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             <X size={24} />
//           </button>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// }

// // Separate component for the employee search section
// function EmployeeSearch({
//   searchQuery,
//   setSearchQuery,
//   handleSearch,
//   handleKeyPress,
// }) {
//   return (
//     <div className="mb-6">
//       <label
//         htmlFor="staffProofId"
//         className="block text-sm font-medium text-gray-700 mb-1"
//       >
//         StaffProof ID (autofill by search)
//       </label>
//       <div className="flex">
//         <div className="relative flex-grow">
//           <input
//             id="staffProofId"
//             type="text"
//             className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter StaffProof ID (e.g., SP-123456)"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             onKeyPress={handleKeyPress}
//             aria-label="StaffProof ID"
//           />
//           <div className="absolute left-3 top-2.5 text-gray-400">
//             <Search size={18} />
//           </div>
//         </div>
//         <button
//           className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none"
//           onClick={handleSearch}
//           aria-label="Search employee"
//         >
//           Search
//         </button>
//       </div>
//     </div>
//   );
// }

// // Employee card when found
// function EmployeeCard({ employee }) {
//   return (
//     <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//       <div className="flex justify-between items-center">
//         <div>
//           <h3 className="font-medium text-gray-800">{employee.name}</h3>
//           <p className="text-gray-600 text-sm">ID: {employee.staffProofId}</p>
//           <p className="text-gray-600 text-sm">
//             {employee.role} at {employee.currentCompany}
//           </p>
//         </div>
//         <div className="flex items-center text-red-600 font-medium">
//           <AlertTriangle size={18} className="mr-1" />
//           <span>About to blacklist</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// // File upload component
// function FileUploader({
//   fileUploaded,
//   fileName,
//   setFileUploaded,
//   setFileName,
// }) {
//   const handleFileUpload = (e) => {
//     if (e.target.files.length > 0) {
//       setFileUploaded(true);
//       setFileName(e.target.files[0].name);
//     }
//   };

//   return (
//     <div className="mb-6">
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         Upload Evidence (Optional – photos, documents)
//       </label>
//       <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
//         {fileUploaded ? (
//           <div className="flex items-center justify-center text-green-600">
//             <CheckCircle size={20} className="mr-2" />
//             <span>{fileName}</span>
//             <button
//               className="ml-2 text-gray-500 hover:text-gray-700"
//               onClick={() => {
//                 setFileUploaded(false);
//                 setFileName("");
//               }}
//               aria-label="Remove file"
//             >
//               <X size={16} />
//             </button>
//           </div>
//         ) : (
//           <label htmlFor="file-upload" className="cursor-pointer block">
//             <Upload className="mx-auto h-12 w-12 text-gray-400" />
//             <p className="mt-1 text-sm text-gray-500">
//               Click to upload or drag and drop
//             </p>
//             <p className="text-xs text-gray-500">PDF, JPG, PNG (MAX. 10MB)</p>
//             <input
//               id="file-upload"
//               type="file"
//               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//               onChange={handleFileUpload}
//               aria-label="Upload evidence"
//             />
//           </label>
//         )}
//       </div>
//     </div>
//   );
// }

// // Status message component
// function StatusMessage({ status }) {
//   if (!status) return null;

//   const messages = {
//     error: {
//       className: "bg-red-50 border border-red-200 text-red-700",
//       icon: <AlertCircle size={18} className="mr-2" />,
//       text: "Error: Employee must be found before submission.",
//     },
//     "missing-reason": {
//       className: "bg-red-50 border border-red-200 text-red-700",
//       icon: <AlertCircle size={18} className="mr-2" />,
//       text: "Error: Please provide a reason for blacklisting.",
//     },
//     success: {
//       className: "bg-green-50 border border-green-200 text-green-700",
//       icon: <CheckCircle size={18} className="mr-2" />,
//       text: "Success! Employee has been added to the blacklist.",
//     },
//   };

//   const { className, icon, text } = messages[status];

//   return (
//     <div className={`mb-4 p-3 rounded-lg flex items-center ${className}`}>
//       {icon}
//       <span>{text}</span>
//     </div>
//   );
// }

// // Search component for the blacklist table
// function BlacklistSearch({ searchTerm, setSearchTerm, onClear }) {
//   return (
//     <div className="mb-4">
//       <div className="flex items-center space-x-2">
//         <div className="relative flex-grow max-w-md">
//           <input
//             type="text"
//             placeholder="Search by StaffProof ID..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <div className="absolute left-3 top-2.5 text-gray-400">
//             <Search size={18} />
//           </div>
//         </div>
//         {searchTerm && (
//           <button
//             onClick={onClear}
//             className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg"
//           >
//             <X size={18} />
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// // Table to display blacklist records
// function BlacklistTable({ records, searchTerm, setSearchTerm }) {
//   // Filter records based on search term
//   const filteredRecords = records.filter((record) =>
//     record.staffProofId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleClearSearch = () => {
//     setSearchTerm("");
//   };

//   return (
//     <div className="mb-8">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-lg font-semibold text-gray-800">
//           Blacklist Records Table ({filteredRecords.length} records)
//         </h2>
//       </div>
      
//       <BlacklistSearch 
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         onClear={handleClearSearch}
//       />

//       {filteredRecords.length === 0 ? (
//         <div className="text-center py-8 text-gray-500">
//           {searchTerm ? "No records found matching your search." : "No blacklist records found."}
//         </div>
//       ) : (
//         <div className="overflow-x-auto border border-gray-200 rounded-lg">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-50">
//                 <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
//                   Employee Name
//                 </th>
//                 <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
//                   StaffProof ID
//                 </th>
//                 <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
//                   Blacklist Reason
//                 </th>
//                 <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
//                   Evidence
//                 </th>
//                 <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
//                   Date
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredRecords.map((record) => (
//                 <tr key={record.id} className="hover:bg-gray-50">
//                   <td className="px-4 py-3 border-b">{record.employeeName}</td>
//                   <td className="px-4 py-3 border-b font-mono text-sm">
//                     {record.staffProofId}
//                   </td>
//                   <td className="px-4 py-3 border-b">
//                     <div className="max-w-xs truncate" title={record.reason}>
//                       {record.reason}
//                     </div>
//                   </td>
//                   <td className="px-4 py-3 border-b">
//                     {record.evidence !== "None provided" ? (
//                       <div className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer">
//                         <FileText size={16} className="mr-1" />
//                         <span className="text-sm">{record.evidence}</span>
//                       </div>
//                     ) : (
//                       <span className="text-gray-500 text-sm">None</span>
//                     )}
//                   </td>
//                   <td className="px-4 py-3 border-b">
//                     <div className="flex items-center text-gray-600">
//                       <Calendar size={16} className="mr-1" />
//                       <span className="text-sm">{record.date}</span>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function BlacklistManagement() {
//   // State management
//   const [searchQuery, setSearchQuery] = useState("");
//   const [employeeFound, setEmployeeFound] = useState(null);
//   const [reason, setReason] = useState("");
//   const [fileUploaded, setFileUploaded] = useState(false);
//   const [fileName, setFileName] = useState("");
//   const [submissionStatus, setSubmissionStatus] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [tableSearchTerm, setTableSearchTerm] = useState("");
//   const [blacklistRecords, setBlacklistRecords] = useState([
//     {
//       id: 1,
//       employeeName: "Robert Miller",
//       staffProofId: "SP-234567",
//       reason:
//         "Violated company confidentiality policy by sharing internal documents",
//       evidence: "Confidentiality_Breach_Evidence.pdf",
//       date: "2025-03-15",
//     },
//     {
//       id: 2,
//       employeeName: "Emma Thompson",
//       staffProofId: "SP-876543",
//       reason: "Falsified qualification certificates during application process",
//       evidence: "Certificate_Forgery_Proof.jpg",
//       date: "2025-04-02",
//     },
//     {
//       id: 3,
//       employeeName: "David Wilson",
//       staffProofId: "SP-567890",
//       reason: "Repeated non-compliance with safety protocols",
//       evidence: "Safety_Violations_Report.pdf",
//       date: "2025-05-01",
//     },
//     {
//       id: 4,
//       employeeName: "Sarah Johnson",
//       staffProofId: "SP-345678",
//       reason: "Harassment and inappropriate behavior towards colleagues",
//       evidence: "HR_Complaint_Reports.pdf",
//       date: "2025-05-15",
//     },
//     {
//       id: 5,
//       employeeName: "Michael Brown",
//       staffProofId: "SP-789012",
//       reason: "Theft of company property and equipment",
//       evidence: "Security_Camera_Footage.mp4",
//       date: "2025-06-01",
//     },
//   ]);

//   // Mock employee data
//   const mockEmployee = {
//     name: "John Smith",
//     staffProofId: "SP-123456",
//     currentCompany: "Tech Solutions Inc.",
//     role: "Software Developer",
//   };

//   // Handlers
//   const handleSearch = () => {
//     if (searchQuery.toUpperCase().startsWith("SP-")) {
//       setEmployeeFound(mockEmployee);
//     } else {
//       setEmployeeFound(null);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       handleSearch();
//     }
//   };

//   const handleSubmit = () => {
//     // Validation
//     if (!employeeFound) {
//       setSubmissionStatus("error");
//       return;
//     }

//     if (!reason.trim()) {
//       setSubmissionStatus("missing-reason");
//       return;
//     }

//     // Add new blacklist record
//     const newRecord = {
//       id: blacklistRecords.length + 1,
//       employeeName: employeeFound.name,
//       staffProofId: employeeFound.staffProofId,
//       reason: reason,
//       evidence: fileUploaded ? fileName : "None provided",
//       date: new Date().toISOString().split("T")[0],
//     };

//     setBlacklistRecords([newRecord, ...blacklistRecords]);
//     setSubmissionStatus("success");

//     // Reset form after successful submission
//     setTimeout(() => {
//       setEmployeeFound(null);
//       setReason("");
//       setFileUploaded(false);
//       setFileName("");
//       setSearchQuery("");
//       setSubmissionStatus(null);
//       setModalOpen(false);
//     }, 2000);
//   };

//   const openModal = () => setModalOpen(true);
//   const closeModal = () => {
//     setModalOpen(false);
//     // Reset form when closing
//     setEmployeeFound(null);
//     setReason("");
//     setFileUploaded(false);
//     setFileName("");
//     setSearchQuery("");
//     setSubmissionStatus(null);
//   };

//   return (
//     <div className="max-w-5xl mx-auto bg-white p-6">
//       <div className="border-b border-gray-300 pb-4 mb-5">
//         <div className="flex items-center justify-between mb-4">
//           <h1 className="text-2xl font-bold text-gray-800">
//             Blacklist Management
//           </h1>
//           <button
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
//             aria-label="Add employee"
//             onClick={openModal}
//           >
//             <Plus size={18} className="mr-2" />
//             Add Employee
//           </button>
//         </div>

//         <div className="flex items-center ml-9 mb-2">
//           <CheckCircle size={18} className="text-green-600 mr-2" />
//           <p className="text-gray-700">Features:</p>
//         </div>

//         <ul className="ml-12 mb-4">
//           <li className="flex items-start mb-2">
//             <div className="min-w-4 h-4 mt-1 flex items-center justify-center mr-2">
//               <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
//             </div>
//             <p className="text-gray-700">
//               Ability to <span className="font-semibold">Blacklist</span> an
//               employee with reasons and evidence.
//             </p>
//           </li>
//           <li className="flex items-start mb-2">
//             <div className="min-w-4 h-4 mt-1 flex items-center justify-center mr-2">
//               <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
//             </div>
//             <p className="text-gray-700">
//               <span className="font-semibold">Search</span> blacklist records by StaffProof ID or employee name.
//             </p>
//           </li>
//         </ul>
//       </div>

//       <Modal isOpen={modalOpen} onClose={closeModal}>
//         <div className="bg-white">
//           <h2 className="text-lg font-semibold mb-4 text-gray-800">
//             Blacklist Form:
//           </h2>

//           <EmployeeSearch
//             searchQuery={searchQuery}
//             setSearchQuery={setSearchQuery}
//             handleSearch={handleSearch}
//             handleKeyPress={handleKeyPress}
//           />

//           {employeeFound && <EmployeeCard employee={employeeFound} />}

//           <div className="mb-6">
//             <label
//               htmlFor="blacklist-reason"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Reason for Blacklisting
//             </label>
//             <textarea
//               id="blacklist-reason"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
//               placeholder="Enter detailed reason for blacklisting this employee..."
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               aria-label="Reason for blacklisting"
//             ></textarea>
//           </div>
          
//           <FileUploader
//             fileUploaded={fileUploaded}
//             fileName={fileName}
//             setFileUploaded={setFileUploaded}
//             setFileName={setFileName}
//           />

//           <StatusMessage status={submissionStatus} />

//           <div className="flex justify-end space-x-3">
//             <button
//               className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
//               onClick={closeModal}
//             >
//               Cancel
//             </button>
//             <button
//               className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center"
//               onClick={handleSubmit}
//               aria-label="Submit blacklist"
//             >
//               <Plus size={18} className="mr-2" />
//               Submit Blacklist
//             </button>
//           </div>
//         </div>
//       </Modal>

//       <BlacklistTable 
//         records={blacklistRecords} 
//         searchTerm={tableSearchTerm}
//         setSearchTerm={setTableSearchTerm}
//       />
//     </div>
//   );
// }



import { useState } from "react";
import {
  Search,
  Plus,
  Upload,
  FileText,
  Calendar,
  AlertTriangle,
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Download,
} from "lucide-react";

// Mock Modal component since react-modal isn't available
const Modal = ({ isOpen, onRequestClose, children, contentLabel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onRequestClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <button
          onClick={onRequestClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

// Separate component for the employee search section
function EmployeeSearch({
  searchQuery,
  setSearchQuery,
  handleSearch,
  handleKeyPress,
}) {
  return (
    <div className="mb-6">
      <label
        htmlFor="staffProofId"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        StaffProof ID (autofill by search)
      </label>
      <div className="flex">
        <div className="relative flex-grow">
          <input
            id="staffProofId"
            type="text"
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter StaffProof ID (e.g., SP-123456)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            aria-label="StaffProof ID"
          />
          <div className="absolute left-4 top-3.5 text-gray-400">
            <Search size={20} />
          </div>
        </div>
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          onClick={handleSearch}
          aria-label="Search employee"
        >
          Search
        </button>
      </div>
    </div>
  );
}

// Employee card when found
function EmployeeCard({ employee }) {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">
            {employee.name}
          </h3>
          <p className="text-gray-600 text-sm font-medium">
            ID: {employee.staffProofId}
          </p>
          <p className="text-gray-600 text-sm">
            {employee.role} at {employee.currentCompany}
          </p>
        </div>
        <div className="flex items-center text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg">
          <AlertTriangle size={18} className="mr-2" />
          <span>About to blacklist</span>
        </div>
      </div>
    </div>
  );
}

// File upload component
function FileUploader({
  fileUploaded,
  fileName,
  setFileUploaded,
  setFileName,
}) {
  const handleFileUpload = (e) => {
    if (e.target.files.length > 0) {
      setFileUploaded(true);
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Evidence (Optional – photos, documents)
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative hover:border-blue-400 transition-colors">
        {fileUploaded ? (
          <div className="flex items-center justify-center text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle size={20} className="mr-2" />
            <span className="font-medium">{fileName}</span>
            <button
              className="ml-3 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1"
              onClick={() => {
                setFileUploaded(false);
                setFileName("");
              }}
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label htmlFor="file-upload" className="cursor-pointer block">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="mt-2 text-sm text-gray-600 font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, JPG, PNG (MAX. 10MB)
            </p>
            <input
              id="file-upload"
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              aria-label="Upload evidence"
            />
          </label>
        )}
      </div>
    </div>
  );
}

// Status message component
function StatusMessage({ status }) {
  if (!status) return null;

  const messages = {
    error: {
      className: "bg-red-50 border border-red-200 text-red-700",
      icon: <AlertCircle size={18} className="mr-2" />,
      text: "Error: Employee must be found before submission.",
    },
    "missing-reason": {
      className: "bg-red-50 border border-red-200 text-red-700",
      icon: <AlertCircle size={18} className="mr-2" />,
      text: "Error: Please provide a reason for blacklisting.",
    },
    success: {
      className: "bg-green-50 border border-green-200 text-green-700",
      icon: <CheckCircle size={18} className="mr-2" />,
      text: "Success! Employee has been added to the blacklist.",
    },
  };

  const { className, icon, text } = messages[status];

  return (
    <div className={`mb-4 p-3 rounded-lg flex items-center ${className}`}>
      {icon}
      <span className="font-medium">{text}</span>
    </div>
  );
}

// Enhanced table with pagination and search
function BlacklistTable({ records, searchTerm, setSearchTerm }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter records based on search term
  const filteredRecords = records.filter(
    (record) =>
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.staffProofId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredRecords.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useState(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with search */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Blacklist Records
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredRecords.length} employee
              {filteredRecords.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by name, ID, or reason..."
              className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blacklist Reason
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Evidence
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Added
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.length > 0 ? (
              currentData.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {record.employeeName}
                      </div>
                      <div className="text-sm text-gray-500 font-mono">
                        {record.staffProofId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={record.reason}>
                        {record.reason}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {record.evidence !== "None provided" ? (
                      <div className="flex items-center">
                        <div className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-50 px-2 py-1 rounded">
                          <FileText size={16} className="mr-1" />
                          <span className="text-sm font-medium">View File</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm italic">
                        No evidence
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      <span className="text-sm">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                        title="Download Report"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <Search size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No records found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredRecords.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredRecords.length)} of{" "}
              {filteredRecords.length} entries
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                  currentPage === 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400"
                } transition-colors`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageClick(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPage === pageNumber
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                  currentPage === totalPages
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400"
                } transition-colors`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlacklistManagement() {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeFound, setEmployeeFound] = useState(null);
  const [reason, setReason] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [blacklistRecords, setBlacklistRecords] = useState([
    {
      id: 1,
      employeeName: "Robert Miller",
      staffProofId: "SP-234567",
      reason:
        "Violated company confidentiality policy by sharing internal documents with competitors",
      evidence: "Confidentiality_Breach_Evidence.pdf",
      date: "2025-03-15",
    },
    {
      id: 2,
      employeeName: "Emma Thompson",
      staffProofId: "SP-876543",
      reason: "Falsified qualification certificates during application process",
      evidence: "Certificate_Forgery_Proof.jpg",
      date: "2025-04-02",
    },
    {
      id: 3,
      employeeName: "David Wilson",
      staffProofId: "SP-567890",
      reason:
        "Repeated non-compliance with safety protocols resulting in workplace incidents",
      evidence: "Safety_Violations_Report.pdf",
      date: "2025-05-01",
    },
    {
      id: 4,
      employeeName: "Sarah Johnson",
      staffProofId: "SP-345678",
      reason: "Harassment of colleagues and inappropriate workplace behavior",
      evidence: "HR_Complaint_Records.pdf",
      date: "2025-05-15",
    },
    {
      id: 5,
      employeeName: "Michael Brown",
      staffProofId: "SP-789012",
      reason: "Theft of company property and misuse of company resources",
      evidence: "Theft_Investigation_Report.pdf",
      date: "2025-05-20",
    },
    {
      id: 6,
      employeeName: "Lisa Davis",
      staffProofId: "SP-456789",
      reason:
        "Breach of contract terms and unauthorized disclosure of trade secrets",
      evidence: "Contract_Breach_Evidence.pdf",
      date: "2025-06-01",
    },
    {
      id: 7,
      employeeName: "James Wilson",
      staffProofId: "SP-654321",
      reason: "Fraudulent expense claims and financial misconduct",
      evidence: "Financial_Fraud_Documentation.pdf",
      date: "2025-06-10",
    },
    {
      id: 8,
      employeeName: "Amanda Rodriguez",
      staffProofId: "SP-987654",
      reason:
        "Violation of data privacy regulations and unauthorized access to sensitive information",
      evidence: "Data_Breach_Investigation.pdf",
      date: "2025-06-15",
    },
  ]);

  // Mock employee data
  const mockEmployee = {
    name: "John Smith",
    staffProofId: "SP-123456",
    currentCompany: "Tech Solutions Inc.",
    role: "Software Developer",
  };

  // Handlers
  const handleSearch = () => {
    if (searchQuery.toUpperCase().startsWith("SP-")) {
      setEmployeeFound(mockEmployee);
    } else {
      setEmployeeFound(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!employeeFound) {
      setSubmissionStatus("error");
      return;
    }

    if (!reason.trim()) {
      setSubmissionStatus("missing-reason");
      return;
    }

    // Add new blacklist record
    const newRecord = {
      id: blacklistRecords.length + 1,
      employeeName: employeeFound.name,
      staffProofId: employeeFound.staffProofId,
      reason: reason,
      evidence: fileUploaded ? fileName : "None provided",
      date: new Date().toISOString().split("T")[0],
    };

    setBlacklistRecords([newRecord, ...blacklistRecords]);
    setSubmissionStatus("success");

    // Reset form after successful submission
    setTimeout(() => {
      setEmployeeFound(null);
      setReason("");
      setFileUploaded(false);
      setFileName("");
      setSearchQuery("");
      setSubmissionStatus(null);
      setModalOpen(false);
    }, 2000);
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setSubmissionStatus(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Blacklist Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage employee blacklist records with detailed tracking
            </p>
          </div>
          <button
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg flex items-center shadow-md transition-all duration-200 transform hover:scale-105"
            aria-label="Add employee"
            onClick={openModal}
          >
            <Plus size={20} className="mr-2" />
            Add to Blacklist
          </button>
        </div>

        <div className="flex items-center bg-green-50 p-3 rounded-lg">
          <CheckCircle size={20} className="text-green-600 mr-3" />
          <div>
            <p className="text-green-800 font-medium">Features:</p>
            <p className="text-green-700 text-sm">
              Ability to <span className="font-semibold">blacklist</span>{" "}
              employees with detailed reasons and evidence documentation
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Employee Modal"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Add Employee to Blacklist
          </h2>

          <EmployeeSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            handleKeyPress={handleKeyPress}
          />

          {employeeFound && <EmployeeCard employee={employeeFound} />}

          <div className="mb-6">
            <label
              htmlFor="blacklist-reason"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Reason for Blacklisting *
            </label>
            <textarea
              id="blacklist-reason"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-32 resize-none"
              placeholder="Enter detailed reason for blacklisting this employee..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              aria-label="Reason for blacklisting"
            ></textarea>
          </div>

          <FileUploader
            fileUploaded={fileUploaded}
            fileName={fileName}
            setFileUploaded={setFileUploaded}
            setFileName={setFileName}
          />

          <StatusMessage status={submissionStatus} />

          <div className="flex justify-end space-x-3">
            <button
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
              onClick={handleSubmit}
              aria-label="Submit blacklist"
            >
              <AlertTriangle size={18} className="mr-2" />
              Submit Blacklist
            </button>
          </div>
        </div>
      </Modal>

      {/* Table */}
      <BlacklistTable
        records={blacklistRecords}
        searchTerm={tableSearchTerm}
        setSearchTerm={setTableSearchTerm}
      />
    </div>
  );
}