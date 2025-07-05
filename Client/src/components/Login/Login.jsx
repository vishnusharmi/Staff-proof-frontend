import React from "react";


import Form from "./Form";
import IntroComponent from "./IntroComponent";

const Login = () => {
  console.log("Login component rendered");
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center px-4 py-8 gap-8">
      {/* Test message */}
      <div style={{
        position: 'fixed',
        top: '90px',
        right: '10px',
        zIndex: 9999,
        padding: '5px 10px',
        backgroundColor: 'blue',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        Login Component Loaded ✅
      </div>
      
      {/* FORM */}
      <div className="w-full md:w-1/2 lg:w-1/3">
        <Form />
      </div>

      {/* Divider - visible on large screens */}
      <div className="hidden lg:block w-px h-64 bg-teal-300" />

      {/* INTRO */}
      <div className="w-full md:w-1/2 lg:w-1/3">
        <IntroComponent />
      </div>
    </div>
  );
};

export default Login;
