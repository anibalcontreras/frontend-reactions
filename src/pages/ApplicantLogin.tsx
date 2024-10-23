import React from "react";
import LoginForm from "../components/LoginForm";

const ApplicantLogin: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoginForm userType="applicant" />
    </div>
  );
};

export default ApplicantLogin;
