import React from "react";

const Header = ({ text, buttonCallback }) => {
  return (
    <div className="flex gap-3 border-b border-gray py-4 font-roboto">
      <img
        src="arrow_back.svg"
        alt="back"
        className="h-5 cursor-pointer hover:opacity-80 mt-1"
        onClick={buttonCallback}
      />
      <div className="font-bold">{text}</div>
    </div>
  );
};

export default Header;
