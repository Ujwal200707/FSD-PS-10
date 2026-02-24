import React, { useEffect, useMemo, useState } from "react";
import Layout from "@components/layout/Layout";
import { ROLES } from "../constants/roles";
import { getCurrentUser, normalizeRole } from "../utils/auth";
import {
  applyThemePreference,
  getPlatformSettingsData,
  getUserSettings,
  updatePlatformSettingsData,
  updateUserProfile,
  updateUserSettings,
} from "../utils/settings";
import "./Settings.css";

const Settings = () => {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const role = normalizeRole(currentUser?.role);
  const isAdmin = role === ROLES.ADMIN;

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    timezone: "UTC",
    language: "English",
  });

  const [preferencesForm, setPreferencesForm] = useState({
    inAppNotifications: true,
    emailNotifications: true,
    assignmentReminders: true,
    darkMode: false,
  });

  const [platformForm, setPlatformForm] = useState({
    platformName: "",
    platformUrl: "",
    supportEmail: "",
    timezone: "UTC",
    maintenanceMode: false,
    allowPublicSignup: true,
    emailNotifications: true,
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [preferencesMessage, setPreferencesMessage] = useState("");
  const [platformMessage, setPlatformMessage] = useState("");

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    const settings = getUserSettings(currentUser.id);
    setProfileForm(settings.profile);
    setPreferencesForm(settings.preferences);

    if (isAdmin) {
      setPlatformForm(getPlatformSettingsData());
    }
  }, [currentUser?.id, isAdmin]);

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreferenceChange = (field, value) => {
    setPreferencesForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePlatformChange = (field, value) => {
    setPlatformForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = (event) => {
    event.preventDefault();
    if (!currentUser?.id) return;

    updateUserProfile(currentUser.id, {
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
    });

    updateUserSettings(currentUser.id, { profile: profileForm });

    setProfileMessage("Profile settings saved successfully.");
    setTimeout(() => setProfileMessage(""), 2500);
  };

  const handleSavePreferences = (event) => {
    event.preventDefault();
    if (!currentUser?.id) return;

    updateUserSettings(currentUser.id, { preferences: preferencesForm });
    applyThemePreference(preferencesForm.darkMode);

    setPreferencesMessage("Preferences updated successfully.");
    setTimeout(() => setPreferencesMessage(""), 2500);
  };

  const handleSavePlatform = (event) => {
    event.preventDefault();
    updatePlatformSettingsData(platformForm);

    setPlatformMessage("Platform settings updated successfully.");
    setTimeout(() => setPlatformMessage(""), 2500);
  };

  return (
    <Layout pageTitle="Settings">
      <div className="settings-page">
        <div className="settings-grid">
          <section className="settings-card">
            <div className="settings-card-header">
              <h2>Profile Settings</h2>
              <p>Manage your account identity and locale preferences.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="settings-form">
              <label>
                Full Name
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(event) => handleProfileChange("name", event.target.value)}
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(event) => handleProfileChange("email", event.target.value)}
                  required
                />
              </label>

              <label>
                Phone
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(event) => handleProfileChange("phone", event.target.value)}
                />
              </label>

              <div className="settings-form-row">
                <label>
                  Timezone
                  <select
                    value={profileForm.timezone}
                    onChange={(event) => handleProfileChange("timezone", event.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </label>

                <label>
                  Language
                  <select
                    value={profileForm.language}
                    onChange={(event) => handleProfileChange("language", event.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </label>
              </div>

              <div className="settings-actions">
                <button type="submit" className="settings-btn-primary">Save Profile</button>
                {profileMessage && <span className="settings-success">{profileMessage}</span>}
              </div>
            </form>
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <h2>Preferences</h2>
              <p>Configure your notifications and appearance behavior.</p>
            </div>

            <form onSubmit={handleSavePreferences} className="settings-form">
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={preferencesForm.inAppNotifications}
                  onChange={(event) => handlePreferenceChange("inAppNotifications", event.target.checked)}
                />
                <span>Enable in-app notifications</span>
              </label>

              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={preferencesForm.emailNotifications}
                  onChange={(event) => handlePreferenceChange("emailNotifications", event.target.checked)}
                />
                <span>Enable email notifications</span>
              </label>

              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={preferencesForm.assignmentReminders}
                  onChange={(event) => handlePreferenceChange("assignmentReminders", event.target.checked)}
                />
                <span>Assignment reminder alerts</span>
              </label>

              <label>
                Theme
                <select
                  value={preferencesForm.darkMode ? "dark" : "light"}
                  onChange={(event) => handlePreferenceChange("darkMode", event.target.value === "dark")}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>

              <div className="settings-actions">
                <button type="submit" className="settings-btn-primary">Save Preferences</button>
                {preferencesMessage && <span className="settings-success">{preferencesMessage}</span>}
              </div>
            </form>
          </section>

          {isAdmin && (
            <section className="settings-card settings-card-wide">
              <div className="settings-card-header">
                <h2>Platform Settings</h2>
                <p>Control global LMS configuration and accessibility.</p>
              </div>

              <form onSubmit={handleSavePlatform} className="settings-form">
                <div className="settings-form-row">
                  <label>
                    Platform Name
                    <input
                      type="text"
                      value={platformForm.platformName}
                      onChange={(event) => handlePlatformChange("platformName", event.target.value)}
                    />
                  </label>

                  <label>
                    Platform URL
                    <input
                      type="url"
                      value={platformForm.platformUrl}
                      onChange={(event) => handlePlatformChange("platformUrl", event.target.value)}
                    />
                  </label>
                </div>

                <div className="settings-form-row">
                  <label>
                    Support Email
                    <input
                      type="email"
                      value={platformForm.supportEmail}
                      onChange={(event) => handlePlatformChange("supportEmail", event.target.value)}
                    />
                  </label>

                  <label>
                    Timezone
                    <select
                      value={platformForm.timezone}
                      onChange={(event) => handlePlatformChange("timezone", event.target.value)}
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </label>
                </div>

                <div className="settings-toggle-group">
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={platformForm.maintenanceMode}
                      onChange={(event) => handlePlatformChange("maintenanceMode", event.target.checked)}
                    />
                    <span>Maintenance mode</span>
                  </label>

                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={platformForm.allowPublicSignup}
                      onChange={(event) => handlePlatformChange("allowPublicSignup", event.target.checked)}
                    />
                    <span>Allow public sign-up</span>
                  </label>

                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={platformForm.emailNotifications}
                      onChange={(event) => handlePlatformChange("emailNotifications", event.target.checked)}
                    />
                    <span>System email notifications</span>
                  </label>
                </div>

                <div className="settings-actions">
                  <button type="submit" className="settings-btn-primary">Save Platform Settings</button>
                  {platformMessage && <span className="settings-success">{platformMessage}</span>}
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
