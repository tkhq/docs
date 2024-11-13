import React from "react";
import "./steps.css";

export const Step = ({ ...props }: React.ComponentProps<"h3">) => (
  <h3
    className="step"
    style={{
      marginTop: "2rem",
      scrollMargin: "5rem",
      fontSize: "1rem",
      fontWeight: "600",
    }}
    {...props}
  />
);

export const Steps = ({ ...props }) => (
  <div
    className="steps"
    style={{
      marginBottom: "2rem",
      marginLeft: "1rem",
      borderLeft: "1px solid var(--tk-border-gray-100)",
      paddingLeft: "2rem",
    }}
    {...props}
  />
);
