import React, { useState } from "react";
import "./dropdown.css";

interface DropdownProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Dropdown = ({
  title,
  children,
  className = "",
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`dropdown ${className}`}>
      <button
        className={`dropdown-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`dropdown-arrow ${isOpen ? "open" : ""}`}>▶</span>
        {title}
      </button>
      {isOpen && <div className="dropdown-content">{children}</div>}
    </div>
  );
};
