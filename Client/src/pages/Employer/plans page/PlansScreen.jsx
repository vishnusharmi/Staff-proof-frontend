// import React, { useState } from "react";
// import { Check, Star, Users, Zap, Shield, Clock } from "lucide-react";

// const PlansScreen = () => {
//   const [currentPlan, setCurrentPlan] = useState("Basic"); // Current user's plan
//   const [billingCycle, setBillingCycle] = useState("annual");

//   const plans = [
//     {
//       name: "Basic",
//       price: 9999,
//       employees: 50,
//       popular: false,
//       features: [
//         "Up to 50 employee lookups",
//         "Basic employee verification",
//         "Document access requests",
//         "Blacklist management",
//         "Email support",
//         "Basic reporting",
//       ],
//       color: "blue",
//     },
//     {
//       name: "Pro",
//       price: 19999,
//       employees: 250,
//       popular: true,
//       features: [
//         "Up to 250 employee lookups",
//         "Advanced employee verification",
//         "Priority document access",
//         "Advanced blacklist management",
//         "Phone & email support",
//         "Detailed analytics",
//         "Export capabilities",
//         "Priority verification",
//       ],
//       color: "purple",
//     },
//     {
//       name: "Enterprise",
//       price: 49999,
//       employees: "Unlimited",
//       popular: false,
//       features: [
//         "Unlimited employee lookups",
//         "Premium verification service",
//         "Instant document access",
//         "Advanced blacklist analytics",
//         "Dedicated account manager",
//         "Custom integrations",
//         "API access",
//         "White-label options",
//         "SLA guarantee",
//       ],
//       color: "emerald",
//     },
//   ];

//   const handleUpgrade = (planName) => {
//     // Handle plan upgrade logic
//     console.log(`Upgrading to ${planName} plan`);
//   };

//   const PlanCard = ({ plan }) => {
//     const isCurrentPlan = plan.name === currentPlan;
//     const colorClasses = {
//       blue: {
//         border: "border-blue-200",
//         button: "bg-blue-600 hover:bg-blue-700",
//         badge: "bg-blue-100 text-blue-800",
//         accent: "text-blue-600",
//       },
//       purple: {
//         border: "border-purple-200",
//         button: "bg-purple-600 hover:bg-purple-700",
//         badge: "bg-purple-100 text-purple-800",
//         accent: "text-purple-600",
//       },
//       emerald: {
//         border: "border-emerald-200",
//         button: "bg-emerald-600 hover:bg-emerald-700",
//         badge: "bg-emerald-100 text-emerald-800",
//         accent: "text-emerald-600",
//       },
//     };

//     const colors = colorClasses[plan.color];

//     return (
//       <div
//         className={`relative bg-white rounded-xl shadow-lg ${
//           colors.border
//         } border-2 p-6 ${
//           plan.popular ? "ring-2 ring-purple-500 ring-opacity-50" : ""
//         }`}
//       >
//         {plan.popular && (
//           <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
//             <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
//               <Star className="w-4 h-4" />
//               Most Popular
//             </span>
//           </div>
//         )}

//         {isCurrentPlan && (
//           <div className="absolute top-4 right-4">
//             <span
//               className={`${colors.badge} px-3 py-1 rounded-full text-sm font-semibold`}
//             >
//               Current Plan
//             </span>
//           </div>
//         )}

//         <div className="text-center mb-6">
//           <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
//           <div className="mb-4">
//             <span className="text-4xl font-bold text-gray-900">
//               ₹{plan.price.toLocaleString("en-IN")}
//             </span>
//             <span className="text-gray-600 ml-1">/year</span>
//           </div>
//           <div
//             className={`inline-flex items-center gap-2 ${colors.accent} font-semibold`}
//           >
//             <Users className="w-5 h-5" />
//             {typeof plan.employees === "number"
//               ? `Up to ${plan.employees}`
//               : plan.employees}{" "}
//             employees
//           </div>
//         </div>

//         <ul className="space-y-3 mb-8">
//           {plan.features.map((feature, index) => (
//             <li key={index} className="flex items-start gap-3">
//               <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//               <span className="text-gray-700">{feature}</span>
//             </li>
//           ))}
//         </ul>

//         <button
//           onClick={() => handleUpgrade(plan.name)}
//           disabled={isCurrentPlan}
//           className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
//             isCurrentPlan
//               ? "bg-gray-100 text-gray-500 cursor-not-allowed"
//               : `${colors.button} text-white`
//           }`}
//         >
//           {isCurrentPlan ? "Current Plan" : `Upgrade to ${plan.name}`}
//         </button>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             Choose Your Plan
//           </h1>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             Select the perfect plan for your business needs. Scale your employee
//             verification process with our comprehensive solutions.
//           </p>
//         </div>

