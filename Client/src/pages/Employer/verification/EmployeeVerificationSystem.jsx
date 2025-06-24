import React, { useState } from "react";
import {
  Search,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const EmployeeVerificationSystem = () => {
  const [activeTab, setActiveTab] = useState("verified");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data for verified employees
  const verifiedEmployees = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Senior Developer",
      department: "Engineering",
      email: "sarah.johnson@company.com",
      phone: "+1 (555) 123-4567",
      joinDate: "2022-03-15",
      location: "New York, NY",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      verificationDate: "2024-01-15",
      skills: ["React", "Node.js", "Python"],
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "Product Manager",
      department: "Product",
      email: "michael.chen@company.com",
      phone: "+1 (555) 234-5678",
      joinDate: "2021-11-20",
      location: "San Francisco, CA",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      verificationDate: "2024-01-10",
      skills: ["Strategy", "Analytics", "Leadership"],
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "UX Designer",
      department: "Design",
      email: "emily.rodriguez@company.com",
      phone: "+1 (555) 345-6789",
      joinDate: "2023-01-08",
      location: "Austin, TX",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      verificationDate: "2024-01-20",
      skills: ["Figma", "Prototyping", "User Research"],
    },
  ];

  // Sample data for unverified employees
  const unverifiedEmployees = [
    {
      id: 4,
      name: "David Wilson",
      position: "Junior Developer",
      department: "Engineering",
      email: "david.wilson@company.com",
      phone: "+1 (555) 456-7890",
      joinDate: "2024-06-01",
      location: "Chicago, IL",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      submissionDate: "2024-06-15",
      status: "pending",
      missingDocs: ["ID Verification", "Address Proof"],
    },
    {
      id: 5,
      name: "Lisa Thompson",
      position: "Marketing Specialist",
      department: "Marketing",
      email: "lisa.thompson@company.com",
      phone: "+1 (555) 567-8901",
      joinDate: "2024-05-20",
      location: "Miami, FL",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      submissionDate: "2024-06-10",
      status: "review",
      missingDocs: ["Educational Certificates"],
    },
    {
      id: 6,
      name: "James Park",
      position: "Data Analyst",
      department: "Analytics",
      email: "james.park@company.com",
      phone: "+1 (555) 678-9012",
      joinDate: "2024-06-05",
      location: "Seattle, WA",
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
      submissionDate: "2024-06-18",
      status: "incomplete",
      missingDocs: ["Background Check", "Reference Letters"],
    },
  ];

  const currentEmployees =
    activeTab === "verified" ? verifiedEmployees : unverifiedEmployees;

  const filteredEmployees = currentEmployees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "incomplete":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "review":
        return <AlertCircle className="w-4 h-4" />;
      case "incomplete":
        return <XCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Employee Verification
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage employee verification status and documentation
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {verifiedEmployees.length} Verified
                    </span>
                  </div>
                </div>
                <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      {unverifiedEmployees.length} Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border">
            <button
              onClick={() => setActiveTab("verified")}
              className={`flex-1 flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "verified"
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Verified Employees ({verifiedEmployees.length})
            </button>
            <button
              onClick={() => setActiveTab("unverified")}
              className={`flex-1 flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "unverified"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Shield className="w-4 h-4 mr-2" />
              Unverified Employees ({unverifiedEmployees.length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees by name, position, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Employee Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={employee.avatar}
                    alt={employee.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {employee.name}
                      </h3>
                      {activeTab === "verified" ? (
                        <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-800">
                            Verified
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(
                            employee.status
                          )}`}
                        >
                          {getStatusIcon(employee.status)}
                          <span className="capitalize">{employee.status}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      {employee.position}
                    </p>
                    <p className="text-sm text-gray-500">
                      {employee.department}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{employee.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span>
                      Joined {new Date(employee.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Additional Info */}
                {activeTab === "verified" ? (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">
                      Verified on{" "}
                      {new Date(employee.verificationDate).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {employee.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">
                      Submitted{" "}
                      {new Date(employee.submissionDate).toLocaleDateString()}
                    </p>
                    {employee.missingDocs &&
                      employee.missingDocs.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-red-600 mb-1">
                            Missing Documents:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {employee.missingDocs.map((doc, index) => (
                              <span
                                key={index}
                                className="inline-block bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full border border-red-200"
                              >
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {activeTab === "verified" ? (
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                        View Profile
                      </button>
                      <button className="flex-1 bg-gray-50 text-gray-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                        Download Docs
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-green-50 text-green-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                        Review
                      </button>
                      <button className="flex-1 bg-amber-50 text-amber-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors">
                        Request Docs
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No employees found
            </h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeVerificationSystem;



// import React, { useState } from "react";
// import {
//   Search,
//   Users,
//   UserCheck,
//   UserX,
//   Filter,
//   ChevronLeft,
//   ChevronRight,
//   Eye,
//   CheckCircle2,
//   Clock,
//   AlertTriangle,
//   XCircle,
//   Mail,
//   Phone,
//   MapPin,
//   Calendar,
// } from "lucide-react";

// const EmployeeVerificationSystem = () => {
//   const [activeTab, setActiveTab] = useState("verified");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(6);

//   // Extended sample data for verified employees
//   const verifiedEmployees = [
//     {
//       id: 1,
//       name: "Sarah Johnson",
//       position: "Senior Developer",
//       department: "Engineering",
//       email: "sarah.johnson@company.com",
//       phone: "+1 (555) 123-4567",
//       joinDate: "2022-03-15",
//       location: "New York, NY",
//       avatar:
//         "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
//       verificationDate: "2024-01-15",
//       status: "active",
//       rating: 4.9,
//     },
//     {
//       id: 2,
//       name: "Michael Chen",
//       position: "Product Manager",
//       department: "Product",
//       email: "michael.chen@company.com",
//       phone: "+1 (555) 234-5678",
//       joinDate: "2021-11-20",
//       location: "San Francisco, CA",
//       avatar:
//         "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
//       verificationDate: "2024-01-10",
//       status: "active",
//       rating: 4.8,
//     },
//     {
//       id: 3,
//       name: "Emily Rodriguez",
//       position: "UX Designer",
//       department: "Design",
//       email: "emily.rodriguez@company.com",
//       phone: "+1 (555) 345-6789",
//       joinDate: "2023-01-08",
//       location: "Austin, TX",
//       avatar:
//         "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
//       verificationDate: "2024-01-20",
//       status: "active",
//       rating: 4.7,
//     },
//     {
//       id: 4,
//       name: "Alex Thompson",
//       position: "DevOps Engineer",
//       department: "Engineering",
//       email: "alex.thompson@company.com",
//       phone: "+1 (555) 456-7890",
//       joinDate: "2022-08-12",
//       location: "Seattle, WA",
//       avatar:
//         "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
//       verificationDate: "2024-01-25",
//       status: "active",
//       rating: 4.9,
//     },
//     {
//       id: 5,
//       name: "Maria Garcia",
//       position: "Marketing Director",
//       department: "Marketing",
//       email: "maria.garcia@company.com",
//       phone: "+1 (555) 567-8901",
//       joinDate: "2021-05-30",
//       location: "Los Angeles, CA",
//       avatar:
//         "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
//       verificationDate: "2024-01-12",
//       status: "active",
//       rating: 4.8,
//     },
//     {
//       id: 6,
//       name: "Robert Kim",
//       position: "Data Scientist",
//       department: "Analytics",
//       email: "robert.kim@company.com",
//       phone: "+1 (555) 678-9012",
//       joinDate: "2023-02-14",
//       location: "Boston, MA",
//       avatar:
//         "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
//       verificationDate: "2024-01-18",
//       status: "active",
//       rating: 4.6,
//     },
//     {
//       id: 7,
//       name: "Jennifer Lee",
//       position: "HR Manager",
//       department: "Human Resources",
//       email: "jennifer.lee@company.com",
//       phone: "+1 (555) 789-0123",
//       joinDate: "2022-01-10",
//       location: "Chicago, IL",
//       avatar:
//         "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
//       verificationDate: "2024-01-22",
//       status: "active",
//       rating: 4.9,
//     },
//   ];

//   // Extended sample data for unverified employees
//   const unverifiedEmployees = [
//     {
//       id: 8,
//       name: "David Wilson",
//       position: "Junior Developer",
//       department: "Engineering",
//       email: "david.wilson@company.com",
//       phone: "+1 (555) 456-7890",
//       joinDate: "2024-06-01",
//       location: "Chicago, IL",
//       avatar:
//         "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
//       submissionDate: "2024-06-15",
//       status: "pending",
//       priority: "high",
//       daysWaiting: 8,
//     },
//     {
//       id: 9,
//       name: "Lisa Thompson",
//       position: "Marketing Specialist",
//       department: "Marketing",
//       email: "lisa.thompson@company.com",
//       phone: "+1 (555) 567-8901",
//       joinDate: "2024-05-20",
//       location: "Miami, FL",
//       avatar:
//         "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
//       submissionDate: "2024-06-10",
//       status: "review",
//       priority: "medium",
//       daysWaiting: 13,
//     },
//     {
//       id: 10,
//       name: "James Park",
//       position: "Data Analyst",
//       department: "Analytics",
//       email: "james.park@company.com",
//       phone: "+1 (555) 678-9012",
//       joinDate: "2024-06-05",
//       location: "Seattle, WA",
//       avatar:
//         "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
//       submissionDate: "2024-06-18",
//       status: "incomplete",
//       priority: "low",
//       daysWaiting: 5,
//     },
//     {
//       id: 11,
//       name: "Amanda Foster",
//       position: "Content Writer",
//       department: "Marketing",
//       email: "amanda.foster@company.com",
//       phone: "+1 (555) 789-0123",
//       joinDate: "2024-06-08",
//       location: "Denver, CO",
//       avatar:
//         "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
//       submissionDate: "2024-06-20",
//       status: "pending",
//       priority: "medium",
//       daysWaiting: 3,
//     },
//     {
//       id: 12,
//       name: "Kevin Martinez",
//       position: "Sales Representative",
//       department: "Sales",
//       email: "kevin.martinez@company.com",
//       phone: "+1 (555) 890-1234",
//       joinDate: "2024-06-12",
//       location: "Phoenix, AZ",
//       avatar:
//         "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
//       submissionDate: "2024-06-22",
//       status: "review",
//       priority: "high",
//       daysWaiting: 1,
//     },
//     {
//       id: 13,
//       name: "Nicole Adams",
//       position: "Graphic Designer",
//       department: "Design",
//       email: "nicole.adams@company.com",
//       phone: "+1 (555) 901-2345",
//       joinDate: "2024-06-15",
//       location: "Portland, OR",
//       avatar:
//         "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
//       submissionDate: "2024-06-17",
//       status: "incomplete",
//       priority: "medium",
//       daysWaiting: 6,
//     },
//   ];

//   const currentEmployees =
//     activeTab === "verified" ? verifiedEmployees : unverifiedEmployees;

//   const filteredEmployees = currentEmployees.filter(
//     (employee) =>
//       employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       employee.department.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Pagination logic
//   const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentItems = filteredEmployees.slice(startIndex, endIndex);

//   // Reset to first page when changing tabs or searching
//   React.useEffect(() => {
//     setCurrentPage(1);
//   }, [activeTab, searchTerm]);

//   const goToPage = (page) => {
//     setCurrentPage(page);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "bg-amber-500";
//       case "review":
//         return "bg-blue-500";
//       case "incomplete":
//         return "bg-red-500";
//       case "active":
//         return "bg-green-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "pending":
//         return <Clock className="w-4 h-4" />;
//       case "review":
//         return <AlertTriangle className="w-4 h-4" />;
//       case "incomplete":
//         return <XCircle className="w-4 h-4" />;
//       case "active":
//         return <CheckCircle2 className="w-4 h-4" />;
//       default:
//         return <Users className="w-4 h-4" />;
//     }
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case "high":
//         return "text-red-600 bg-red-50 border-red-200";
//       case "medium":
//         return "text-yellow-600 bg-yellow-50 border-yellow-200";
//       case "low":
//         return "text-green-600 bg-green-50 border-green-200";
//       default:
//         return "text-gray-600 bg-gray-50 border-gray-200";
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="py-8">
//             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//               <div className="mb-6 lg:mb-0">
//                 <h1 className="text-4xl font-bold text-gray-900 mb-2">
//                   Employee Dashboard
//                 </h1>
//                 <p className="text-lg text-gray-600">
//                   Streamline your verification process
//                 </p>
//               </div>

//               {/* Stats Cards */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
//                   <div className="flex items-center">
//                     <UserCheck className="w-8 h-8 mr-3" />
//                     <div>
//                       <p className="text-green-100 text-sm">Verified</p>
//                       <p className="text-2xl font-bold">
//                         {verifiedEmployees.length}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-xl shadow-lg">
//                   <div className="flex items-center">
//                     <UserX className="w-8 h-8 mr-3" />
//                     <div>
//                       <p className="text-orange-100 text-sm">Pending</p>
//                       <p className="text-2xl font-bold">
//                         {unverifiedEmployees.length}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Controls Section */}
//         <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
//           {/* Tab Navigation */}
//           <div className="flex bg-white rounded-2xl p-1 shadow-md border">
//             <button
//               onClick={() => setActiveTab("verified")}
//               className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
//                 activeTab === "verified"
//                   ? "bg-green-500 text-white shadow-lg transform scale-105"
//                   : "text-gray-600 hover:text-green-600 hover:bg-green-50"
//               }`}
//             >
//               <UserCheck className="w-5 h-5 mr-2" />
//               Verified ({verifiedEmployees.length})
//             </button>
//             <button
//               onClick={() => setActiveTab("unverified")}
//               className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
//                 activeTab === "unverified"
//                   ? "bg-amber-500 text-white shadow-lg transform scale-105"
//                   : "text-gray-600 hover:text-amber-600 hover:bg-amber-50"
//               }`}
//             >
//               <UserX className="w-5 h-5 mr-2" />
//               Unverified ({unverifiedEmployees.length})
//             </button>
//           </div>

//           {/* Search and Filter */}
//           <div className="flex space-x-4">
//             <div className="relative">
//               <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search employees..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-12 pr-4 py-3 w-80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-md"
//               />
//             </div>
//             <button className="flex items-center px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-md hover:bg-gray-50 transition-colors">
//               <Filter className="w-5 h-5 mr-2 text-gray-600" />
//               <span className="text-gray-600">Filter</span>
//             </button>
//           </div>
//         </div>

//         {/* Employee Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
//           {currentItems.map((employee) => (
//             <div
//               key={employee.id}
//               className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
//             >
//               {/* Card Header */}
//               <div className="p-6 border-b border-gray-100">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center space-x-3">
//                     <div className="relative">
//                       <img
//                         src={employee.avatar}
//                         alt={employee.name}
//                         className="w-14 h-14 rounded-full object-cover ring-3 ring-white shadow-lg"
//                       />
//                       <div
//                         className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${getStatusColor(
//                           employee.status
//                         )} flex items-center justify-center`}
//                       >
//                         {getStatusIcon(employee.status)}
//                       </div>
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-bold text-gray-900">
//                         {employee.name}
//                       </h3>
//                       <p className="text-sm text-blue-600 font-medium">
//                         {employee.position}
//                       </p>
//                     </div>
//                   </div>

//                   {activeTab === "unverified" && (
//                     <div
//                       className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
//                         employee.priority
//                       )}`}
//                     >
//                       {employee.priority.toUpperCase()}
//                     </div>
//                   )}
//                 </div>

//                 <div className="bg-gray-50 rounded-lg p-3">
//                   <p className="text-sm font-medium text-gray-700 mb-1">
//                     {employee.department}
//                   </p>
//                   <div className="flex items-center text-xs text-gray-500">
//                     <MapPin className="w-3 h-3 mr-1" />
//                     {employee.location}
//                   </div>
//                 </div>
//               </div>

//               {/* Card Body */}
//               <div className="p-6">
//                 <div className="space-y-3 mb-4">
//                   <div className="flex items-center text-sm text-gray-600">
//                     <Mail className="w-4 h-4 mr-3 text-gray-400" />
//                     <span className="truncate">{employee.email}</span>
//                   </div>
//                   <div className="flex items-center text-sm text-gray-600">
//                     <Phone className="w-4 h-4 mr-3 text-gray-400" />
//                     <span>{employee.phone}</span>
//                   </div>
//                   <div className="flex items-center text-sm text-gray-600">
//                     <Calendar className="w-4 h-4 mr-3 text-gray-400" />
//                     <span>
//                       Joined {new Date(employee.joinDate).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Additional Info */}
//                 {activeTab === "verified" ? (
//                   <div className="bg-green-50 rounded-lg p-3 mb-4">
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm font-medium text-green-800">
//                         Performance Rating
//                       </span>
//                       <div className="flex items-center">
//                         <span className="text-lg font-bold text-green-700">
//                           {employee.rating}
//                         </span>
//                         <span className="text-sm text-green-600 ml-1">
//                           /5.0
//                         </span>
//                       </div>
//                     </div>
//                     <div className="w-full bg-green-200 rounded-full h-2 mt-2">
//                       <div
//                         className="bg-green-500 h-2 rounded-full transition-all duration-300"
//                         style={{ width: `${(employee.rating / 5) * 100}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="bg-amber-50 rounded-lg p-3 mb-4">
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm font-medium text-amber-800">
//                         Waiting Time
//                       </span>
//                       <span className="text-lg font-bold text-amber-700">
//                         {employee.daysWaiting} days
//                       </span>
//                     </div>
//                     <p className="text-xs text-amber-600 mt-1">
//                       Submitted{" "}
//                       {new Date(employee.submissionDate).toLocaleDateString()}
//                     </p>
//                   </div>
//                 )}

//                 {/* Action Buttons */}
//                 <div className="flex space-x-2">
//                   <button className="flex-1 bg-blue-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center">
//                     <Eye className="w-4 h-4 mr-2" />
//                     View
//                   </button>
//                   {activeTab === "verified" ? (
//                     <button className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
//                       Manage
//                     </button>
//                   ) : (
//                     <button className="flex-1 bg-green-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors">
//                       Verify
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg border border-gray-100 px-6 py-4">
//             <div className="text-sm text-gray-700">
//               Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
//               <span className="font-medium">
//                 {Math.min(endIndex, filteredEmployees.length)}
//               </span>{" "}
//               of <span className="font-medium">{filteredEmployees.length}</span>{" "}
//               results
//             </div>

//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={() => goToPage(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <ChevronLeft className="w-4 h-4 mr-1" />
//                 Previous
//               </button>

//               <div className="flex space-x-1">
//                 {[...Array(totalPages)].map((_, index) => {
//                   const page = index + 1;
//                   return (
//                     <button
//                       key={page}
//                       onClick={() => goToPage(page)}
//                       className={`px-3 py-2 text-sm font-medium rounded-lg ${
//                         currentPage === page
//                           ? "bg-blue-500 text-white"
//                           : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   );
//                 })}
//               </div>

//               <button
//                 onClick={() => goToPage(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Next
//                 <ChevronRight className="w-4 h-4 ml-1" />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Empty State */}
//         {currentItems.length === 0 && (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
//             <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">
//               No employees found
//             </h3>
//             <p className="text-gray-500 mb-6">
//               Try adjusting your search criteria or filters
//             </p>
//             <button
//               onClick={() => setSearchTerm("")}
//               className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
//             >
//               Clear Search
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EmployeeVerificationSystem;
