// src/api/api.js
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Profile Functions
export const fetchProfile = async () => {
  await delay(300);
  return {
    id: 1,
    fullName: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    dob: "1990-01-15",
    pan: "ABCDE1234F",
    aadhaar: "234567890123",
    qualification: "B.Tech Computer Science",
    experience: 5,
    canEdit: false,
    staffProofId: `SP-${Math.floor(1000000 + Math.random() * 9000000)}`,
  };
};

export const updateProfile = async (data) => {
  await delay(300);
  return {
    success: true,
    profile: {
      ...data,
      verificationStatus: "pending",
      lastUpdated: new Date().toISOString(),
      status: "Under Review",
    },
  };
};

// Job History Functions
export const fetchJobHistory = async () => {
  await delay(300);
  return [
    {
      id: 1,
      company: "Tech Innovators",
      designation: "Senior Developer",
      startDate: "2020-03-01",
      endDate: null,
      currentlyWorking: true,
      status: "Verified",
      documents: {
        offerLetter: [{ name: "offer_tech.pdf", verified: true }],
        relievingLetter: [],
        payslips: [{ name: "payslips_tech.zip", verified: true }],
      },
    },
    {
      id: 2,
      company: "Digital Solutions",
      designation: "Frontend Lead",
      startDate: "2018-06-01",
      endDate: "2020-02-28",
      currentlyWorking: false,
      status: "Pending",
      documents: {
        offerLetter: [{ name: "offer_digital.pdf", verified: false }],
        relievingLetter: [{ name: "relieving_digital.pdf", verified: false }],
        payslips: [{ name: "payslips_2020.zip", verified: true }],
      },
    },
  ];
};

