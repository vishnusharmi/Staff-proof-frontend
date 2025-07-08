import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { UserContext } from "../context/UseContext";

import Layout from "../layout/Layout";
import AdminDashBoard from "../../pages/super Admin/admin Dashboard/AdminDashBoard";
import EmprDashboard from "../../pages/Employer/employer Dashboard/EmprDashboard";
import Blacklist from "../../pages/Employer/Blacklist/Blacklist";
import EmpDashboard from "../../pages/employee/employee dashboard/EmpDashboard";
import EmployeeManagement from "../../pages/super Admin/employee management/EmployeeManagement";
import EmployeeDetails from "../../pages/super Admin/employee details/EmployeeDetails";
import EmployerManagement from "../../pages/super Admin/employer mangement/EmployerManagement";
import EmployerDetails from "../../pages/super Admin/employer details/EmployerDetails";
import PaymentsBilling from "../../pages/super Admin/billings/PaymentsBilling";
import BlacklistManagement from "../../pages/super Admin/blacklistManagement/BlacklistManagement";
import AccessRequest from "../../pages/super Admin/accessRequestManagement/AccessRequest";
import AuditLogs from "../../pages/super Admin/auditLogs Management/AuditLogs";
import VerifierDashboard from "../../pages/verifier/vfrDashBoard/VerifierDashboard";
import EmployeesCaseDetails from "../../pages/verifier/employees/EmployeesCaseDetails";
import CaseView from "../../pages/verifier/employees/CaseView";
import EmployeeVerification from "../../pages/verifier/employees/EmployeeVerification";
import CompaniesCaseDetails from "../../pages/verifier/companies/CompaniesCaseDetails";
import CompanyCaseView from "../../pages/verifier/companies/CompanyCaseView";
import Notes from "../../pages/verifier/notes/Notes";
import Communication from "../../pages/verifier/Communication/Communication";
import CaseAssign from "../../pages/super Admin/caseAssign/CaseAssign";
import EmployeeTable from "../../pages/Employer/employeeList/EmployeeTable";
import AddEmployee from "../../pages/Employer/employeeList/AddEmployee";
import EmployerSearch from "../../pages/Employer/employeeList/EmployeeSearch";
import SubscriptionBilling from "../../pages/Employer/billings/SubscriptionBilling";
import EmployeeVerificationSystem from "../../pages/Employer/verification/EmployeeVerificationSystem";
import Login from "../Login/Login";
import Profile from "../../pages/employee/empDetails/Profile";
import JobHistory from "../../pages/employee/empDetails/JobHistory";
import DocumentCenter from "../../pages/employee/empDetails/DocumentCenter";
import Permissions from "../../pages/employee/empDetails/Permissions";
import Addons from "../../pages/employee/empDetails/AddOns";
import Billing from "../../pages/employee/empDetails/Billing";
import Notifications from "../../pages/employee/empDetails/Notifications";
import Settings from "../../pages/employee/empDetails/SettingsPage";
import CompanyProfileManagement from "../../pages/Employer/companyProfile/CompanyProfileManagement";
import PlansScreen from "../../pages/Employer/plans page/PlansScreen";
import EmployerNotifications from "../../pages/Employer/Notifications";
import VerifierNotifications from "../../pages/verifier/Notifications";
import NotificationManagement from "../../pages/super Admin/notificationManagement/NotificationManagement";

function AllRoutes() {
  const { user, token } = useContext(UserContext);

  console.log("AllRoutes rendered with:", { user, token, hasToken: !!token });

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? (
            <Navigate
              to={
                user?.role === "Admin"
                  ? "/admin"
                  : user?.role === "Employer"
                  ? "/employer"
                  : user?.role === "Verifier"
                  ? "/verifier"
                  : user?.role === "Employee"
                  ? "/employee"
                  : "/login"
              }
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      {/* Admin Routes */}
      <Route path="/admin" element={<Layout />}>
        <Route index element={<AdminDashBoard />} />
        <Route path="employerManagement" element={<EmployerManagement />} />
        <Route path="employerDetails" element={<EmployerDetails />} />
        <Route path="employees" element={<EmployeeManagement />} />
        <Route path="details" element={<EmployeeDetails />} />
        <Route path="blacklist" element={<BlacklistManagement />} />
        <Route path="accessrequest" element={<AccessRequest />} />
        <Route path="logs" element={<AuditLogs />} />
        <Route path="billing" element={<PaymentsBilling />} />
        <Route path="assign" element={<CaseAssign />} />
        <Route path="notifications" element={<NotificationManagement />} />
      </Route>

      {/* Verifier Routes */}
      <Route path="/verifier" element={<Layout />}>
        <Route index element={<VerifierDashboard />} />
        <Route path="employees" element={<EmployeesCaseDetails />} />
        <Route path="view" element={<CaseView />} />
        <Route path="verification/:caseId" element={<EmployeeVerification />} />
        <Route path="companies" element={<CompaniesCaseDetails />} />
        <Route path="companyCase" element={<CompanyCaseView />} />
        <Route path="notes" element={<Notes />} />
        <Route path="communication" element={<Communication />} />
        <Route path="notifications" element={<VerifierNotifications />} />
      </Route>

      {/* Employer Routes */}
      <Route path="/employer" element={<Layout />}>
        <Route index element={<EmprDashboard />} />
        <Route path="employees" element={<EmployeeTable />} />
        <Route path="onboarding" element={<AddEmployee />} />
        <Route path="search" element={<EmployerSearch />} />
        <Route path="blacklist" element={<Blacklist />} />
        <Route path="billings" element={<SubscriptionBilling />} />
        <Route path="verifications" element={<EmployeeVerificationSystem />} />
        <Route path="profile" element={<CompanyProfileManagement />} />
        <Route path="plans" element={<PlansScreen />} />
        <Route path="notifications" element={<EmployerNotifications />} />
      </Route>

      {/* Employee Routes */}
      <Route path="/employee" element={<Layout />}>
        <Route index element={<EmpDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="job-history" element={<JobHistory />} />
        <Route path="documents" element={<DocumentCenter />} />
        <Route path="permissions" element={<Permissions />} />
        <Route path="addons" element={<Addons />} />
        <Route path="billing" element={<Billing />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Catch all route - redirect to login if not authenticated */}
      <Route
        path="*"
        element={
          token ? (
            <Navigate
              to={
                user?.role === "Admin"
                  ? "/admin"
                  : user?.role === "Employer"
                  ? "/employer"
                  : user?.role === "Verifier"
                  ? "/verifier"
                  : user?.role === "Employee"
                  ? "/employee"
                  : "/login"
              }
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default AllRoutes;
