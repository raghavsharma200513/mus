import React from "react";

const Button = ({ onClick, children, disabled }) => {
  return (
    <button
      style={{
        backgroundColor: "#2E0A16",
        color: "#FFFFFF",
        padding: "10px 20px",
        border: "none",
        borderRadius: "4px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