export const addJobRecord = async (formData) => {
  await delay(300);
  return {
    id: Date.now(),
    company: formData.get("company"),
    designation: formData.get("designation"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    currentlyWorking: formData.get("currentlyWorking") === "true",
    status: "Pending",
    verificationStatus: "under_review",
    documents: {
      offerLetter: Array.from(formData.getAll("offerLetter")).map((f) => ({
        name: f.name,
        verified: false,
      })),
      relievingLetter: Array.from(formData.getAll("relievingLetter")).map(
        (f) => ({
          name: f.name,
          verified: false,
        })
      ),
      payslips: Array.from(formData.getAll("payslips")).map((f) => ({
        name: f.name,
        verified: false,
      })),
    },
  };
};

export const deleteJobRecord = async (id) => {
  await delay(300);
  return {
    success: true,
    deletedId: id,
    message: `Record ${id} deleted successfully`,
    newJobList: [], // This should be implemented properly in real backend
  };
};

// Document Center Functions
export const fetchDocuments = async () => {
  await delay(300);
  return {
    identity: [
      { id: 1, name: "aadhaar_front.jpg", verified: true, date: "2024-03-15" },
      { id: 2, name: "aadhaar_back.jpg", verified: true, date: "2024-03-15" },
      { id: 3, name: "pan_card.pdf", verified: true, date: "2024-03-15" },
    ],
    education: [
      {
        id: 4,
        name: "degree_certificate.pdf",
        verified: true,
        date: "2024-03-15",
      },
      { id: 5, name: "marksheet_2020.pdf", verified: true, date: "2024-03-15" },
    ],
    resume: [
      { id: 6, name: "latest_resume.pdf", verified: true, date: "2024-03-15" },
    ],
  };
};

export const uploadDocument = async (formData) => {
  await delay(300);
  const fileType = formData.get("type");
  const newDocument = {
    id: Date.now(),
    name: formData.get("file").name,
    verified: false,
    date: new Date().toISOString(),
  };

  // Simulate different document sections
  if (fileType === "resume") {
    return { ...newDocument, section: "resume" };
  }
  if (fileType === "educational") {
    return { ...newDocument, section: "education" };
  }
  return { ...newDocument, section: "identity" };
};

// fatcing dashboard functions

export const fetchDashboard = async () => {
  await delay(300);
  return {
    totalEmployees: 145,
    pendingApprovals: 5,
    messages: 3,
    recentActivities: [
      { message: "Profile updated", date: "2024-03-15 14:30" },
      { message: "Document uploaded: PAN Card", date: "2024-03-15 10:15" },
    ],
    notifications: [
      {
        type: "warning",
        message: "Complete KYC verification",
        date: "2024-03-14",
      },
      {
        type: "error",
        message: "Payment failed for Add-on",
        date: "2024-03-13",
      },
    ],
  };
};

// Access Control Functions
export const fetchAccessRequests = async () => {
  await delay(300);
  return [
    {
      id: 1,
      employer: {
        id: 101,
        name: "Tech Corp Ltd",
        email: "hr@techcorp.com",
      },
      requestedDocs: ["PAN Card", "Aadhaar Front"],
      requestDate: "2024-03-15",
      expiryDate: "2024-04-15",
      status: "pending",
      accessLogs: [],
    },
    {
      id: 2,
      employer: {
        id: 102,
        name: "Digital Solutions",
        email: "admin@digitalsol.com",
      },
      requestedDocs: ["Resume", "Experience Letter"],
      requestDate: "2024-03-10",
      expiryDate: "2024-04-10",
      status: "accepted",
      accessLogs: [
        {
          timestamp: "2024-03-12T14:30:00",
          action: "viewed",
          ip: "203.0.113.45",
          document: "Resume",
        },
      ],
    },
  ];
};

export const updateAccessRequest = async (requestId, action) => {
  await delay(300);
  return {
    id: requestId,
    status: action,
    updatedAt: new Date().toISOString(),
  };
};

// Add-Ons Functions
export const fetchAddOns = async () => {
  await delay(300);
  return [
    {
      id: 1,
      name: "Profile Editing",
      price: 299,
      description: "Unlock profile editing capabilities",
      features: [
        "Edit personal information",
        "Update contact details",
        "Modify employment history",
      ],
      billingCycle: "year",
      featured: true,
    },
    {
      id: 2,
      name: "Priority Verification",
      price: 499,
      description: "Fast-track document verification",
      features: ["24-hour verification", "Priority support", "Status updates"],
      billingCycle: "case",
    },
    {
      id: 3,
      name: "Advanced Security",
      price: 199,
      description: "Enhanced security features",
      features: ["2FA protection", "Access logs", "Device management"],
      billingCycle: "month",
    },
  ];
};

export const purchaseAddOn = async (addOnId) => {
  await delay(500);
  return {
    success: true,
    invoice: {
      id: `INV-${Math.floor(Math.random() * 1000000)}`,
      date: new Date().toISOString(),
      item: "Profile Editing Package",
      amount: 299,
      features: [
        "Edit personal information",
        "Update contact details",
        "Modify employment history",
      ],
    },
  };
};

// Billing Functions
// export const fetchBilling = async () => {
//   await delay(300);
//   return [
//     {
//       id: 1,
//       invoiceNumber: 'INV-2023-001',
//       date: '2023-05-15',
//       amount: 299,
//       paymentMethod: 'Visa **** 4242',
//       status: 'paid'
//     },
//     {
//       id: 2,
//       invoiceNumber: 'INV-2023-002',
//       date: '2023-06-01',
//       amount: 499,
//       paymentMethod: 'Mastercard **** 5678',
//       status: 'pending'
//     },
//     {
//       id: 3,
//       invoiceNumber: 'INV-2023-003',
//       date: '2023-06-15',
//       amount: 199,
//       paymentMethod: 'PayPal',
//       status: 'failed'
//     }
//   ];
// };

export const fetchPaymentMethods = async () => {
  await delay(300);
  return [
    {
      id: 1,
      brand: "visa",
      last4: "4242",
      exp_month: "12",
      exp_year: "2025",
    },
  ];
};

export const downloadInvoice = async (invoiceId) => {
  await delay(300);
  return { success: true };
};

// Notification Functions
export const fetchNotifications = async () => {
  await delay(300);
  return [
    {
      id: 1,
      type: "document",
      message: "Your PAN card has been verified",
      date: "2023-05-15 14:30",
      read: false,
    },
    {
      id: 2,
      type: "payment",
      message: "Payment failed for Add-on purchase",
      date: "2023-06-01 09:15",
      read: true,
    },
    {
      id: 3,
      type: "security",
      message: "New login detected from unknown device",
      date: "2023-06-15 18:45",
      read: false,
    },
  ];
};

export const markNotificationRead = async (id) => {
  await delay(100);
  return { success: true, id };
};

// src/Dashboard/api/api.js
// Mock database of billing records
let billingRecords = [
  {
    id: "inv_1",
    user: "John Doe",
    user_type: "Employee",
    service: "Premium Subscription",
    amount: 29.99,
    date: "2023-10-15T08:30:00Z",
    status: "Completed",
  },
  {
    id: "inv_2",
    user: "Acme Corp",
    user_type: "Employer",
    service: "Enterprise Plan",
    amount: 299.99,
    date: "2023-10-18T14:22:00Z",
    status: "Pending",
  },
  {
    id: "inv_3",
    user: "Jane Smith",
    user_type: "Employee",
    service: "Profile Highlight",
    amount: 9.99,
    date: "2023-10-20T11:05:00Z",
    status: "Completed",
  },
  {
    id: "inv_4",
    user: "Tech Solutions",
    user_type: "Employer",
    service: "Job Posting",
    amount: 199.99,
    date: "2023-10-22T09:45:00Z",
    status: "Failed",
  },
  {
    id: "inv_5",
    user: "Mike Johnson",
    user_type: "Employee",
    service: "Resume Badge",
    amount: 4.99,
    date: "2023-10-25T16:30:00Z",
    status: "Refunded",
  },
];

// Simulate API delay
const simulateNetwork = () =>
  new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 100));

