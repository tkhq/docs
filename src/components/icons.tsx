import React from "react";

export const CheckmarkCircleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#66FF66", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#008000", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <rect
      x="10"
      y="10"
      width="180"
      height="180"
      rx="30"
      ry="30"
      fill="url(#grad)"
      stroke="green"
    />
    <polyline
      points="50,100 90,140 150,60"
      fill="none"
      stroke="white"
      strokeWidth="15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
