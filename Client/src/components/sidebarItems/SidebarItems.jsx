

import { Block, Dashboard, LockClock, Person } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import BadgeIcon from "@mui/icons-material/Badge";
import DescriptionIcon from "@mui/icons-material/Description";
import { NavLink } from "react-router-dom"; // ✅ use react-router-dom not "react-router"
import { useState, useContext } from "react";


const SidebarItems = ({ toggleMenu, handleToggle }) => {
  const [isLogoutModal, setIsLogoutModal] = useState(false);
//   const { logOut } = useContext(AuthContext); // ✅ logOut from context

  const role = "verifier"; 

  const adminMenuItems = [
    {
      name: "Dashboard",
      icon: <Dashboard className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
      path: "/admin",
    },
    {
      name: "Employer Management",
      icon: <BadgeIcon className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
      path: "/admin/employerManagement",
    },
    {
      name: "Employee Management",
      icon: <BadgeIcon className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
      path: "/admin/employees",
    },
    {
      name: "Blacklist Management",
      icon: <Block className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
      path: "/admin/blacklist",
    },
    {
      name: "Access Requests",
      icon: <LockClock className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
      path: "/admin/accessrequest",
    },
    {
      name: "Audit Logs",
      icon: <Block className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
      path: "/admin/logs",
    },
    {
      name: "Billings",
      icon: <BadgeIcon className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
      path: "/admin/billing",
    },
    // {
    //   name: "Disputes",
    //   icon: <Person className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
    //   path: "/admin/disputes",
    // },
  ];

  const verifierMenuItems = [
    {
      name: "Dashboard",
      icon: <Dashboard className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
      path: "/verifier",
    },
    {
      name: "Employees Cases",
      icon: <BadgeIcon className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
      path: "/verifier/employees",
    },
    {
      name: "Companies Cases",
      icon: <BadgeIcon className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
      path: "/verifier/companies",
    },
    {
      name: "Notes",
      icon: <BadgeIcon className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
      path: "/verifier/notes",
    },
    {
      name: "Communication",
      icon: <BadgeIcon className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
      path: "/verifier/communication",
    },
    // {
    //   name: "Disputes",
    //   icon: <Person className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
    //   path: "/verifier/disputes",
    // },
  ];

  const employerMenuItems = [
    {
      name: "Dashboard",
      icon: <Dashboard className="w-5 h-5 text-teal-400 cb1:w-6 cb1:h-6" />,
      path: "/employer/dashboard",
    },
    {
      name: "Employees Cases",
      icon: <BadgeIcon className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6" />,
      path: "/employer/employees",
    },
  ];

  const employeeMenuItems = [
    {
      name: "Dashboard",
      icon: <Dashboard className="w-5 h-5 text-teal-500 cb1:w-6 cb1:h-6" />,
      path: "/employee/dashboard",
    },
    {
      name: "Search",
      icon: <Person className="w-5 h-5 text-teal-500 cb1:w-6 cb1:h-6" />,
      path: "/employee/search",
    },
    {
      name: "Attendance",
      icon: (
        <DescriptionIcon className="w-5 h-5 text-teal-500 cb1:w-6 cb1:h-6" />
      ),
      path: "/employee/attendance",
    },
  ];

  // Choose menu based on role
  const items =
    role === "admin" ? adminMenuItems : role === "employer" ? employerMenuItems : role === "verifier" ? verifierMenuItems : employeeMenuItems;

  return (
    <>
      {/* Logout Confirmation Modal */}
      {isLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500/50 border-r-4 border-blue-500">
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-lg relative">
            <h2 className="text-lg font-semibold text-black">Confirm Logout</h2>
            <p className="text-gray-600 mt-2">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg text-black cursor-pointer"
                onClick={() => setIsLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg cursor-pointer"
                onClick={logOut}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Items */}
      <div className="flex flex-col items-start font-medium w-full">
        {items.map((item, index) =>
          item.path ? (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center p-4 gap-4 text-sm cursor-pointer transition-all w-full cb2:text-base border-y border-gray-300 ${
                  isActive
                    ? "bg-gray-200 text-black"
                    : "text-black hover:bg-gray-200"
                }`
              }
              onClick={() => {
                if (toggleMenu) handleToggle();
              }}
            >
              <div className="flex gap-4 h-max items-center justify-center">
                <span>{item.icon}</span>
                <span className="text-xs cb1:text-base">{item.name}</span>
              </div>
            </NavLink>
          ) : (
            <div
              key={index}
              className="flex items-center p-4 gap-4 text-sm text-gray-400 w-full"
            >
              {item.icon}
              {item.name}
            </div>
          )
        )}
      </div>

      {/* Logout Button */}
      <div className="w-full">
        <button
          onClick={() => setIsLogoutModal((prev) => !prev)}
          className="flex items-center px-5 py-4 gap-4 text-sm cb2:text-base text-black font-medium cursor-pointer hover:bg-gray-200 transition-all w-full hover:shadow-md"
        >
          <LogoutIcon className="w-5 h-5 text-teal-300 cb1:w-6 cb1:h-6 cursor-pointer" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
};

export default SidebarItems;
  