// Generate unique token
const generateToken = () => {
  return (
    "mock-token-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
  );
};

// Fetch billing records with filtering and pagination
export const fetchBilling = async (params = {}) => {
  await simulateNetwork();

  const {
    search = "",
    status = "",
    userType = "",
    serviceType = "",
    startDate = "",
    endDate = "",
    page = 1,
    limit = 5,
  } = params;

  // Filter records
  let filtered = billingRecords.filter((record) => {
    const matchesSearch =
      record.user.toLowerCase().includes(search.toLowerCase()) ||
      record.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = status ? record.status === status : true;
    const matchesUserType = userType ? record.user_type === userType : true;
    const matchesServiceType = serviceType
      ? record.service === serviceType
      : true;

    const recordDate = new Date(record.date);
    const matchesStartDate = startDate
      ? recordDate >= new Date(startDate)
      : true;
    const matchesEndDate = endDate
      ? recordDate <= new Date(endDate + "T23:59:59Z")
      : true;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesUserType &&
      matchesServiceType &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  // Apply pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    data: paginated,
    total,
    totalPages,
  };
};

// Generate invoice PDF
export const generateInvoice = async (id) => {
  await simulateNetwork();

  const record = billingRecords.find((r) => r.id === id);
  if (!record) {
    throw new Error("Billing record not found");
  }

  if (record.status !== "Completed") {
    throw new Error("Invoice can only be generated for completed payments");
  }

  // Generate unique token without UUID dependency
  const token = generateToken();
  return {
    url: `https://api.example.com/invoices/${id}.pdf?token=${token}`,
    filename: `invoice_${id}.pdf`,
  };
};

// Process refund
export const refundBilling = async (id) => {
  await simulateNetwork();

  const recordIndex = billingRecords.findIndex((r) => r.id === id);
  if (recordIndex === -1) {
    throw new Error("Billing record not found");
  }

  if (billingRecords[recordIndex].status !== "Completed") {
    throw new Error("Only completed payments can be refunded");
  }

  // Update record
  billingRecords[recordIndex] = {
    ...billingRecords[recordIndex],
    status: "Refunded",
    refundDate: new Date().toISOString(),
  };

  return { success: true };
};

// Adjust payment amount
export const adjustBilling = async (id, newAmount) => {
  await simulateNetwork();

  if (isNaN(newAmount) || newAmount <= 0) {
    throw new Error("Invalid amount. Must be a positive number");
  }

  const recordIndex = billingRecords.findIndex((r) => r.id === id);
  if (recordIndex === -1) {
    throw new Error("Billing record not found");
  }

  if (billingRecords[recordIndex].status !== "Completed") {
    throw new Error("Only completed payments can be adjusted");
  }

  // Calculate difference
  const originalAmount = billingRecords[recordIndex].amount;
  const adjustment = newAmount - originalAmount;

  // Update record
  billingRecords[recordIndex] = {
    ...billingRecords[recordIndex],
    amount: newAmount,
    adjustments: [
      ...(billingRecords[recordIndex].adjustments || []),
      {
        date: new Date().toISOString(),
        originalAmount,
        newAmount,
        difference: adjustment,
      },
    ],
  };

  return billingRecords[recordIndex];
};

// Utility function to reset mock data (for testing)
export const resetMockData = () => {
  billingRecords = [...initialRecords];
};

// Preserve initial state for resetting
const initialRecords = [...billingRecords];
