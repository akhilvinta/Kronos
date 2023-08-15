import React from "react";

const Container = ({ children }) => {
  return <div className="p-5 flex flex-col gap-6">{children}</div>;
};

export default Container;
