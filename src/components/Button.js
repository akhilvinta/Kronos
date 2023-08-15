import React from "react";

const Button = ({ children, onClick, className }) => {
  return (
    <button
      className={`text-left hover:opacity-80 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const BlackButton = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={`bg-black text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:opacity-80 ${className}`}
  >
    {children}
  </button>
);

export default Button;
