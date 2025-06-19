import { Routes, Route } from "react-router-dom"; 
import Layout from "../layout/Layout";
import AdminDashBoard from "../../pages/super Admin/admin Dashboard/AdminDashBoard";
import EmprDashboard from "../../pages/Employer/employer Dashboard/EmprDashboard";
import EmpList from "../../pages/Employer/employeeList/EmpList";
import EmpDashboard from "../../pages/employee/employee dashboard/EmpDashboard";
import EmpDetails from "../../pages/employee/EmpDetails/EmpDetails";
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

function AllRoutes() {
  return (
    <Routes>
      <Route>
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
        </Route>
      </Route>

      <Route>
        <Route path="/verifier" element={<Layout />}>
          <Route index element={<VerifierDashboard />} />
          <Route path="/verifier/Employees" element={<EmployeesCaseDetails />} />
          <Route path="/verifier/view" element={<CaseView/>}/>
          <Route path="/verifier/companies" element={<CompaniesCaseDetails />} />
          <Route path="/verifier/companyCase" element={<CompanyCaseView />} />
          <Route path="/verifier/notes" element={<Notes/>}/>
          <Route path="/verifier/communication" element={<Communication/>}/>
        </Route>
      </Route>

      <Route>
        <Route path="/employer" element={<Layout />}>
          <Route index element={<EmprDashboard />} />
          <Route path="/employer/list" element={<EmpList />} />
        </Route>
      </Route>

      <Route>
        <Route path="/employee" element={<Layout />}>
          <Route index element={<EmpDashboard />} />
          <Route path="/employee/employdetails" element={<EmpDetails />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AllRoutes;


// import { Routes, Route } from "react-router-dom";
// import Layout from "../layout/Layout";
// import AdminDashBoard from "../../pages/super Admin/admin Dashboard/AdminDashBoard";
// import Billing from "../../pages/super Admin/billings/Billing";
// import VfrDashBoard from "../../pages/verifier/vfrDashBoard/VfrDashBoard";
// import VerifiyPage from "../../pages/verifier/verifiy page/VerifiyPage";
// import EmprDashboard from "../../pages/Employer/employer Dashboard/EmprDashboard";
// import EmpList from "../../pages/Employer/employeeList/EmpList";
// import EmpDashboard from "../../pages/employee/employee dashboard/EmpDashboard";
// import EmpDetails from "../../pages/employee/EmpDetails/EmpDetails";

// function AllRoutes() {
//   return (
//     <Routes>
//       {/* Admin Routes */}
//       <Route path="/admin" element={<Layout />}>
//         <Route index element={<AdminDashBoard />} />
//         <Route path="billing" element={<Billing />} />
//       </Route>

//       {/* Verifier Routes */}
//       <Route path="/veifier" element={<Layout />}>
//         <Route index element={<VfrDashBoard />} />
//         <Route path="verify" element={<VerifiyPage />} />
//       </Route>

//       {/* Employer Routes */}
//       <Route path="/employer" element={<Layout />}>
//         <Route index element={<EmprDashboard />} />
//         <Route path="list" element={<EmpList />} />
//       </Route>

//       {/* Employee Routes */}
//       <Route path="/employee" element={<Layout />}>
//         <Route index element={<EmpDashboard />} />
//         <Route path="employdetails" element={<EmpDetails />} />
//       </Route>
//     </Routes>
//   );
// }

// export default AllRoutes;
