import { useState } from "react";
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
} from "lucide-react";

export default function SubscriptionBilling() {
  // State for subscription data
  const [subscription, setSubscription] = useState({
    currentPlan: "pro",
    validUntil: "2025-05-29",
    employees: 180,
    employeeLimit: 250,
    autoRenew: true,
  });

  // State for invoice data
  const [invoices, setInvoices] = useState([
    {
      id: "INV-2025-04-29",
      date: "Apr 29, 2025",
      plan: "Pro Plan",
      amount: "₹19,999",
      status: "Paid",
      downloadUrl: "#",
    },
    {
      id: "INV-2024-10-29",
      date: "Oct 29, 2024",
      plan: "Pro Plan",
      amount: "₹19,999",
      status: "Paid",
      downloadUrl: "#",
    },
    {
      id: "INV-2024-04-29",
      date: "Apr 29, 2024",
      plan: "Basic Plan",
      amount: "₹9,999",
      status: "Paid",
      downloadUrl: "#",
    },
  ]);

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
    },
  };

  // Get days remaining until subscription expiry
  const calculateDaysRemaining = () => {
    const today = new Date();
    const expiryDate = new Date(subscription.validUntil);
    const timeDiff = expiryDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const daysRemaining = calculateDaysRemaining();
  const currentPlan = plans[subscription.currentPlan];
  const employeePercentage =
    (subscription.employees / subscription.employeeLimit) * 100;
  const shouldUpgrade = employeePercentage > 80;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <CreditCard className="mr-3 text-indigo-600" size={28} />
            Subscription & Billing
          </h1>
        </div>

        {/* Current Plan Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">
                  Current Subscription
                </h2>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl ${currentPlan.color}`}
                  >
                    {currentPlan.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {currentPlan.name} Plan
                    </h3>
                    <p className="text-gray-600">
                      {currentPlan.price} for {currentPlan.employeeLimit}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 font-medium flex items-center">
                        <Calendar size={16} className="mr-2 text-indigo-500" />
                        Plan Validity
                      </span>
                      <span className="text-indigo-600 font-semibold">
                        {daysRemaining} days remaining
                      </span>
                    </div>
                    <div className="text-gray-800">
                      Expires on{" "}
                      {new Date(subscription.validUntil).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </div>
                    <div className="mt-2 text-sm">
                      <span
                        className={`${
                          subscription.autoRenew
                            ? "text-green-600"
                            : "text-amber-600"
                        } font-medium flex items-center`}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Auto-renewal{" "}
                        {subscription.autoRenew ? "enabled" : "disabled"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 font-medium flex items-center">
                        <Clock size={16} className="mr-2 text-indigo-500" />
                        Employee Usage
                      </span>
                      <span
                        className={`${
                          shouldUpgrade ? "text-amber-600" : "text-indigo-600"
                        } font-semibold`}
                      >
                        {subscription.employees} / {subscription.employeeLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className={`h-2.5 rounded-full ${
                          shouldUpgrade ? "bg-amber-500" : "bg-indigo-600"
                        }`}
                        style={{
                          width: `${Math.min(employeePercentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                    {shouldUpgrade && (
                      <div className="mt-2">
                        <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-all duration-200 flex items-center justify-center">
                          <AlertCircle size={16} className="mr-2" />
                          Upgrade Plan
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Plan Features
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle
                          size={16}
                          className="mr-2 text-green-500 mt-0.5 flex-shrink-0"
                        />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white">
                  Available Plans
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {Object.keys(plans).map((planKey) => {
                    const plan = plans[planKey];
                    const isCurrentPlan = planKey === subscription.currentPlan;

                    return (
                      <div
                        key={planKey}
                        className={`p-4 rounded-xl border-2 transition-all duration-200
                          ${
                            isCurrentPlan
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${plan.color}`}
                            >
                              {plan.name.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <h3 className="font-bold text-gray-800">
                                {plan.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {plan.employeeLimit}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-800">
                              {plan.price}
                            </div>
                            {isCurrentPlan && (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center mt-4">
                    Compare Plans
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FileText className="mr-2" size={20} />
              Payment History
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {invoice.plan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <a
                        href={invoice.downloadUrl}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <Download size={16} className="mr-1" />
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {invoices.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No payment history available.</p>
            </div>
          ) : (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {invoices.length} entries
                </div>
                <div className="flex items-center">
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    View All Invoices
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-indigo-600 bg-opacity-10 rounded-2xl p-6 border border-indigo-100">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="bg-indigo-100 rounded-lg p-2">
                <AlertCircle className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-800">
                Need help with your subscription?
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                If you have any questions about your current plan or billing,
                please contact our support team.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
