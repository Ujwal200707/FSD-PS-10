import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@components/layout/Layout";
import { FaPlus, FaEdit, FaTrash, FaEye, FaFileAlt, FaBook, FaVideo, FaImage, FaSearch, FaFilter } from "react-icons/fa";

const ContentManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  // Mock content data
  const mockContents = [
    {
      id: 1,
      title: "React Fundamentals Guide",
      type: "Article",
      status: "Published",
      category: "Web Development",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20",
      views: 1250,
      likes: 89,
      thumbnail: "📄"
    },
    {
      id: 2,
      title: "Python Advanced Tutorial",
      type: "Video",
      status: "Draft",
      category: "Programming",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-18",
      views: 0,
      likes: 0,
      thumbnail: "🎥"
    },
    {
      id: 3,
      title: "UI/UX Design Principles",
      type: "Course",
      status: "Published",
      category: "Design",
      createdAt: "2024-01-05",
      updatedAt: "2024-01-22",
      views: 2100,
      likes: 156,
      thumbnail: "🎨"
    },
    {
      id: 4,
      title: "Data Science Infographic",
      type: "Image",
      status: "Review",
      category: "Data Science",
      createdAt: "2024-01-12",
      updatedAt: "2024-01-19",
      views: 450,
      likes: 23,
      thumbnail: "📊"
    },
    {
      id: 5,
      title: "JavaScript Best Practices",
      type: "Article",
      status: "Published",
      category: "Web Development",
      createdAt: "2024-01-08",
      updatedAt: "2024-01-21",
      views: 890,
      likes: 67,
      thumbnail: "⚡"
    }
  ];

  const contentTypes = ["All", "Article", "Video", "Course", "Image", "Document"];
  const statusOptions = ["All", "Draft", "Review", "Published"];

  useEffect(() => {
    if (location.state?.openCreateContent) {
      setEditingContent(null);
      setShowCreateModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setContents(mockContents);
      setFilteredContents(mockContents);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = contents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(content =>
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter(content => content.status === selectedStatus);
    }

    // Filter by type
    if (selectedType !== "All") {
      filtered = filtered.filter(content => content.type === selectedType);
    }

    setFilteredContents(filtered);
  }, [searchTerm, selectedStatus, selectedType, contents]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Published": return "#10b981";
      case "Review": return "#f59e0b";
      case "Draft": return "#6b7280";
      default: return "#6b7280";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Article": return <FaFileAlt />;
      case "Video": return <FaVideo />;
      case "Course": return <FaBook />;
      case "Image": return <FaImage />;
      default: return <FaFileAlt />;
    }
  };

  const handleCreateContent = () => {
    setShowCreateModal(true);
    setEditingContent(null);
  };

  const handleEditContent = (content) => {
    setEditingContent(content);
    setShowCreateModal(true);
  };

  const handleDeleteContent = (contentId) => {
    if (window.confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
      setContents(contents.filter(c => c.id !== contentId));
      setFilteredContents(filteredContents.filter(c => c.id !== contentId));
      alert("Content deleted successfully!");
    }
  };

  const handleViewContent = (content) => {
    alert(`Viewing: ${content.title}\n\nType: ${content.type}\nStatus: ${content.status}\nViews: ${content.views}\nLikes: ${content.likes}`);
  };

  const ContentModal = ({ isOpen, onClose, content, onSave }) => {
    const [formData, setFormData] = useState({
      title: content?.title || "",
      type: content?.type || "Article",
      category: content?.category || "Web Development",
      status: content?.status || "Draft"
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.title.trim()) {
        alert("Title is required!");
        return;
      }

      if (content) {
        // Update existing content
        setContents(contents.map(c =>
          c.id === content.id
            ? { ...c, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
            : c
        ));
        alert("Content updated successfully!");
      } else {
        // Create new content
        const newContent = {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          views: 0,
          likes: 0,
          thumbnail: getTypeIcon(formData.type).props.children === "📄" ? "📄" :
                    formData.type === "Video" ? "🎥" :
                    formData.type === "Course" ? "📚" :
                    formData.type === "Image" ? "🖼️" : "📄"
        };
        setContents([...contents, newContent]);
        alert("Content created successfully!");
      }
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}>
        <div style={{
          background: "#fff",
          borderRadius: "15px",
          padding: "30px",
          width: "500px",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto"
        }}>
          <h3 style={{ marginBottom: "20px", color: "#333" }}>
            {content ? "Edit Content" : "Create New Content"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "500" }}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "1rem"
                }}
                placeholder="Enter content title"
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "500" }}>
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "1rem"
                }}
              >
                {contentTypes.slice(1).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "500" }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "1rem"
                }}
              >
                <option value="Web Development">Web Development</option>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Data Science">Data Science</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "500" }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "1rem"
                }}
              >
                {statusOptions.slice(1).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "#f8f9fa",
                  color: "#666",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                {content ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout pageTitle="Content Management">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: "20px", color: "#666" }}>Loading content...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Content Management">
      <div style={{ padding: "20px 0" }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          padding: "40px 0",
          marginBottom: "30px",
          borderRadius: "0 0 20px 20px"
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "10px" }}>
              Content Management
            </h1>
            <p style={{ fontSize: "1.2rem", opacity: 0.9, marginBottom: "30px" }}>
              Create, edit, and manage your educational content.
            </p>

            <button
              onClick={handleCreateContent}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#fff",
                padding: "12px 25px",
                borderRadius: "25px",
                border: "none",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 5px 15px rgba(16, 185, 129, 0.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              <FaPlus />
              Create New Content
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", marginBottom: "30px" }}>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: "300px", position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#666" }} />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 15px 12px 45px",
                  borderRadius: "25px",
                  border: "1px solid #ddd",
                  fontSize: "1rem"
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FaFilter style={{ color: "#666" }} />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: "12px 20px",
                  borderRadius: "25px",
                  border: "1px solid #ddd",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: "#666" }}>Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: "12px 20px",
                  borderRadius: "25px",
                  border: "1px solid #ddd",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                {contentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ background: "#fff", borderRadius: "15px", boxShadow: "0 8px 25px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
              <h2 style={{ margin: 0, color: "#333" }}>
                Your Content
                <span style={{ color: "#666", fontSize: "0.9rem", fontWeight: "normal", marginLeft: "10px" }}>
                  ({filteredContents.length} items)
                </span>
              </h2>
            </div>

            {filteredContents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                <FaFileAlt style={{ fontSize: "3rem", color: "#ccc", marginBottom: "20px" }} />
                <h3>No content found</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa" }}>
                      <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#333" }}>Content</th>
                      <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#333" }}>Type</th>
                      <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#333" }}>Status</th>
                      <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#333" }}>Category</th>
                      <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#333" }}>Stats</th>
                      <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#333" }}>Updated</th>
                      <th style={{ padding: "15px", textAlign: "center", fontWeight: "600", color: "#333" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContents.map(content => (
                      <tr key={content.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "15px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "1.5rem" }}>{content.thumbnail}</span>
                            <div>
                              <div style={{ fontWeight: "600", color: "#333" }}>{content.title}</div>
                              <div style={{ fontSize: "0.8rem", color: "#666" }}>ID: {content.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "15px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            {getTypeIcon(content.type)}
                            <span>{content.type}</span>
                          </div>
                        </td>
                        <td style={{ padding: "15px" }}>
                          <span style={{
                            background: getStatusColor(content.status),
                            color: "#fff",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8rem",
                            fontWeight: "500"
                          }}>
                            {content.status}
                          </span>
                        </td>
                        <td style={{ padding: "15px", color: "#666" }}>{content.category}</td>
                        <td style={{ padding: "15px" }}>
                          <div style={{ fontSize: "0.9rem", color: "#666" }}>
                            <div>{content.views} views</div>
                            <div>{content.likes} likes</div>
                          </div>
                        </td>
                        <td style={{ padding: "15px", color: "#666", fontSize: "0.9rem" }}>{content.updatedAt}</td>
                        <td style={{ padding: "15px" }}>
                          <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                            <button
                              onClick={() => handleViewContent(content)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid #ddd",
                                background: "#f8f9fa",
                                color: "#666",
                                cursor: "pointer",
                                fontSize: "0.8rem"
                              }}
                              title="View"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEditContent(content)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid #ddd",
                                background: "#e3f2fd",
                                color: "#1976d2",
                                cursor: "pointer",
                                fontSize: "0.8rem"
                              }}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteContent(content.id)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid #ddd",
                                background: "#ffebee",
                                color: "#d32f2f",
                                cursor: "pointer",
                                fontSize: "0.8rem"
                              }}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ContentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        content={editingContent}
        onSave={() => {}}
      />
    </Layout>
  );
};

export default ContentManagement;