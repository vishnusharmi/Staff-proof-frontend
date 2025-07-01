// import { Routes, Route } from "react-router-dom"; 
// import Layout from "../layout/Layout";
// import AdminDashBoard from "../../pages/super Admin/admin Dashboard/AdminDashBoard";
// import EmprDashboard from "../../pages/Employer/employer Dashboard/EmprDashboard";
// import Blacklist from "../../pages/Employer/Blacklist/Blacklist";
// import EmpDashboard from "../../pages/employee/employee dashboard/EmpDashboard";
// import EmpDetails from "../../pages/employee/EmpDetails/EmpDetails";
// import EmployeeManagement from "../../pages/super Admin/employee management/EmployeeManagement";
// import EmployeeDetails from "../../pages/super Admin/employee details/EmployeeDetails";
// import EmployerManagement from "../../pages/super Admin/employer mangement/EmployerManagement";
// import EmployerDetails from "../../pages/super Admin/employer details/EmployerDetails";
// import PaymentsBilling from "../../pages/super Admin/billings/PaymentsBilling";
// import BlacklistManagement from "../../pages/super Admin/blacklistManagement/BlacklistManagement";
// import AccessRequest from "../../pages/super Admin/accessRequestManagement/AccessRequest";
// import AuditLogs from "../../pages/super Admin/auditLogs Management/AuditLogs";
// import VerifierDashboard from "../../pages/verifier/vfrDashBoard/VerifierDashboard";
// import EmployeesCaseDetails from "../../pages/verifier/employees/EmployeesCaseDetails";
// import CaseView from "../../pages/verifier/employees/CaseView";
// import CompaniesCaseDetails from "../../pages/verifier/companies/CompaniesCaseDetails";
// import CompanyCaseView from "../../pages/verifier/companies/CompanyCaseView";
// import Notes from "../../pages/verifier/notes/Notes";
// import Communication from "../../pages/verifier/Communication/Communication";
// import CaseAssign from "../../pages/super Admin/caseAssign/CaseAssign";
// import EmployeeTable from "../../pages/Employer/employeeList/EmployeeTable";
// import AddEmployee from "../../pages/Employer/employeeList/AddEmployee";
// import EmployerSearch from "../../pages/Employer/employeeList/EmployeeSearch";
// import SubscriptionBilling from "../../pages/Employer/billings/SubscriptionBilling";
// import EmployeeVerificationSystem from "../../pages/Employer/verification/EmployeeVerificationSystem";
// import Login from "../Login/Login";


// function AllRoutes() {
//   return (
//     <Routes>
//       <Route
//         index
//         path="/"
//         element={
//           token ? (
//             <Navigate
//               to={
//                 auth.role === "Admin"
//                   ? "/admin"
//                   : auth.role === "Employer"
//                   ? "/employer"
//                   : auth.role === "Verifier"
//                   ? "/verifier"
//                   : auth.role === "Employee"
//                   ? "/employee"
//                   : "/login"
//               }
//               replace
//             />
//           ) : (
//             <Login />
//           )
//         }
//       />

//       <Route>
//         <Route path="/admin" element={<Layout />}>
//           <Route index element={<AdminDashBoard />} />
//           <Route
//             path="/admin/employerManagement"
//             element={<EmployerManagement />}
//           />
//           <Route path="/admin/employerDetails" element={<EmployerDetails />} />
//           <Route path="/admin/employees" element={<EmployeeManagement />} />
//           <Route path="/admin/details" element={<EmployeeDetails />} />
//           <Route path="/admin/blacklist" element={<BlacklistManagement />} />
//           <Route path="/admin/accessrequest" element={<AccessRequest />} />
//           <Route path="/admin/logs" element={<AuditLogs />} />
//           <Route path="/admin/billing" element={<PaymentsBilling />} />
//           <Route path="/admin/assign" element={<CaseAssign />} />
//         </Route>
//       </Route>

//       <Route>
//         <Route path="/verifier" element={<Layout />}>
//           <Route index element={<VerifierDashboard />} />
//           <Route
//             path="/verifier/Employees"
//             element={<EmployeesCaseDetails />}
//           />
//           <Route path="/verifier/view" element={<CaseView />} />
//           <Route
//             path="/verifier/companies"
//             element={<CompaniesCaseDetails />}
//           />
//           <Route path="/verifier/companyCase" element={<CompanyCaseView />} />
//           <Route path="/verifier/notes" element={<Notes />} />
//           <Route path="/verifier/communication" element={<Communication />} />
//         </Route>
//       </Route>

