import React from "react"

export default function Parameter({ children, param, isRequired, style }) {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--tk-border-gray-100)",
        paddingTop: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        ...style,
      }}
    >
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <strong>
          <code style={{ backgroundColor: "unset", border: "none" }}>
            {param.name}
          </code>
        </strong>
        {param.type.link ? (
          <code
            style={{
              border: "none",
              padding: ".0125rem var(--ifm-toc-padding-horizontal)",
            }}
          >
            <a href={param.type.link} style={{ textDecoration: "none" }}>
              {param.type.name}
            </a>
          </code>
        ) : (
          <code
            style={{
              border: "none",
              padding: ".0125rem var(--ifm-toc-padding-horizontal)",
            }}
          >
            <span>{param.type.name}</span>
          </code>
        )}
        {isRequired && (
          <code
            style={{
              padding: ".0125rem var(--ifm-toc-padding-horizontal)",
              border: "none",
              color: "var(--tk-text-danger)",
              backgroundColor: "var(--tk-bg-danger-background)",
            }}
          >
            required
          </code>
        )}
      </div>
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--ifm-font-color-base)",
          margin: "0",
        }}
      >
        {children}
      </p>
    </div>
  )
}
