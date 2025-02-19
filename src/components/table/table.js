import React from "react";
import "./table.css";

export default function Table({ children, style, columnHeadings, tableRows }) {
  return (
    <div className="table-wrapper">
      <div className="column-headings">
        {columnHeadings.map((heading, headingIndex) => {
          return (
            <div className="column-heading bold" key={`${headingIndex}`}>
              <a href={heading?.url}>{heading?.text}</a>
            </div>
          );
        })}
      </div>

      {tableRows.map((tableRow, tableRowIndex) => {
        return (
          <div key={tableRowIndex} className="table-row">
            {tableRow.map((row, rowIndex) => {
              return (
                <div key={rowIndex} className="table-cell">
                  {row}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