//       <Route>
//         <Route path="/employer" element={<Layout />}>
//           <Route index element={<EmprDashboard />} />
//           <Route path="/employer/employees" element={<EmployeeTable />} />
//           <Route path="/employer/onboarding" element={<AddEmployee />} />
//           <Route path="/employer/search" element={<EmployerSearch />} />
//           <Route path="/employer/blacklist" element={<Blacklist />} />
//           <Route path="/employer/billings" element={<SubscriptionBilling />} />
//           <Route
//             path="/employer/verifications"
//             element={<EmployeeVerificationSystem />}
//           />
//         </Route>
//       </Route>

//       <Route>
//         <Route path="/employee" element={<Layout />}>
//           <Route index element={<EmpDashboard />} />
//           <Route path="/employee/employdetails" element={<EmpDetails />} />
//         </Route>
//       </Route>
//     </Routes>
//   );
// }

// export default AllRoutes;



import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { UserContext } from "../../components/context/UseContext";

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
import Notifications from "../../pages/employee/empDetails/Notifications"
import Settings from "../../pages/employee/empDetails/SettingsPage"
import CompanyProfileManagement from "../../pages/Employer/companyProfile/CompanyProfileManagement";
import PlansScreen from "../../pages/Employer/plans page/PlansScreen";



function AllRoutes() {
 const user = useContext(UserContext)
  console.log(user.user);
  

  return (
    <Routes>
      <Route
        index
        path="/"
        element={
          user?.user ? (
            <Navigate
              to={
                user.user.role === "Admin"
                  ? "/admin"
                  : user.user.role === "Employer"
                  ? "/employer"
                  : user.user.role === "Verifier"
                  ? "/verifier"
                  : user.user.role === "Employee"
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

      <Route path="/login" element={<Login />} />
      {/* Admin Routes */}
      {/* <Route> */}
      <Route path="/admin" element={<Layout />}>
        <Route index element={<AdminDashBoard />} />
        <Route
          path="/admin/employerManagement"
          element={<EmployerManagement />}
        />
        <Route path="/admin/employerDetails" element={<EmployerDetails />} />
        <Route path="/admin/employees" element={<EmployeeManagement />} />
        <Route path="/admin/details" element={<EmployeeDetails />} />
        <Route path="/admin/blacklist" element={<BlacklistManagement />} />
        <Route path="/admin/accessrequest" element={<AccessRequest />} />
        <Route path="/admin/logs" element={<AuditLogs />} />
        <Route path="/admin/billing" element={<PaymentsBilling />} />
        <Route path="/admin/assign" element={<CaseAssign />} />
      </Route>
      {/* </Route> */}

      {/* Verifier Routes */}
      {/* <Route> */}
      <Route path="/verifier" element={<Layout />}>
        <Route index element={<VerifierDashboard />} />
        <Route path="/verifier/Employees" element={<EmployeesCaseDetails />} />
        <Route path="/verifier/view" element={<CaseView />} />
        <Route path="/verifier/companies" element={<CompaniesCaseDetails />} />
        <Route path="/verifier/companyCase" element={<CompanyCaseView />} />
        <Route path="/verifier/notes" element={<Notes />} />
        <Route path="/verifier/communication" element={<Communication />} />
      </Route>
      {/* </Route> */}

      {/* Employer Routes */}
      {/* <Route> */}
      <Route path="/employer" element={<Layout />}>
        <Route index element={<EmprDashboard />} />
        <Route path="/employer/employees" element={<EmployeeTable />} />
        <Route path="/employer/onboarding" element={<AddEmployee />} />
        <Route path="/employer/search" element={<EmployerSearch />} />
        <Route path="/employer/blacklist" element={<Blacklist />} />
        <Route path="/employer/billings" element={<SubscriptionBilling />} />
        <Route
          path="/employer/verifications"
          element={<EmployeeVerificationSystem />}
        />
        <Route path="/employer/profile" element={<CompanyProfileManagement/>}/>
        <Route path="/employer/plans" element={<PlansScreen/>}/>
      </Route>
      {/* </Route> */}

      {/* Employee Routes */}
      {/* <Route> */}
      <Route path="/employee" element={<Layout />}>
        <Route index element={<EmpDashboard />} />
        <Route path="/employee/profile" element={<Profile />} />
        <Route path="/employee/job-history" element={<JobHistory />} />
        <Route path="/employee/documents" element={<DocumentCenter />} />
        <Route path="/employee/permissions" element={<Permissions />} />
        <Route path="/employee/add-ons" element={<Addons />} />
        <Route path="/employee/billing" element={<Billing />} />
        <Route path="/employee/notifications" element={<Notifications />} />
        <Route path="/employee/settings" element={<Settings />} />
      </Route>
      {/* </Route> */}
    </Routes>
  );
}

export default AllRoutes;
