import React, { useState } from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

const BillingHistory = () => {
  // Sample billing data - in real app this would come from API
  const [billingData] = useState([
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      date: '2024-03-15',
      description: 'Profile Edit Access',
      amount: 299,
      gst: 53.82,
      total: 352.82,
      status: 'Paid'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      date: '2024-03-20',
      description: 'Priority Verification',
      amount: 599,
      gst: 107.82,
      total: 706.82,
      status: 'Paid'
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      date: '2024-04-01',
      description: 'Premium Profile Badge',
      amount: 199,
      gst: 35.82,
      total: 234.82,
      status: 'Paid'
    },
    {
      id: 4,
      invoiceNumber: 'INV-2024-004',
      date: '2024-04-10',
      description: 'Document Backup Service',
      amount: 149,
      gst: 26.82,
      total: 175.82,
      status: 'Paid'
    },
    {
      id: 5,
      invoiceNumber: 'INV-2024-005',
      date: '2024-04-15',
      description: 'Extended Visibility (3 months)',
      amount: 899,
      gst: 161.82,
      total: 1060.82,
      status: 'Paid'
    },
    {
      id: 6,
      invoiceNumber: 'INV-2024-006',
      date: '2024-05-01',
      description: 'Profile Analytics',
      amount: 399,
      gst: 71.82,
      total: 470.82,
      status: 'Paid'
    },
    {
      id: 7,
      invoiceNumber: 'INV-2024-007',
      date: '2024-05-10',
      description: 'Resume Enhancement',
      amount: 499,
      gst: 89.82,
      total: 588.82,
      status: 'Paid'
    },
    {
      id: 8,
      invoiceNumber: 'INV-2024-008',
      date: '2024-05-20',
      description: 'Multiple Profile Access',
      amount: 799,
      gst: 143.82,
      total: 942.82,
      status: 'Paid'
    },
    {
      id: 9,
      invoiceNumber: 'INV-2024-009',
      date: '2024-06-01',
      description: 'Document Verification Rush',
      amount: 699,
      gst: 125.82,
      total: 824.82,
      status: 'Paid'
    },
    {
      id: 10,
      invoiceNumber: 'INV-2024-010',
      date: '2024-06-15',
      description: 'Premium Support Package',
      amount: 999,
      gst: 179.82,
      total: 1178.82,
      status: 'Paid'
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination
  const totalPages = Math.ceil(billingData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = billingData.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDownloadInvoice = (invoiceNumber) => {
    // In real app, this would trigger PDF download
    alert(`Downloading invoice ${invoiceNumber}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Billing & History</h2>
        <p className="text-gray-600">View all your payment history and download invoices</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GST
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.invoiceNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(item.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {item.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(item.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-500">
                      {formatCurrency(item.gst)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.total)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleDownloadInvoice(item.invoiceNumber)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(endIndex, billingData.length)} of {billingData.length} entries
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
              currentPage === 1
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageClick(pageNumber)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === pageNumber
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
              currentPage === totalPages
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Total Spent</h3>
            <p className="text-sm text-gray-600">Lifetime payment summary</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(billingData.reduce((sum, item) => sum + item.total, 0))}
            </div>
            <div className="text-sm text-gray-500">
              GST: {formatCurrency(billingData.reduce((sum, item) => sum + item.gst, 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingHistory;