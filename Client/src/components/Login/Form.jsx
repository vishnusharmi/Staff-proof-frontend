import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import axiosInstance from "../../../middleware/axiosInstance";
import { UserContext } from "../context/UseContext";

const Form = () => {
  const { user, error, login } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  console.log("Form component rendered", { user, error });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((ld) => ({ ...ld, [name]: value }));
  };

  const validateForm = () => {
    const { email, password } = loginData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !password) {
      toast.error("All fields are required!");
      return false;
    }
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format!");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login attempt with:", loginData);
    
    if (!validateForm()) return;
    setLoading(true);
    try {
      const success = await login(
        loginData.email,
        loginData.password,
      ); 
      console.log("Login result:", success);
      
      if (success) {
        toast.success("Login successful!");
        // setTimeout(
        //   () => navigate("/otp", { state: { email: loginData.email } }),
        //   1500
        // );
      } else {
        toast.error(error || "Invalid credentials or role!");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(error || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto space-y-6"
      >
        <h2 className="text-3xl font-bold text-teal-500 text-center">
          Login <span className="font-normal text-xl">Staff Proof</span>
        </h2>

        <div className="space-y-2">
          <label htmlFor="email" className="block font-medium">
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-md p-3 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            value={loginData.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block font-medium">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-md p-3 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            value={loginData.password}
            onChange={handleInputChange}
          />
          <div className="text-right">
            <Link
              to="/forget-password"
              className="text-teal-600 hover:underline text-sm"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 rounded-md transition"
        >
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>

      <ToastContainer position="top-center" />
    </>
  );
};

export default Form;
