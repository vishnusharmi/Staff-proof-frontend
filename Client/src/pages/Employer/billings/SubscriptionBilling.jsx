import { useState, useEffect } from "react";
import {
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ChevronsUpDown,
  Calendar,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BadgeLogo from "../../../assets/images badge.jpg";
import { Link } from "react-router-dom";
import { fetchBillingHistory, downloadInvoice, fetchDashboard } from '../../../components/api/api';

export default function SubscriptionBilling() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState({
    currentPlan: "basic",
    validUntil: "",
    employees: 0,
    employeeLimit: 0,
    autoRenew: true,
  });
  const [allInvoices, setAllInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch billing history
        const billingResponse = await fetchBillingHistory({
          page: 1,
          limit: 100,
          type: 'subscription'
        });
        
        // Fetch dashboard data for subscription info
        const dashboardResponse = await fetchDashboard('employer');
        
        setAllInvoices(billingResponse.data || []);
        
        // Update subscription data from dashboard
        if (dashboardResponse.data?.subscription) {
          setSubscription({
            currentPlan: dashboardResponse.data.subscription.plan || "basic",
            validUntil: dashboardResponse.data.subscription.validUntil || "",
            employees: dashboardResponse.data.subscription.employees || 0,
            employeeLimit: dashboardResponse.data.subscription.employeeLimit || 0,
            autoRenew: dashboardResponse.data.subscription.autoRenew || true,
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load billing data');
        console.error('Error fetching billing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Plan details
  const plans = {
    basic: {
      name: "Basic",
      price: "₹9,999",
      employeeLimit: "50 employees",
      color: "bg-blue-500",
      features: ["Basic analytics", "Email support", "Standard reports"],
    },
    pro: {
      name: "Pro",
      price: "₹19,999",
      employeeLimit: "250 employees",
      color: "bg-purple-600",
      features: [
        "Advanced analytics",
        "Priority support",
        "Custom reports",
        "API access",
      ],
    },
    enterprise: {
      name: "Enterprise",
      price: "₹49,999",
      employeeLimit: "Unlimited employees",
      color: "bg-indigo-700",
      features: [
        "Full analytics suite",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantees",
        "White-label options",
      ],
      badge: BadgeLogo
    },
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await downloadInvoice(invoiceId);
      // Handle file download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download invoice');
      console.error('Error downloading invoice:', err);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(allInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = allInvoices.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const calculateDaysRemaining = () => {
    if (!subscription.validUntil) return 0;
    const today = new Date();
    const validUntil = new Date(subscription.validUntil);
    const diffTime = validUntil - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Subscription & Billing
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your subscription and view billing history
              </p>
            </div>
            <Link
              to="/plans"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CreditCard size={16} />
              Manage Plan
            </Link>
          </div>
        </div>

        {/* Current Subscription */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Plan */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Current Plan
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                subscription.currentPlan === 'pro' ? 'bg-purple-100 text-purple-800' :
                subscription.currentPlan === 'enterprise' ? 'bg-indigo-100 text-indigo-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {plans[subscription.currentPlan]?.name || 'Basic'}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Employees</span>
                <span className="font-medium">
                  {subscription.employees} / {subscription.employeeLimit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valid Until</span>
                <span className="font-medium">
                  {subscription.validUntil ? new Date(subscription.validUntil).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Auto Renew</span>
                <span className={`font-medium ${subscription.autoRenew ? 'text-green-600' : 'text-red-600'}`}>
                  {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Usage Statistics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Employee Lookups</span>
                  <span className="font-medium">
                    {subscription.employees} / {subscription.employeeLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((subscription.employees / subscription.employeeLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days Remaining</span>
                <span className={`font-medium ${calculateDaysRemaining() < 30 ? 'text-red-600' : 'text-green-600'}`}>
                  {calculateDaysRemaining()} days
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <CreditCard size={16} />
                Update Payment Method
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                <FileText size={16} />
                Download Invoice
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <ArrowRight size={16} />
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Billing History
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          {currentInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No billing history found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Invoice</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Plan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">{invoice.invoiceNumber || invoice.id}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{invoice.plan || 'Subscription'}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          ₹{invoice.amount?.toLocaleString() || '0'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {invoice.status === 'paid' ? (
                              <>
                                <CheckCircle size={12} className="mr-1" />
                                Paid
                              </>
                            ) : invoice.status === 'pending' ? (
                              <>
                                <Clock size={12} className="mr-1" />
                                Pending
                              </>
                            ) : (
                              <>
                                <AlertCircle size={12} className="mr-1" />
                                Failed
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <Download size={14} />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, allInvoices.length)} of {allInvoices.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft size={14} />
                      Previous
                    </button>
                    
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && goToPage(page)}
                        disabled={page === '...'}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : page === '...'
                            ? 'text-gray-400 cursor-default'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
