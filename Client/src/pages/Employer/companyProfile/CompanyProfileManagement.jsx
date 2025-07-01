import React, { useState } from "react";
import {
  Building2,
  Upload,
  Edit,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
// import companyLogo from "../assets/company-logo.png"; 

const CompanyProfileManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("Pending");
  const [uploadedFiles, setUploadedFiles] = useState({
    incorporation: null,
    gst: null,
  });

  const [formData, setFormData] = useState({
    companyName: "TechCorp Solutions Pvt Ltd",
    registrationNumber: "U72900DL2020PTC123456",
    website: "https://techcorp.com",
    contactPerson: "Rajesh Kumar",
    email: "contact@techcorp.com",
    phone: "+91 98765 43210",
    address: "123 Business Park, Sector 15, Gurgaon, Haryana - 122001",
    gstNumber: "07AABCT1234M1Z5",
    cin: "",
    pan: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (fileType, event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFiles((prev) => ({
        ...prev,
        [fileType]: file,
      }));
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    alert(
      "Profile updated successfully. Major changes require admin approval."
    );
  };

  const getStatusBadge = () => {
    const statusConfig = {
      Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      Approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      Rejected: { color: "bg-red-100 text-red-800", icon: AlertCircle },
    };

    const config = statusConfig[verificationStatus];
    const IconComponent = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        <IconComponent size={16} />
        {verificationStatus}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* <img
                src={companyLogo}
                alt="Company Logo"
                className="h-12 w-12 object-contain"
              /> */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Company Profile Management
                </h1>
                <p className="text-gray-600">
                  Manage your company information and verification status
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge()}
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Fields */}
            {[
              { label: "Company Name *", name: "companyName", type: "text" },
              {
                label: "Company Registration Number *",
                name: "registrationNumber",
                type: "text",
              },
              { label: "CIN", name: "cin", type: "text" },
              { label: "PAN", name: "pan", type: "text" },
              { label: "Company Website", name: "website", type: "url" },
              {
                label: "Primary Contact Person *",
                name: "contactPerson",
                type: "text",
              },
              { label: "Email ID *", name: "email", type: "email" },
              { label: "Phone Number *", name: "phone", type: "tel" },
              { label: "GST Number", name: "gstNumber", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            ))}

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Company Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Certificate of Incorporation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate of Incorporation *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {uploadedFiles.incorporation ? (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-500" size={20} />
                      <span className="text-sm text-gray-700">
                        {uploadedFiles.incorporation.name}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload
                        className="mx-auto text-gray-400 mb-2"
                        size={24}
                      />
                      <p className="text-sm text-gray-600">
                        Upload Certificate of Incorporation
                      </p>
                    </div>
                  )}
                  {isEditing && (
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload("incorporation", e)}
                      className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  )}
                </div>
              </div>

              {/* GST Certificate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Certificate
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {uploadedFiles.gst ? (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-500" size={20} />
                      <span className="text-sm text-gray-700">
                        {uploadedFiles.gst.name}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload
                        className="mx-auto text-gray-400 mb-2"
                        size={24}
                      />
                      <p className="text-sm text-gray-600">
                        Upload GST Certificate (Optional)
                      </p>
                    </div>
                  )}
                  {isEditing && (
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload("gst", e)}
                      className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Verification Status Information
              </h4>
              <p className="text-sm text-blue-800">
                {verificationStatus === "Pending" &&
                  "Your company profile is under review. You will be notified once the verification is complete."}
                {verificationStatus === "Approved" &&
                  "Your company profile has been verified and approved."}
                {verificationStatus === "Rejected" &&
                  "Your company profile verification was rejected. Please update your information and documents."}
              </p>
              {verificationStatus === "Pending" && (
                <p className="text-xs text-blue-700 mt-2">
                  * Major profile updates require admin approval before they
                  take effect.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileManagement;
