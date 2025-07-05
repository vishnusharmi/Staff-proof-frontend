import React, { useState, useEffect } from "react";
import { Check, Star, Shield, Edit, Crown, Zap, AlertCircle } from "lucide-react";
import { fetchAddOns, purchaseAddOn, fetchDashboard } from '../../../components/api/api';

const PlansScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [addOnServices, setAddOnServices] = useState([]);
  const [purchasing, setPurchasing] = useState(false);

  // Fetch current subscription and add-ons on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch current subscription from dashboard
        const dashboardResponse = await fetchDashboard('employer');
        if (dashboardResponse.data?.subscription) {
          setCurrentSubscription(dashboardResponse.data.subscription);
        }
        
        // Fetch available add-ons
        const addOnsResponse = await fetchAddOns();
        setAddOnServices(addOnsResponse.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load subscription data');
        console.error('Error fetching subscription data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBuyNow = async (planName, amount) => {
    try {
      setPurchasing(true);
      setError(null);
      
      // In a real application, you would:
      // 1. Create a payment session with your backend
      // 2. Get the actual payment URL from payment gateway
      // 3. Include order details, amount, etc.
      
      // For now, we'll simulate the payment process
      const paymentUrl = `https://payment-gateway.com/pay?plan=${encodeURIComponent(planName)}&amount=${amount}&merchant_id=YOUR_MERCHANT_ID`;
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to payment gateway
      window.open(paymentUrl, "_blank");
      
      alert(`Redirecting to payment gateway for ${planName} plan`);
    } catch (err) {
      setError(err.message || 'Failed to process payment');
      console.error('Error processing payment:', err);
    } finally {
      setPurchasing(false);
    }
  };

  const handlePurchaseAddOn = async (addOnId) => {
    try {
      setPurchasing(true);
      setError(null);
      
      const response = await purchaseAddOn(addOnId);
      
      // Update add-ons list to reflect purchase
      setAddOnServices(prev => prev.map(addon => 
        addon.id === addOnId 
          ? { ...addon, purchased: true }
          : addon
      ));
      
      alert('Add-on purchased successfully!');
    } catch (err) {
      setError(err.message || 'Failed to purchase add-on');
      console.error('Error purchasing add-on:', err);
    } finally {
      setPurchasing(false);
    }
  };

  const subscriptionPlans = [
    {
      id: "basic",
      name: "Basic Plan",
      price: 9999,
      duration: "Annual",
      employees: 50,
      color: "from-blue-500 to-blue-600",
      features: [
        "50 Employee Lookups",
        "Basic Verification",
        "Document Access Requests",
        "Blacklist Management",
        "Email Support",
      ],
      icon: <Shield className="w-8 h-8" />,
      popular: false,
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: 19999,
      duration: "Annual",
      employees: 250,
      color: "from-purple-500 to-purple-600",
      features: [
        "250 Employee Lookups",
        "Advanced Verification",
        "Priority Document Access",
        "Enhanced Blacklist Features",
        "Priority Support",
        "Analytics Dashboard",
      ],
      icon: <Crown className="w-8 h-8" />,
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      price: 49999,
      duration: "Annual",
      employees: "Unlimited",
      color: "from-orange-500 to-red-600",
      features: [
        "Unlimited Employee Lookups",
        "Premium Verification",
        "Instant Document Access",
        "Advanced Analytics",
        "Dedicated Account Manager",
        "Custom Integrations",
        "White-label Solutions",
      ],
      icon: <Zap className="w-8 h-8" />,
      popular: false,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            StaffProof Add-ons & Plans
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your organization and enhance your
            experience with our premium add-ons
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle size={18} className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Subscription Status */}
        {currentSubscription && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Current Subscription
                  </h3>
                  <p className="text-gray-600">
                    {currentSubscription.plan} Plan • Expires on {new Date(currentSubscription.validUntil).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{currentSubscription.employees}</div>
                  <div className="text-gray-600">Used Lookups</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{currentSubscription.employeeLimit - currentSubscription.employees}</div>
                  <div className="text-gray-600">Remaining</div>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Subscription Plans
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan) => {
              const isCurrentPlan = currentSubscription?.plan === plan.id;
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                    plan.popular ? "ring-4 ring-purple-500" : ""
                  } ${isCurrentPlan ? "ring-4 ring-green-500" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                      Most Popular
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2 text-sm font-semibold">
                      Current Plan
                    </div>
                  )}

                  <div
                    className={`bg-gradient-to-r ${plan.color} p-6 text-white ${
                      plan.popular || isCurrentPlan ? "pt-12" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center mb-4">
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-center mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-center">
                      <span className="text-4xl font-bold">
                        ₹{plan.price.toLocaleString()}
                      </span>
                      <span className="text-lg opacity-90">/{plan.duration}</span>
                    </div>
                    <p className="text-center mt-2 opacity-90">
                      {typeof plan.employees === "number"
                        ? `${plan.employees} employees`
                        : plan.employees}
                    </p>
                  </div>

                  <div className="p-6">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleBuyNow(plan.name, plan.price)}
                      disabled={isCurrentPlan || purchasing}
                      className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${plan.color} hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {purchasing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        "Current Plan"
                      ) : (
                        "Buy Now"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add-on Services */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Premium Add-on Services
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {addOnServices.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No add-on services available at the moment.</p>
              </div>
            ) : (
              addOnServices.map((addon) => (
                <div
                  key={addon.id}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105"
                >
                  <div className={`bg-gradient-to-r ${addon.color || 'from-green-500 to-green-600'} p-6 text-white`}>
                    <div className="flex items-center justify-center mb-4">
                      {addon.icon || <Edit className="w-8 h-8" />}
                    </div>
                    <h3 className="text-xl font-bold text-center mb-2">
                      {addon.name}
                    </h3>
                    <div className="text-center">
                      <span className="text-3xl font-bold">
                        ₹{addon.price?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 mb-4 text-center">
                      {addon.description || 'Premium add-on service'}
                    </p>
                    
                    <ul className="space-y-3 mb-6">
                      {(addon.features || []).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePurchaseAddOn(addon.id)}
                      disabled={addon.purchased || purchasing}
                      className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${addon.color || 'from-green-500 to-green-600'} hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {purchasing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                          Processing...
                        </>
                      ) : addon.purchased ? (
                        "Purchased"
                      ) : (
                        "Purchase Add-on"
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansScreen;