import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ChartCard({ title, data, options, loading, error }) {
  // Safe fallback if data or datasets are undefined
  const safeData = data && Array.isArray(data.datasets)
    ? data
    : {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "No Data",
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: "#ccc",
            borderRadius: 6,
          },
        ],
      };

  if (loading) return <div className="card p-4">Loading chart...</div>;
  if (error) return <div className="card p-4 text-danger">Failed to load chart</div>;

  return (
    <div className="card shadow-sm p-4 mb-4">
      <h5 className="mb-4 fw-semibold">{title}</h5>
      <Bar key={title} data={safeData} options={options} />
    </div>
  );
}

export default ChartCard;
