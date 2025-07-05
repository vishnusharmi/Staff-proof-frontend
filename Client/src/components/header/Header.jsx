import { useState, useRef, useEffect } from "react";
import logo from "../../assets/logo1.png";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useNavigate } from "react-router";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useContext } from "react";
// import { AuthContext } from "../Context/Contextapi.jsx";
import SidebarItems from "../SidebarItems/SidebarItems.jsx";
import { NotificationBell } from "../NotificationSystem";

const Header = () => {
//   const { auth } = useContext(AuthContext);
  const [toggleMenu, setToggleMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  // const [userName, setUserName] = useState(auth.name);
  // const [email, setEmail] = useState(auth.email);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  function handleToggle() {
    setToggleMenu(!toggleMenu);
  }

  function handleDropdown() {
    setShowDropdown(!showDropdown);
    setShowProfileEdit(false);
  }

  function handleProfileEdit() {
    setShowProfileEdit(true);
  }

  function handleSaveProfile(e) {
    e.preventDefault();
    const saveDetails = window.confirm(
      "Are you sure you want to update details?"
    );
    if (saveDetails) {
      const formData = new FormData(e.target);
      const newUserName = formData.get("userName");
      setUserName(newUserName);
      setShowProfileEdit(false);
      setShowDropdown(false);
    }
  }

  function handleCancelProfile() {
    setShowProfileEdit(false);
    setShowDropdown(false);
  }

  function handleSignOut() {
    const confirmSignOut = window.confirm("Are you sure you want to sign out?");
    if (confirmSignOut) {
      navigate("/");
    }
  }

  function handleProfilePicChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleIconClick() {
    fileInputRef.current.click();
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowProfileEdit(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="flex items-center justify-between p-2  text-black h-15 relative shadow">
        <div className="flex items-center gap-2">
          <div className="md:hidden mr-2 cursor-pointer" onClick={handleToggle}>
            {toggleMenu ? <CloseIcon /> : <MenuIcon />}
          </div>
          <img src={logo} alt="Logo" className="w-50 h-10 ml-2" />
        </div>

        <div className="relative flex items-center" ref={dropdownRef}>
          <NotificationBell />
          <button
            onClick={handleDropdown}
            className="hover:scale-[1.04] hover:bg-gray-200 font-bold text-black px-3 py-2 rounded-md cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <Avatar src={profilePic} sx={{ width: "30px", height: "30px" }} />
            <span className="hidden md:block">{userName || "User"}</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md py-2 z-50 transition ease-out duration-300">
              {!showProfileEdit ? (
                <>
                  <button
                    className="flex items-center font-semibold gap-2 px-4 py-2 w-full text-black hover:bg-gray-200 cursor-pointer"
                    onClick={handleProfileEdit}
                  >
                    <AccountCircleIcon fontSize="small" />
                    Your Profile
                  </button>
                  <button
                    className="flex items-center gap-2 font-bold px-4 py-2 w-full text-black hover:bg-gray-200 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <ExitToAppIcon fontSize="small" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="absolute right-0 top-0 w-auto md:w-72 sm:w-56 h-auto bg-white shadow-lg rounded-lg z-50 border border-gray-200 transition ease-out duration-300">
                  <div className="bg-white text-center py-4 rounded-t-lg border-b border-gray-300">
                    <span className="text-lg font-semibold">{userName}</span>
                  </div>
                  <div className="flex flex-col items-center p-6 relative">
                    <div className="relative w-16 h-16">
                      <Avatar src={profilePic} sx={{ width: 60, height: 60 }} />
                      <button
                        onClick={handleIconClick}
                        className="absolute bottom-0 right-0 bg-gray-300 p-1.5 rounded-full hover:bg-gray-400 flex items-center justify-center"
                      >
                        <CameraAltIcon
                          className="text-black"
                          fontSize="small"
                        />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleProfilePicChange}
                      />
                    </div>
                    <span className="text-gray-600 mt-2">{email}</span>
                  </div>
                  <div className="px-4 pb-4">
                    <form onSubmit={handleSaveProfile}>
                      <label className="block text-sm font-medium text-black">
                        Full Name :
                      </label>
                      <input
                        type="text"
                        name="userName"
                        placeholder="Enter New Name"
                        className="w-full p-2 border border-gray-300 bg-white rounded-md text-black mt-3"
                      />
                      <div className="flex justify-evenly mt-4">
                        <button
                          onClick={handleCancelProfile}
                          type="button"
                          className="bg-gray-200 font-semibold text-black px-4 py-2 rounded-md hover:bg-gray-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-gray-200 font-semibold text-black px-4 py-2 rounded-md hover:bg-gray-300 cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Transparent overlay and Sidebar */}
      {toggleMenu && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-30"
            onClick={handleToggle}
          ></div>
          {/* Sidebar */}
          <aside className="fixed top-15 left-0 w-1/2 md:w-60 min-h-full h-auto bg-white flex flex-col justify-start text-black font-bold transition-all duration-300 z-40 ">
            <SidebarItems toggleMenu={toggleMenu} handleToggle={handleToggle} />
          </aside>
        </>
      )}
    </>
  );
};

export default Header;
