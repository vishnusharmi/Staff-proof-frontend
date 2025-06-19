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
} from "lucide-react";
import Modal from 'react-modal'

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
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        StaffProof ID (autofill by search)
      </label>
      <div className="flex">
        <div className="relative flex-grow">
          <input
            id="staffProofId"
            type="text"
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter StaffProof ID (e.g., SP-123456)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            aria-label="StaffProof ID"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <Search size={18} />
          </div>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none"
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
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-800">{employee.name}</h3>
          <p className="text-gray-600 text-sm">ID: {employee.staffProofId}</p>
          <p className="text-gray-600 text-sm">
            {employee.role} at {employee.currentCompany}
          </p>
        </div>
        <div className="flex items-center text-red-600 font-medium">
          <AlertTriangle size={18} className="mr-1" />
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
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Upload Evidence (Optional – photos, documents)
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
        {fileUploaded ? (
          <div className="flex items-center justify-center text-green-600">
            <CheckCircle size={20} className="mr-2" />
            <span>{fileName}</span>
            <button
              className="ml-2 text-gray-500 hover:text-gray-700"
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
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-1 text-sm text-gray-500">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF, JPG, PNG (MAX. 10MB)</p>
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
      <span>{text}</span>
    </div>
  );
}

// Table to display blacklist records
function BlacklistTable({ records }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Blacklist Records Table:
      </h2>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Employee Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                StaffProof ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Blacklist Reason
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Evidence
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 border-b">{record.employeeName}</td>
                <td className="px-4 py-3 border-b font-mono text-sm">
                  {record.staffProofId}
                </td>
                <td className="px-4 py-3 border-b">
                  <div className="max-w-xs truncate" title={record.reason}>
                    {record.reason}
                  </div>
                </td>
                <td className="px-4 py-3 border-b">
                  {record.evidence !== "None provided" ? (
                    <div className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer">
                      <FileText size={16} className="mr-1" />
                      <span className="text-sm">{record.evidence}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">None</span>
                  )}
                </td>
                <td className="px-4 py-3 border-b">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-1" />
                    <span className="text-sm">{record.date}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  const [blacklistRecords, setBlacklistRecords] = useState([
    {
      id: 1,
      employeeName: "Robert Miller",
      staffProofId: "SP-234567",
      reason:
        "Violated company confidentiality policy by sharing internal documents",
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
      reason: "Repeated non-compliance with safety protocols",
      evidence: "Safety_Violations_Report.pdf",
      date: "2025-05-01",
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
    }, 3000);
  };

  const modelFunction =()=>setModalOpen(true)
  const closeModal= ()=>setModalOpen(false)
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "800px",
      maxWidth: "100%",
      height: "700px", 
      maxHeight: "95vh",
    },
  };

  return (
    <div className="max-w-5xl mx-auto bg-white">
      {/* <div className="border-b border-gray-300 pb-4 mb-6">
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Blacklist Management
          </h1>
        </div>

        <div className="flex items-center ml-9 mb-2">
          <CheckCircle size={18} className="text-green-600 mr-2" />
          <p className="text-gray-700">Features:</p>
        </div>

        <ul className="ml-12 mb-4">
          <li className="flex items-start mb-2">
            <div className="min-w-4 h-4 mt-1 flex items-center justify-center mr-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            </div>
            <p className="text-gray-700">
              Ability to <span className="font-semibold">Blacklist</span> an
              employee with reasons and evidence.
            </p>
          </li>
        </ul>
      </div> */}
      <div className="border-b border-gray-300 pb-4 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Blacklist Management
          </h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center mt-6"
            aria-label="Add employee"
            onClick={modelFunction}
          >
            <span className="mr-2">+</span>
            Add Employee
          </button>
        </div>

        <div className="flex items-center ml-9 mb-2">
          <CheckCircle size={18} className="text-green-600 mr-2" />
          <p className="text-gray-700">Features:</p>
        </div>

        <ul className="ml-12 mb-4">
          <li className="flex items-start mb-2">
            <div className="min-w-4 h-4 mt-1 flex items-center justify-center mr-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            </div>
            <p className="text-gray-700">
              Ability to <span className="font-semibold">Blacklist</span> an
              employee with reasons and evidence.
            </p>
          </li>
        </ul>
      </div>

      {/* {modelOpen ? ( */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Add Employee Modal"
      >
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Blacklist Form:
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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reason for Blacklisting
            </label>
            <textarea
              id="blacklist-reason"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
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

          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center"
            onClick={handleSubmit}
            aria-label="Submit blacklist"
          >
            <Plus size={18} className="mr-2" />
            Submit Blacklist
          </button>
        </div>
      </Modal>
      {/* ) : (
        ""
      )} */}

      <BlacklistTable records={blacklistRecords} />
    </div>
  );
}
