import React from "react";

const IntroComponent = () => {
  return (
    <div className="hidden md:flex flex-col items-center justify-center gap-2">
      <p className="text-xl md:text-4xl mr-5">Welcome to Staff Proof!</p>
      <div className="hidden cb1:block md:w-100 md:h-100 mt-7 bg-teal-100 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-2xl font-bold text-teal-800">StaffProof Platform</h2>
        <p className="text-teal-600 mt-2">Employee Verification & Management</p>
      </div>
    </div>
  );
};

export default IntroComponent;
