import React from "react";
import "./table.css";

export default function Table({ referenceType, columnHeadings, tableRows }) {
  return (
    <div className={`table-wrapper ${referenceType}`}>
      <div className={`column-headings ${referenceType}`}>
        {columnHeadings.map((heading, headingIndex) => {
          return (
            <div
              className={`column-heading ${referenceType} bold`}
              key={`${headingIndex}`}
            >
              {heading?.text}
            </div>
          );
        })}
      </div>

      {tableRows.map((tableRow, tableRowIndex) => {
        return (
          <div key={tableRowIndex} className="table-row">
            {tableRow.map((row, rowIndex) => {
              return (
                <div key={rowIndex} className={`table-cell ${referenceType}`}>
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
