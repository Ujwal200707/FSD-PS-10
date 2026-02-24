import React from "react";
import "./AnalyticsChart.css";

const AnalyticsChart = ({ title, data = [] }) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="analytics-chart">
      <h3>{title}</h3>
      <div className="chart-container">
        {data.length === 0 ? (
          <div className="chart-empty">No data available</div>
        ) : (
          <div className="chart-bars">
            {data.map((item, idx) => (
              <div key={idx} className="chart-bar-item">
                <div className="bar-wrapper">
                  <div
                    className="bar"
                    style={{
                      height: `${(item.value / maxValue) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="bar-label">{item.label}</div>
                <div className="bar-value">{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsChart;
