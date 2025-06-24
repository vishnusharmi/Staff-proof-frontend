import { useState } from "react";
import {
  CheckCircle,
  User,
  Briefcase,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

export default function AddEmployee() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Details
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",

    // Job Details (array of objects)
    jobDetails: [
      {
        company: "",
        position: "",
        department: "",
        startDate: "",
        endDate: "",
        responsibilities: "",
      },
    ],

    // Current Position Details
    currentPosition: "",
    currentDepartment: "",
    startDate: "",
    employmentType: "",
    manager: "",
    salary: "",
    emergencyContactName: "",
    emergencyContactPhone: "",

    // Documents
    resume: null,
    idProof: null,
    addressProof: null,
    offerLetter: null,
    bankDetails: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleJobDetailsChange = (index, field, value) => {
    const updatedJobDetails = [...formData.jobDetails];
    updatedJobDetails[index] = {
      ...updatedJobDetails[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      jobDetails: updatedJobDetails,
    });
  };

  const addJobDetail = () => {
    setFormData({
      ...formData,
      jobDetails: [
        ...formData.jobDetails,
        {
          company: "",
          position: "",
          department: "",
          startDate: "",
          endDate: "",
          responsibilities: "",
        },
      ],
    });
  };

  const removeJobDetail = (index) => {
    if (formData.jobDetails.length > 1) {
      const updatedJobDetails = [...formData.jobDetails];
      updatedJobDetails.splice(index, 1);

      setFormData({
        ...formData,
        jobDetails: updatedJobDetails,
      });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData({
        ...formData,
        [name]: files[0].name, // Store just the filename for demo purposes
      });
    }
  };

  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.firstName.trim()) {
        stepErrors.firstName = "First name is required";
        isValid = false;
      }
      if (!formData.lastName.trim()) {
        stepErrors.lastName = "Last name is required";
        isValid = false;
      }
      if (!formData.email.trim()) {
        stepErrors.email = "Email is required";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        stepErrors.email = "Email is invalid";
        isValid = false;
      }
      if (!formData.phone.trim()) {
        stepErrors.phone = "Phone number is required";
        isValid = false;
      }
    } else if (step === 2) {
      // Validate current position information
      if (!formData.currentDepartment.trim()) {
        stepErrors.currentDepartment = "Department is required";
        isValid = false;
      }
      if (!formData.currentPosition.trim()) {
        stepErrors.currentPosition = "Position is required";
        isValid = false;
      }
      if (!formData.startDate.trim()) {
        stepErrors.startDate = "Start date is required";
        isValid = false;
      }

      // Validate job details
      const jobDetailsErrors = [];
      formData.jobDetails.forEach((job, index) => {
        const jobError = {};
        let hasJobError = false;

        if (!job.company.trim()) {
          jobError.company = "Company is required";
          hasJobError = true;
        }
        if (!job.position.trim()) {
          jobError.position = "Position is required";
          hasJobError = true;
        }

        if (hasJobError) {
          jobDetailsErrors[index] = jobError;
          isValid = false;
        }
      });

      if (jobDetailsErrors.length > 0) {
        stepErrors.jobDetails = jobDetailsErrors;
      }
    }

    setErrors(stepErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (validateStep(3)) {
      // In a real application, you would send the form data to your server here
      console.log("Form submitted:", formData);
      setIsSubmitted(true);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Basic Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name*
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name*
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone*</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
              ></textarea>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">
                Current Position Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Department*
                  </label>
                  <select
                    name="currentDepartment"
                    value={formData.currentDepartment}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${
                      errors.currentDepartment
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Department</option>
                    <option value="engineering">Engineering</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="hr">Human Resources</option>
                    <option value="finance">Finance</option>
                    <option value="operations">Operations</option>
                  </select>
                  {errors.currentDepartment && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.currentDepartment}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Position*
                  </label>
                  <input
                    type="text"
                    name="currentPosition"
                    value={formData.currentPosition}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${
                      errors.currentPosition
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.currentPosition && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.currentPosition}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date*
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${
                      errors.startDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Employment Type
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Manager
                  </label>
                  <input
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Salary
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Previous Job Experience</h2>
                <button
                  type="button"
                  onClick={addJobDetail}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  <Plus size={16} className="mr-1" /> Add Job
                </button>
              </div>

              {formData.jobDetails.map((job, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded p-4 mb-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Job #{index + 1}</h3>
                    {formData.jobDetails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeJobDetail(index)}
                        className="text-red-500 hover:text-red-700 flex items-center"
                      >
                        <Trash2 size={16} className="mr-1" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Company*
                      </label>
                      <input
                        type="text"
                        value={job.company}
                        onChange={(e) =>
                          handleJobDetailsChange(
                            index,
                            "company",
                            e.target.value
                          )
                        }
                        className={`w-full p-2 border rounded ${
                          errors.jobDetails &&
                          errors.jobDetails[index] &&
                          errors.jobDetails[index].company
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.jobDetails &&
                        errors.jobDetails[index] &&
                        errors.jobDetails[index].company && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.jobDetails[index].company}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Position*
                      </label>
                      <input
                        type="text"
                        value={job.position}
                        onChange={(e) =>
                          handleJobDetailsChange(
                            index,
                            "position",
                            e.target.value
                          )
                        }
                        className={`w-full p-2 border rounded ${
                          errors.jobDetails &&
                          errors.jobDetails[index] &&
                          errors.jobDetails[index].position
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.jobDetails &&
                        errors.jobDetails[index] &&
                        errors.jobDetails[index].position && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.jobDetails[index].position}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={job.department}
                        onChange={(e) =>
                          handleJobDetailsChange(
                            index,
                            "department",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={job.startDate}
                        onChange={(e) =>
                          handleJobDetailsChange(
                            index,
                            "startDate",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={job.endDate}
                      onChange={(e) =>
                        handleJobDetailsChange(index, "endDate", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1">
                      Responsibilities
                    </label>
                    <textarea
                      value={job.responsibilities}
                      onChange={(e) =>
                        handleJobDetailsChange(
                          index,
                          "responsibilities",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Document Upload</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Resume/CV
                </label>
                <input
                  type="file"
                  name="resume"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, DOC, DOCX (Max: 5MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  ID Proof
                </label>
                <input
                  type="file"
                  name="idProof"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Passport, Driver's License, etc. (Max: 5MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Address Proof
                </label>
                <input
                  type="file"
                  name="addressProof"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Utility bill, Rental agreement, etc. (Max: 5MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Signed Offer Letter
                </label>
                <input
                  type="file"
                  name="offerLetter"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Scanned copy of signed offer letter (Max: 5MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Bank Details
                </label>
                <input
                  type="file"
                  name="bankDetails"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cancelled check or bank statement (Max: 5MB)
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 1 ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            <User size={20} />
          </div>
          <div
            className={`w-12 h-1 ${
              currentStep >= 2 ? "bg-blue-500" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 2 ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            <Briefcase size={20} />
          </div>
          <div
            className={`w-12 h-1 ${
              currentStep >= 3 ? "bg-blue-500" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 3 ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            <FileText size={20} />
          </div>
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <CheckCircle size={64} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Employee Registration Successful!
          </h2>
          <p className="text-gray-600 mb-4">
            The employee information has been successfully submitted for
            processing.
          </p>
          <div className="mt-4">
            <h3 className="font-medium mb-2">Summary:</h3>
            <div className="text-left max-w-lg mx-auto">
              <p>
                <strong>Name:</strong> {formData.firstName} {formData.lastName}
              </p>
              <p>
                <strong>Email:</strong> {formData.email}
              </p>
              <p>
                <strong>Position:</strong> {formData.currentPosition}
              </p>
              <p>
                <strong>Department:</strong> {formData.currentDepartment}
              </p>
              <p>
                <strong>Previous Experience:</strong>{" "}
                {formData.jobDetails.length} job(s)
              </p>
              <p>
                <strong>Documents Submitted:</strong>{" "}
                {
                  Object.values(formData).filter(
                    (val) =>
                      val !== null &&
                      typeof val === "string" &&
                      val.includes(".")
                  ).length
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                dateOfBirth: "",
                gender: "",
                address: "",
                jobDetails: [
                  {
                    company: "",
                    position: "",
                    department: "",
                    startDate: "",
                    endDate: "",
                    responsibilities: "",
                  },
                ],
                currentPosition: "",
                currentDepartment: "",
                startDate: "",
                employmentType: "",
                manager: "",
                salary: "",
                emergencyContactName: "",
                emergencyContactPhone: "",
                resume: null,
                idProof: null,
                addressProof: null,
                offerLetter: null,
                bankDetails: null,
              });
              setCurrentStep(1);
              setIsSubmitted(false);
            }}
            className="px-4 py-2 mt-6 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Register Another Employee
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {renderStepIndicator()}

      <div>
        {renderStep()}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Previous
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition ml-auto"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
