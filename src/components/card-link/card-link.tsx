import React from "react";
import "./card-link.css";

interface CardLinkProps {
  icon: React.ReactNode;
  title: string;
  href: string;
  children: React.ReactNode;
}

export const CardLink: React.FC<CardLinkProps> = ({
  icon,
  title,
  href,
  children,
}) => (
  <a href={href} className="card-link">
    <div className="card-link-header">
      <div className="card-link-icon">{icon}</div>
      <div className="card-link-title">{title}</div>
    </div>
    <div className="card-link-content">{children}</div>
  </a>
);

export const CardLinkContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div>{children}</div>;
