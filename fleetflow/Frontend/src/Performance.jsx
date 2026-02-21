import React from "react";
import "./Performance.css";

const sampleData = [
  {
    name: "John",
    license: "23223",
    expiry: "22/36",
    completion: "92%",
    safety: "89%",
    complaints: 4,
  },
  {
    name: "John",
    license: "23223",
    expiry: "22/36",
    completion: "92%",
    safety: "89%",
    complaints: 4,
  },
  {
    name: "John",
    license: "23223",
    expiry: "22/36",
    completion: "92%",
    safety: "89%",
    complaints: 4,
  },
];

function Performance({ onNavigate }) {
  return (
    <div className="performance-bg">
      {/* Performance Table */}
      <div className="performance-table-container">
        <table className="performance-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>License#</th>
              <th>Expiry</th>
              <th>Completion Rate</th>
              <th>Safety Score</th>
              <th>Complaints</th>
            </tr>
          </thead>
          <tbody>
            {sampleData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.name}</td>
                <td>{row.license}</td>
                <td>{row.expiry}</td>
                <td>{row.completion}</td>
                <td>{row.safety}</td>
                <td>{row.complaints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Performance;