//         {/* Current Plan Status */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <div className="flex items-center justify-between flex-wrap gap-4">
//             <div className="flex items-center gap-4">
//               <div className="bg-blue-100 p-3 rounded-full">
//                 <Shield className="w-6 h-6 text-blue-600" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Current Subscription
//                 </h3>
//                 <p className="text-gray-600">
//                   {currentPlan} Plan • Expires on March 15, 2026
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-6 text-sm">
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-gray-900">32</div>
//                 <div className="text-gray-600">Used Lookups</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-gray-900">18</div>
//                 <div className="text-gray-600">Remaining</div>
//               </div>
//               <div className="flex items-center gap-2 text-green-600">
//                 <Clock className="w-4 h-4" />
//                 <span>Active</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Plans Grid */}
//         <div className="grid md:grid-cols-3 gap-8 mb-12">
//           {plans.map((plan) => (
//             <PlanCard key={plan.name} plan={plan} />
//           ))}
//         </div>

//         {/* Features Comparison */}
//         <div className="bg-white rounded-lg shadow-md p-8">
//           <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
//             Why Choose Our Plans?
//           </h2>
//           <div className="grid md:grid-cols-3 gap-8">
//             <div className="text-center">
//               <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//                 <Zap className="w-8 h-8 text-blue-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 Fast Verification
//               </h3>
//               <p className="text-gray-600">
//                 Quick employee background checks and document verification
//                 process.
//               </p>
//             </div>
//             <div className="text-center">
//               <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//                 <Shield className="w-8 h-8 text-purple-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 Secure Platform
//               </h3>
//               <p className="text-gray-600">
//                 Bank-level security with encrypted data storage and access
//                 controls.
//               </p>
//             </div>
//             <div className="text-center">
//               <div className="bg-emerald-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//                 <Users className="w-8 h-8 text-emerald-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 Scalable Solution
//               </h3>
//               <p className="text-gray-600">
//                 Grow from small teams to enterprise-wide employee management.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Contact Section */}
//         <div className="text-center mt-12">
//           <p className="text-gray-600 mb-4">
//             Need a custom plan for your organization?
//           </p>
//           <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
//             Contact Sales
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlansScreen;





import React, { useState } from "react";
import { Check, Star, Shield, Edit, Crown, Zap } from "lucide-react";

const PlansScreen = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Mock AU Bank payment URL - replace with actual payment gateway URL
  const auBankPaymentUrl = "https://www.aubank.in/payment-gateway";

  const handleBuyNow = (planName, amount) => {
    // In a real application, you would:
    // 1. Create a payment session with your backend
    // 2. Get the actual payment URL from AU Bank
    // 3. Include order details, amount, etc.

    const paymentUrl = `${auBankPaymentUrl}?plan=${encodeURIComponent(
      planName
    )}&amount=${amount}&merchant_id=YOUR_MERCHANT_ID`;
    window.open(paymentUrl, "_blank");
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

  const addOnServices = [
    {
      id: "edit-profile",
      name: "Edit Profile Service",
      price: 699,
      description: "Professional profile editing and optimization service",
      features: [
        "Profile Review & Optimization",
        "Document Verification Support",
        "Professional Formatting",
        "24/7 Support for Changes",
        "Multiple Revision Rounds",
      ],
      icon: <Edit className="w-8 h-8" />,
      color: "from-green-500 to-green-600",
    },
    {
      id: "verification-badge",
      name: "Verification Badge",
      price: 699,
      description: "Premium verification badge for enhanced credibility",
      features: [
        "Verified Badge Display",
        "Enhanced Profile Visibility",
        "Trust Score Boost",
        "Priority in Search Results",
        "Verification Certificate",
      ],
      icon: <Star className="w-8 h-8" />,
      color: "from-amber-500 to-orange-600",
    },
  ];

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

        {/* Subscription Plans */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Subscription Plans
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                  plan.popular ? "ring-4 ring-purple-500" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div
                  className={`bg-gradient-to-r ${plan.color} p-6 text-white ${
                    plan.popular ? "pt-12" : ""
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
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${plan.color} hover:shadow-lg`}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add-on Services */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Premium Add-on Services
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {addOnServices.map((addon) => (
              <div
                key={addon.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105"
              >
                <div
                  className={`bg-gradient-to-r ${addon.color} p-6 text-white`}
                >
                  <div className="flex items-center justify-center mb-4">
                    {addon.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2">
                    {addon.name}
                  </h3>
                  <div className="text-center">
                    <span className="text-3xl font-bold">₹{addon.price}</span>
                    <span className="text-lg opacity-90">/service</span>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-6 text-center">
                    {addon.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {addon.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleBuyNow(addon.name, addon.price)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${addon.color} hover:shadow-lg`}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansScreen;