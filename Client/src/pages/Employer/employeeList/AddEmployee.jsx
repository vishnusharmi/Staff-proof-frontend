import { useState } from "react";
import {
  CheckCircle,
  User,
  GraduationCap,
  FileText,
  Eye,
  Plus,
  Trash2,
  Briefcase,
} from "lucide-react";
import { createEmployee } from "../../../components/api/api";
import { toast } from 'react-hot-toast';

export default function AddEmployee() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Details
    firstName: "",
    middleName: "",
    lastName: "",
    fatherName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    resume: null,
    aadharCard: null,
    panCard: null,

    // Education Details (single object now)
    education: {
      degree: "",
      institution: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      grade: "",
      certificate: null,
    },

    // Current Position Details
    designation: "",
    department: "",
    joiningDate: "",
    endDate: "",
    employmentType: "",
    salary: "",
    offerLetter: null,
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

  const handleEducationChange = (field, value) => {
    setFormData({
      ...formData,
      education: {
        ...formData.education,
        [field]: value,
      },
    });
  };

  const handleEducationFileChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      setFormData({
        ...formData,
        education: {
          ...formData.education,
          certificate: files[0],
        },
      });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData({
        ...formData,
        [name]: files[0],
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
      if (!formData.fatherName.trim()) {
        stepErrors.fatherName = "Father's name is required";
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
      // Validate education information (single object)
      const edu = formData.education;
      const eduError = {};
      if (!edu.degree.trim()) {
        eduError.degree = "Degree is required";
        isValid = false;
      }
      if (!edu.institution.trim()) {
        eduError.institution = "Institution is required";
        isValid = false;
      }
      if (!edu.fieldOfStudy.trim()) {
        eduError.fieldOfStudy = "Field of study is required";
        isValid = false;
      }
      if (Object.keys(eduError).length > 0) {
        stepErrors.education = eduError;
      }
    } else if (step === 3) {
      // Validate current position information
      if (!formData.department.trim()) {
        stepErrors.department = "Department is required";
        isValid = false;
      }
      if (!formData.designation.trim()) {
        stepErrors.designation = "Designation is required";
        isValid = false;
      }
      if (!formData.joiningDate.trim()) {
        stepErrors.joiningDate = "Joining date is required";
        isValid = false;
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

  const handleSubmit = async () => {
    if (validateStep(4)) {
      try {
        // Prepare form data for API
        const formDataToSend = new FormData();
        
        // Add basic fields
        formDataToSend.append('firstName', formData.firstName);
        formDataToSend.append('middleName', formData.middleName);
        formDataToSend.append('lastName', formData.lastName);
        formDataToSend.append('fatherName', formData.fatherName);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('dateOfBirth', formData.dateOfBirth);
        formDataToSend.append('gender', formData.gender);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('department', formData.department);
        formDataToSend.append('designation', formData.designation);
        formDataToSend.append('joiningDate', formData.joiningDate);
        formDataToSend.append('endDate', formData.endDate);
        formDataToSend.append('employmentType', formData.employmentType);
        formDataToSend.append('salary', formData.salary);
        
        // Add education fields
        formDataToSend.append('education[degree]', formData.education.degree);
        formDataToSend.append('education[institution]', formData.education.institution);
        formDataToSend.append('education[fieldOfStudy]', formData.education.fieldOfStudy);
        formDataToSend.append('education[grade]', formData.education.grade);
        formDataToSend.append('education[startDate]', formData.education.startDate);
        formDataToSend.append('education[endDate]', formData.education.endDate);
        
        // Add files if they exist
        if (formData.resume) {
          formDataToSend.append('resume', formData.resume);
        }
        if (formData.aadharCard) {
          formDataToSend.append('aadharCard', formData.aadharCard);
        }
        if (formData.panCard) {
          formDataToSend.append('panCard', formData.panCard);
        }
        if (formData.offerLetter) {
          formDataToSend.append('offerLetter', formData.offerLetter);
        }
        if (formData.education.certificate) {
          formDataToSend.append('educationCertificate', formData.education.certificate);
        }

        const response = await createEmployee(formDataToSend);
        
        if (response.success) {
          toast.success('Employee created successfully');
          setIsSubmitted(true);
          // Reset form
          setFormData({
            firstName: "",
            middleName: "",
            lastName: "",
            fatherName: "",
            email: "",
            phone: "",
            dateOfBirth: "",
            gender: "",
            address: "",
            resume: null,
            aadharCard: null,
            panCard: null,
            education: {
              degree: "",
              institution: "",
              fieldOfStudy: "",
              startDate: "",
              endDate: "",
              grade: "",
              certificate: null,
            },
            designation: "",
            department: "",
            joiningDate: "",
            endDate: "",
            employmentType: "",
            salary: "",
            offerLetter: null,
          });
          setCurrentStep(1);
        } else {
          toast.error(response.message || 'Failed to create employee');
        }
      } catch (error) {
        console.error('Error creating employee:', error);
        toast.error('Failed to create employee');
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Basic Details</h2>
              <p className="text-gray-600">Please provide the employee's personal information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  First Name*
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter middle name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Last Name*
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Father's Name*
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.fatherName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter father's name"
                />
                {errors.fatherName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Phone*</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* File Uploads */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText size={20} className="mr-2" />
                Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Resume</label>
                  <input
                    type="file"
                    name="resume"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Aadhar Card</label>
                  <input
                    type="file"
                    name="aadharCard"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">PAN Card</label>
                  <input
                    type="file"
                    name="panCard"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Offer Letter</label>
                  <input
                    type="file"
                    name="offerLetter"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Education Details</h2>
              <p className="text-gray-600">Please provide the employee's educational information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Degree*</label>
                <input
                  type="text"
                  value={formData.education.degree}
                  onChange={(e) => handleEducationChange('degree', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.education?.degree ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Bachelor of Technology"
                />
                {errors.education?.degree && (
                  <p className="text-red-500 text-xs mt-1">{errors.education.degree}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Institution*</label>
                <input
                  type="text"
                  value={formData.education.institution}
                  onChange={(e) => handleEducationChange('institution', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.education?.institution ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., IIT Delhi"
                />
                {errors.education?.institution && (
                  <p className="text-red-500 text-xs mt-1">{errors.education.institution}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Field of Study*</label>
                <input
                  type="text"
                  value={formData.education.fieldOfStudy}
                  onChange={(e) => handleEducationChange('fieldOfStudy', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.education?.fieldOfStudy ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Computer Science"
                />
                {errors.education?.fieldOfStudy && (
                  <p className="text-red-500 text-xs mt-1">{errors.education.fieldOfStudy}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Grade</label>
                <input
                  type="text"
                  value={formData.education.grade}
                  onChange={(e) => handleEducationChange('grade', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="e.g., First Class"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={formData.education.startDate}
                  onChange={(e) => handleEducationChange('startDate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">End Date</label>
                <input
                  type="date"
                  value={formData.education.endDate}
                  onChange={(e) => handleEducationChange('endDate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Education Certificate</label>
              <input
                type="file"
                onChange={handleEducationFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Current Position</h2>
              <p className="text-gray-600">Please provide the employee's current position details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Department*</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.department ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Engineering"
                />
                {errors.department && (
                  <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Designation*</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.designation ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Software Engineer"
                />
                {errors.designation && (
                  <p className="text-red-500 text-xs mt-1">{errors.designation}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Joining Date*</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.joiningDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.joiningDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.joiningDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">Select Employment Type</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Salary</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter salary"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Review & Submit</h2>
              <p className="text-gray-600">Please review all the information before submitting</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User size={20} className="mr-2" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Name:</span>
                    <p className="text-gray-800">
                      {formData.firstName} {formData.middleName} {formData.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Father's Name:</span>
                    <p className="text-gray-800">{formData.fatherName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <p className="text-gray-800">{formData.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Phone:</span>
                    <p className="text-gray-800">{formData.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Gender:</span>
                    <p className="text-gray-800">{formData.gender || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Date of Birth:</span>
                    <p className="text-gray-800">{formData.dateOfBirth || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {/* Education Information */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <GraduationCap size={20} className="mr-2" />
                  Education
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Degree:</span>
                    <p className="text-gray-800">{formData.education.degree}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Institution:</span>
                    <p className="text-gray-800">{formData.education.institution}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Field of Study:</span>
                    <p className="text-gray-800">{formData.education.fieldOfStudy}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Grade:</span>
                    <p className="text-gray-800">{formData.education.grade || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {/* Position Information */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Briefcase size={20} className="mr-2" />
                  Position Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Department:</span>
                    <p className="text-gray-800">{formData.department}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Designation:</span>
                    <p className="text-gray-800">{formData.designation}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Joining Date:</span>
                    <p className="text-gray-800">{formData.joiningDate}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Employment Type:</span>
                    <p className="text-gray-800">{formData.employmentType || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Salary:</span>
                    <p className="text-gray-800">{formData.salary || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText size={20} className="mr-2" />
                  Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Resume:</span>
                    <p className="text-gray-800">{formData.resume ? formData.resume.name : "Not uploaded"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Aadhar Card:</span>
                    <p className="text-gray-800">{formData.aadharCard ? formData.aadharCard.name : "Not uploaded"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">PAN Card:</span>
                    <p className="text-gray-800">{formData.panCard ? formData.panCard.name : "Not uploaded"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Offer Letter:</span>
                    <p className="text-gray-800">{formData.offerLetter ? formData.offerLetter.name : "Not uploaded"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: "Basic Details", icon: User },
      { number: 2, title: "Education", icon: GraduationCap },
      { number: 3, title: "Position", icon: Briefcase },
      { number: 4, title: "Preview", icon: Eye },
    ];

    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full transition ${
                  currentStep >= step.number
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                <step.icon size={20} />
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 transition ${
                    currentStep > step.number ? "bg-blue-500" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </div>
          ))}
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
            The employee information has been successfully submitted for processing.
          </p>
          <div className="mt-4">
            <h3 className="font-medium mb-2">Summary:</h3>
            <div className="text-left max-w-lg mx-auto">
              <p>
                <strong>Name:</strong> {formData.firstName} {formData.middleName} {formData.lastName}
              </p>
              <p>
                <strong>Email:</strong> {formData.email}
              </p>
              <p>
                <strong>Designation:</strong> {formData.designation}
              </p>
              <p>
                <strong>Department:</strong> {formData.department}
              </p>
              <p>
                <strong>Education:</strong> {formData.education.degree ? "1 qualification" : "No qualification"}
              </p>
              <p>
                <strong>Documents Submitted:</strong>{" "}
                {
                  Object.values(formData).filter(
                    (val) =>
                      val !== null &&
                      typeof val === "object" &&
                      val.name
                  ).length
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setFormData({
                firstName: "",
                middleName: "",
                lastName: "",
                fatherName: "",
                email: "",
                phone: "",
                dateOfBirth: "",
                gender: "",
                address: "",
                education: {
                  degree: "",
                  institution: "",
                  fieldOfStudy: "",
                  startDate: "",
                  endDate: "",
                  grade: "",
                  certificate: null,
                },
                designation: "",
                department: "",
                joiningDate: "",
                endDate: "",
                employmentType: "",
                salary: "",
                offerLetter: null,
                resume: null,
                aadharCard: null,
                panCard: null,
              });
              setCurrentStep(1);
              setIsSubmitted(false);
            }}
            className="px-6 py-3 mt-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Register Another Employee
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {renderStepIndicator()}

      <div>
        {renderStep()}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Previous
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition ml-auto"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}