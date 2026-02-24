import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@components/layout/Layout";
import StatCard from "@components/dashboard/StatCard";
import {
  FaFileAlt,
  FaVideo,
  FaImage,
  FaCube,
  FaCheckCircle,
  FaEye,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import { getCurrentUser } from "@utils/auth";
import { getCourses } from "@utils/courses";
import "./ContentCreatorDashboard.css";

/**
 * ContentCreatorDashboard Component
 * Displays content creator's course materials, quality metrics, and collaboration
 */
function ContentCreatorDashboard() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const creatorId = currentUser?.id;

  const [contentLibrary, setContentLibrary] = useState([]);
  const [stats, setStats] = useState({
    totalAssets: 0,
    activeContent: 0,
    collaborationRequests: 0,
    qualityScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!creatorId) {
      setError("Creator ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const courses = getCourses();
      const availableCourses = courses.length > 0 ? courses : [];

      // Generate sample content library
      const sampleAssets = [
        { id: "1", type: "document", title: "React Hooks Guide", size: "2.4 MB", views: 342, quality: 92 },
        { id: "2", type: "video", title: "Component Best Practices", size: "145 MB", views: 567, quality: 95 },
        { id: "3", type: "image", title: "Architecture Diagram", size: "850 KB", views: 189, quality: 88 },
        { id: "4", type: "quiz", title: "Advanced Patterns Quiz", size: "520 KB", views: 234, quality: 91 },
        { id: "5", type: "document", title: "Performance Optimization", size: "3.1 MB", views: 401, quality: 89 },
      ];

      setContentLibrary(sampleAssets);

      setStats({
        totalAssets: sampleAssets.length,
        activeContent: 4,
        collaborationRequests: 2,
        qualityScore: Math.round(
          sampleAssets.reduce((sum, a) => sum + a.quality, 0) / sampleAssets.length
        ),
      });
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  const getContentIcon = (type) => {
    switch (type) {
      case "document":
        return <FaFileAlt />;
      case "video":
        return <FaVideo />;
      case "image":
        return <FaImage />;
      case "quiz":
        return <FaCube />;
      default:
        return <FaFileAlt />;
    }
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case "document":
        return "#3b82f6";
      case "video":
        return "#ef4444";
      case "image":
        return "#8b5cf6";
      case "quiz":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="content-creator-dashboard">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="content-creator-dashboard">
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            title="Total Assets"
            value={stats.totalAssets}
            icon={<FaFileAlt />}
            color="#3b82f6"
            subtitle="Media files"
          />
          <StatCard
            title="Active Content"
            value={stats.activeContent}
            icon={<FaCheckCircle />}
            color="#10b981"
            subtitle="Published"
          />
          <StatCard
            title="Collaboration Requests"
            value={stats.collaborationRequests}
            icon={<FaUsers />}
            color="#f59e0b"
            subtitle="Pending review"
          />
          <StatCard
            title="Quality Score"
            value={`${stats.qualityScore}%`}
            icon={<FaStar />}
            color="#667eea"
            subtitle="Average"
          />
        </div>

        {/* Main Content */}
        <div className="content-grid">
          {/* Content Library Section */}
          <section className="dashboard-section full-width">
            <div className="section-header">
              <h3>Content Library</h3>
              <button
                className="btn-link"
                onClick={() => navigate("/content-creator/add-content")}
              >
                + Upload New Content
              </button>
            </div>

            {contentLibrary.length === 0 ? (
              <div className="empty-state">
                <FaFileAlt className="empty-icon" />
                <p>No content yet</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/content-creator/add-content")}
                >
                  Upload Your First Asset
                </button>
              </div>
            ) : (
              <div className="content-table">
                <div className="content-table-header">
                  <div className="col-type">Type</div>
                  <div className="col-title">Title</div>
                  <div className="col-size">Size</div>
                  <div className="col-views">Views</div>
                  <div className="col-quality">Quality</div>
                  <div className="col-actions">Actions</div>
                </div>

                {contentLibrary.map((asset) => (
                  <div key={asset.id} className="content-table-row">
                    <div className="col-type">
                      <span
                        className="asset-badge"
                        style={{
                          background: getContentTypeColor(asset.type) + "20",
                          color: getContentTypeColor(asset.type),
                        }}
                      >
                        {getContentIcon(asset.type)}
                      </span>
                    </div>
                    <div className="col-title">{asset.title}</div>
                    <div className="col-size">{asset.size}</div>
                    <div className="col-views">
                      <FaEye size={14} style={{ marginRight: "4px" }} />
                      {asset.views}
                    </div>
                    <div className="col-quality">
                      <div className="quality-bar">
                        <div
                          className="quality-fill"
                          style={{
                            width: `${asset.quality}%`,
                            background:
                              asset.quality >= 90
                                ? "#10b981"
                                : asset.quality >= 80
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                        />
                      </div>
                      <span>{asset.quality}%</span>
                    </div>
                    <div className="col-actions">
                      <button className="btn-small" title="Edit" onClick={() => navigate("/manage")}>
                        Edit
                      </button>
                      <button className="btn-small" title="Delete" onClick={() => navigate("/manage")}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Collaboration Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3>Collaboration Hub</h3>
            </div>

            <div className="collaboration-list">
              <div className="collaboration-item">
                <div className="collaboration-info">
                  <h5>Dr. Sarah Johnson</h5>
                  <p>Requesting content review for "Advanced React"</p>
                  <small>Requested 2 hours ago</small>
                </div>
                <div className="collaboration-actions">
                  <button className="btn-action approve" onClick={() => navigate("/manage")}>Approve</button>
                  <button className="btn-action decline" onClick={() => navigate("/manage")}>Decline</button>
                </div>
              </div>

              <div className="collaboration-item">
                <div className="collaboration-info">
                  <h5>Prof. Michael Chen</h5>
                  <p>Asking for Python course material update</p>
                  <small>Requested 1 day ago</small>
                </div>
                <div className="collaboration-actions">
                  <button className="btn-action approve" onClick={() => navigate("/manage")}>Approve</button>
                  <button className="btn-action decline" onClick={() => navigate("/manage")}>Decline</button>
                </div>
              </div>
            </div>
          </section>

          {/* Quality Insights Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3>Quality Insights</h3>
            </div>

            <div className="insights-list">
              <div className="insight-item">
                <span className="insight-label">Top Performing Content</span>
                <span className="insight-value">React Hooks Guide</span>
                <small>342 views, 92% quality</small>
              </div>

              <div className="insight-item">
                <span className="insight-label">Avg. Content Quality</span>
                <span className="insight-value">{stats.qualityScore}%</span>
                <small>Across all assets</small>
              </div>

              <div className="insight-item">
                <span className="insight-label">Needs Improvement</span>
                <span className="insight-value">Image: Arch. Diagram</span>
                <small>88% quality - Update recommended</small>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default ContentCreatorDashboard;
