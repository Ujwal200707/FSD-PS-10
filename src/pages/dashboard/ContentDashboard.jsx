import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import StatCard from "../../components/dashboard/StatCard";
import ActivityList from "../../components/dashboard/ActivityList";
import ChartCard from "../../components/dashboard/ChartCard";
import axios from "axios";
import { FaFileAlt, FaCheckCircle, FaHourglassHalf } from "react-icons/fa";

const API = {
  stats: "/api/content/stats",
  chart: "/api/content/chart",
  activity: "/api/content/activity",
};

function ContentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(false);

  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(false);

  useEffect(() => {
    setStatsLoading(true);
    axios.get(API.stats)
      .then(res => {
        setStats(res.data);
        setStatsLoading(false);
      })
      .catch(() => {
        setStatsError(true);
        setStatsLoading(false);
      });
  }, []);

  useEffect(() => {
    setChartLoading(true);
    axios.get(API.chart)
      .then(res => {
        setChartData(res.data);
        setChartLoading(false);
      })
      .catch(() => {
        setChartError(true);
        setChartLoading(false);
      });
  }, []);

  useEffect(() => {
    setActivityLoading(true);
    axios.get(API.activity)
      .then(res => {
        setActivity(res.data);
        setActivityLoading(false);
      })
      .catch(() => {
        setActivityError(true);
        setActivityLoading(false);
      });
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
  };

  const fallbackStats = {
    totalContent: 24,
    drafts: 5,
    published: 19,
  };
  const fallbackChart = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "New Content Uploaded",
        data: [5, 8, 3, 6],
        backgroundColor: "#059669",
        borderRadius: 6,
      },
      {
        label: "Content Updates",
        data: [2, 4, 3, 5],
        backgroundColor: "#10b981",
        borderRadius: 6,
      },
    ],
  };
  const fallbackActivity = [
    { text: "Content 'React Guide' created", time: "2h ago" },
    { text: "Content 'Python Tutorial' approved", time: "4h ago" },
    { text: "Content 'UI/UX Article' updated", time: "1d ago" },
  ];

  return (
    <Layout pageTitle="Content Creator Dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: "700" }}>
          Content Creator Overview
        </h2>
        <button className="btn btn-success fw-semibold" onClick={() => navigate("/content/manage")}>
          + Add New Content
        </button>
      </div>
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <StatCard
            title="Total Content"
            value={stats.totalContent || fallbackStats.totalContent}
            icon={<FaFileAlt />}
            color="#059669"
            loading={statsLoading}
            error={statsError}
            subtitle={"+3 this week"}
          />
        </div>
        <div className="col-md-4">
          <StatCard
            title="Drafts"
            value={stats.drafts || fallbackStats.drafts}
            icon={<FaHourglassHalf />}
            color="#fbbf24"
            loading={statsLoading}
            error={statsError}
            subtitle={"Pending review"}
          />
        </div>
        <div className="col-md-4">
          <StatCard
            title="Published"
            value={stats.published || fallbackStats.published}
            icon={<FaCheckCircle />}
            color="#10b981"
            loading={statsLoading}
            error={statsError}
            subtitle={"+2 this week"}
          />
        </div>
      </div>
      <ChartCard
        title="Content Activity Overview"
        data={chartData || fallbackChart}
        options={chartOptions}
        loading={chartLoading}
        error={chartError}
      />
      <ActivityList
        activities={activity.length ? activity : fallbackActivity}
        loading={activityLoading}
        error={activityError}
        emptyText="No recent activity."
      />
      <div
        className="card shadow-sm p-4"
        style={{
          borderRadius: "12px",
          background: "#f0fdf4",
        }}
      >
        <h5 className="mb-3 fw-semibold">Manage Content</h5>
        <p style={{ lineHeight: "1.6" }}>
          Upload new course materials, update existing content, and
          track performance to keep learners engaged.
        </p>
        <button className="btn btn-success fw-semibold" onClick={() => navigate("/content/manage")}>
          Create New Content
        </button>
      </div>
    </Layout>
  );
}

export default ContentDashboard;
