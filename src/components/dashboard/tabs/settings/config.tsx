import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Alert01Icon, Cancel01Icon, Delete02Icon, FloppyDiskIcon, Mail01Icon, Message01Icon, PencilEdit01Icon, Settings01Icon, Tick01Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import React, { useState } from "react";
const AlertConfiguration = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("notifications");

  // Notification Groups Management
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "Development Team",
      emails: ["dev1@company.com", "dev2@company.com", "lead@company.com"],
      slackChannel: "#dev-alerts",
      excludedEmails: [],
    },
    {
      id: 2,
      name: "Support Team",
      emails: ["support1@company.com", "support2@company.com"],
      slackChannel: "#support-alerts",
      excludedEmails: ["support2@company.com"],
    },
  ]);

  const [newGroup, setNewGroup] = useState({
    name: "",
    emails: [],
    slackChannel: "",
    excludedEmails: [],
  });

  const [editingGroup, setEditingGroup] = useState(null);
  const [showAddGroup, setShowAddGroup] = useState(false);

  // Individual Email Management
  const [individualEmails, setIndividualEmails] = useState([
    "admin@company.com",
    "cto@company.com",
    "manager@company.com",
  ]);
  const [newEmail, setNewEmail] = useState("");

  // Alert Triggers Configuration
  const [alertTriggers, setAlertTriggers] = useState({
    logs: {
      enabled: true,
      severityLevels: ["critical", "error", "warning"],
      specificTypes: ["authentication", "database", "api"],
      customFilters: [
        { field: "source", operator: "contains", value: "payment" },
        { field: "message", operator: "matches", value: "timeout" },
      ],
    },
    errors: {
      enabled: true,
      severityLevels: ["critical", "error"],
      errorTypes: ["500", "404", "403", "timeout", "connection"],
      thresholds: {
        errorRate: { value: 5, unit: "percent", timeWindow: "5min" },
        errorCount: { value: 50, unit: "count", timeWindow: "1hour" },
      },
    },
  });

  // General Configuration
  const [generalConfig, setGeneralConfig] = useState({
    alertFrequency: "immediate", // immediate, batched, digest
    batchWindow: 15, // minutes
    digestSchedule: "daily", // hourly, daily, weekly
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
    escalationRules: {
      enabled: true,
      escalateAfter: 30, // minutes
      escalationLevels: [
        { level: 1, notify: ["manager@company.com"], after: 15 },
        { level: 2, notify: ["cto@company.com"], after: 30 },
      ],
    },
  });

  const handleAddGroup = () => {
    if (newGroup.name && newGroup.emails.length > 0) {
      const id = Math.max(...groups.map((g) => g.id), 0) + 1;
      setGroups((prev) => [...prev, { ...newGroup, id }]);
      setNewGroup({
        name: "",
        emails: [],
        slackChannel: "",
        excludedEmails: [],
      });
      setShowAddGroup(false);
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup({ ...group });
  };

  const handleSaveGroup = () => {
    setGroups((prev) =>
      prev.map((g) => (g.id === editingGroup.id ? editingGroup : g))
    );
    setEditingGroup(null);
  };

  const handleDeleteGroup = (groupId) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const handleAddEmailToGroup = (groupId, email) => {
    if (editingGroup && editingGroup.id === groupId) {
      setEditingGroup((prev) => ({
        ...prev,
        emails: [...prev.emails, email],
      }));
    }
  };

  const handleRemoveEmailFromGroup = (groupId, email) => {
    if (editingGroup && editingGroup.id === groupId) {
      setEditingGroup((prev) => ({
        ...prev,
        emails: prev.emails.filter((e) => e !== email),
      }));
    }
  };

  const handleToggleExcludedEmail = (groupId, email) => {
    if (editingGroup && editingGroup.id === groupId) {
      setEditingGroup((prev) => ({
        ...prev,
        excludedEmails: prev.excludedEmails.includes(email)
          ? prev.excludedEmails.filter((e) => e !== email)
          : [...prev.excludedEmails, email],
      }));
    }
  };

  const handleAddIndividualEmail = () => {
    if (newEmail && !individualEmails.includes(newEmail)) {
      setIndividualEmails((prev) => [...prev, newEmail]);
      setNewEmail("");
    }
  };

  const handleSaveConfiguration = () => {
    const config = {
      groups,
      individualEmails,
      alertTriggers,
      generalConfig,
    };
    onSave(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-sm text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-primary/10 border border-primary/20 rounded-lg">
              <HugeiconsIcon icon={Settings01Icon} className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-sm font-bold text-foreground">
              Alert Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-accent hover:text-foreground text-muted-foreground transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex h-[calc(95vh-140px)]">
          {/* Sidebar */}
          <div className="w-64 bg-muted/40 border-r border-border p-4">
            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                  activeTab === "notifications"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4" />
                  <span>Notifications</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("triggers")}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                  activeTab === "triggers"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4" />
                  <span>Alert Triggers</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("general")}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                  activeTab === "general"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <HugeiconsIcon icon={Settings01Icon} className="w-4 h-4" />
                  <span>General Settings</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "notifications" && (
              <div className="space-y-6">
                {/* Notification Groups */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-foreground">
                      Notification Groups
                    </h3>
                    <button
                      onClick={() => setShowAddGroup(true)}
                      className="flex items-center space-x-1.5 bg-primary/10 hover:bg-primary/15 text-primary px-3 py-1.5 rounded text-xs transition-colors cursor-pointer"
                    >
                      <HugeiconsIcon icon={Add01Icon} className="w-3.5 h-3.5" />
                      <span>Add Group</span>
                    </button>
                  </div>

                  <div className="grid gap-3">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="bg-muted/30 border border-border rounded p-4 text-xs text-foreground"
                      >
                        {editingGroup && editingGroup.id === group.id ? (
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={editingGroup.name}
                              onChange={(e) =>
                                setEditingGroup((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-1.5 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              placeholder="Group name"
                            />

                            <div>
                              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                                Slack Channel
                              </label>
                              <input
                                type="text"
                                value={editingGroup.slackChannel}
                                onChange={(e) =>
                                  setEditingGroup((prev) => ({
                                    ...prev,
                                    slackChannel: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-1.5 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="#channel-name"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                                Email Addresses
                              </label>
                              <div className="space-y-1.5">
                                {editingGroup.emails.map((email, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between bg-muted/50 border border-border p-2 rounded text-xs"
                                  >
                                    <span className="text-foreground">{email}</span>
                                    <div className="flex items-center space-x-1.5">
                                      <button
                                        onClick={() =>
                                          handleToggleExcludedEmail(
                                            group.id,
                                            email
                                          )
                                        }
                                        className={`p-1 rounded text-[10px] transition-colors cursor-pointer ${
                                          editingGroup.excludedEmails.includes(
                                            email
                                          )
                                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                        }`}
                                        title={
                                          editingGroup.excludedEmails.includes(
                                            email
                                          )
                                            ? "Excluded"
                                            : "Included"
                                        }
                                      >
                                        {editingGroup.excludedEmails.includes(
                                          email
                                        ) ? (
                                          <HugeiconsIcon icon={ViewOffIcon} className="w-3.5 h-3.5" />
                                        ) : (
                                          <HugeiconsIcon icon={ViewIcon} className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleRemoveEmailFromGroup(
                                            group.id,
                                            email
                                          )
                                        }
                                        className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer"
                                      >
                                        <HugeiconsIcon icon={Delete02Icon} className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex space-x-2">
                                  <input
                                    type="email"
                                    placeholder="Add email address"
                                    className="flex-1 px-3 py-1.5 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    onKeyUp={(e) => {
                                      if (e.key === "Enter") {
                                        handleAddEmailToGroup(
                                          group.id,
                                          e.target.value
                                        );
                                        e.target.value = "";
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setEditingGroup(null)}
                                className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveGroup}
                                className="flex items-center space-x-1.5 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer"
                              >
                                <HugeiconsIcon icon={Tick01Icon} className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-foreground text-xs">
                                {group.name}
                              </h4>
                              <div className="flex items-center space-x-1.5">
                                <button
                                  onClick={() => handleEditGroup(group)}
                                  className="p-1 text-muted-foreground hover:text-primary rounded hover:bg-muted transition-colors cursor-pointer"
                                >
                                  <HugeiconsIcon icon={PencilEdit01Icon} className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGroup(group.id)}
                                  className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-muted transition-colors cursor-pointer"
                                >
                                  <HugeiconsIcon icon={Delete02Icon} className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="text-[10px] text-muted-foreground mb-1.5">
                              {group.emails.length} emails •{" "}
                              {group.excludedEmails.length} excluded
                            </div>

                            {group.slackChannel && (
                              <div className="flex items-center space-x-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                                <HugeiconsIcon icon={Message01Icon} className="w-3.5 h-3.5" />
                                <span>{group.slackChannel}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Group Form */}
                  {showAddGroup && (
                    <div className="bg-muted/30 border border-border rounded p-4 mt-3">
                      <h4 className="font-semibold text-foreground text-xs mb-3">
                        Add New Group
                      </h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newGroup.name}
                          onChange={(e) =>
                            setNewGroup((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-1.5 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Group name"
                        />
                        <input
                          type="text"
                          value={newGroup.slackChannel}
                          onChange={(e) =>
                            setNewGroup((prev) => ({
                              ...prev,
                              slackChannel: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-1.5 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Slack channel (optional)"
                        />
                        <div>
                          <input
                            type="email"
                            placeholder="Add email addresses (press Enter)"
                            className="w-full px-3 py-1.5 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            onKeyUp={(e) => {
                              if (e.key === "Enter" && e.target.value) {
                                setNewGroup((prev) => ({
                                  ...prev,
                                  emails: [...prev.emails, e.target.value],
                                }));
                                e.target.value = "";
                              }
                            }}
                          />
                          {newGroup.emails.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                              {newGroup.emails.map((email, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-muted/50 border border-border p-2 rounded text-xs"
                                >
                                  <span className="text-foreground">{email}</span>
                                  <button
                                    onClick={() =>
                                      setNewGroup((prev) => ({
                                        ...prev,
                                        emails: prev.emails.filter(
                                          (_, i) => i !== index
                                        ),
                                      }))
                                    }
                                    className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer"
                                  >
                                    <HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowAddGroup(false)}
                            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddGroup}
                            className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 text-xs rounded transition-colors cursor-pointer"
                          >
                            Add Group
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Individual Email Addresses */}
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">
                    Individual Email Addresses
                  </h3>
                  <div className="bg-muted/30 border border-border rounded p-4">
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="Enter email address"
                        onKeyUp={(e) =>
                          e.key === "Enter" && handleAddIndividualEmail()
                        }
                      />
                      <button
                        onClick={handleAddIndividualEmail}
                        className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 text-xs rounded transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {individualEmails.map((email, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted/50 border border-border p-2 rounded text-xs"
                        >
                          <span className="text-foreground">{email}</span>
                          <button
                            onClick={() =>
                              setIndividualEmails((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                            className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer"
                          >
                            <HugeiconsIcon icon={Delete02Icon} className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "triggers" && (
              <div className="space-y-6">
                {/* Log Alerts */}
                <div className="bg-muted/30 border border-border rounded p-4 text-xs text-foreground">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-foreground">
                      Log Alerts
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertTriggers.logs.enabled}
                        onChange={(e) =>
                          setAlertTriggers((prev) => ({
                            ...prev,
                            logs: { ...prev.logs, enabled: e.target.checked },
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {alertTriggers.logs.enabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2">
                          Severity Levels
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                          {["critical", "error", "warning", "info"].map(
                            (level) => (
                              <label
                                key={level}
                                className="flex items-center space-x-2 cursor-pointer text-xs"
                              >
                                <input
                                  type="checkbox"
                                  checked={alertTriggers.logs.severityLevels.includes(
                                    level
                                  )}
                                  onChange={(e) => {
                                    const levels = e.target.checked
                                      ? [
                                          ...alertTriggers.logs.severityLevels,
                                          level,
                                        ]
                                      : alertTriggers.logs.severityLevels.filter(
                                          (l) => l !== level
                                        );
                                    setAlertTriggers((prev) => ({
                                      ...prev,
                                      logs: {
                                        ...prev.logs,
                                        severityLevels: levels,
                                      },
                                    }));
                                  }}
                                  className="w-3.5 h-3.5 text-primary bg-background border-border rounded focus:ring-ring"
                                />
                                <span className="text-foreground capitalize">
                                  {level}
                                </span>
                              </label>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2">
                          Log Types
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                          {[
                            "authentication",
                            "database",
                            "api",
                            "security",
                            "system",
                            "application",
                          ].map((type) => (
                            <label
                              key={type}
                              className="flex items-center space-x-2 cursor-pointer text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={alertTriggers.logs.specificTypes.includes(
                                  type
                                )}
                                onChange={(e) => {
                                  const types = e.target.checked
                                    ? [
                                        ...alertTriggers.logs.specificTypes,
                                        type,
                                      ]
                                    : alertTriggers.logs.specificTypes.filter(
                                        (t) => t !== type
                                      );
                                  setAlertTriggers((prev) => ({
                                    ...prev,
                                    logs: {
                                      ...prev.logs,
                                      specificTypes: types,
                                    },
                                  }));
                                }}
                                className="w-3.5 h-3.5 text-primary bg-background border-border rounded focus:ring-ring"
                              />
                              <span className="text-foreground capitalize text-xs">
                                {type}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Alerts */}
                <div className="bg-muted/30 border border-border rounded p-4 text-xs text-foreground">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-foreground">
                      Error Alerts
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertTriggers.errors.enabled}
                        onChange={(e) =>
                          setAlertTriggers((prev) => ({
                            ...prev,
                            errors: {
                              ...prev.errors,
                              enabled: e.target.checked,
                            },
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {alertTriggers.errors.enabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2">
                          Error Types
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                          {[
                            "500",
                            "404",
                            "403",
                            "401",
                            "timeout",
                            "connection",
                          ].map((type) => (
                            <label
                              key={type}
                              className="flex items-center space-x-2 cursor-pointer text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={alertTriggers.errors.errorTypes.includes(
                                  type
                                )}
                                onChange={(e) => {
                                  const types = e.target.checked
                                    ? [...alertTriggers.errors.errorTypes, type]
                                    : alertTriggers.errors.errorTypes.filter(
                                        (t) => t !== type
                                      );
                                  setAlertTriggers((prev) => ({
                                    ...prev,
                                    errors: {
                                      ...prev.errors,
                                      errorTypes: types,
                                    },
                                  }));
                                }}
                                className="w-3.5 h-3.5 text-primary bg-background border-border rounded focus:ring-ring"
                              />
                              <span className="text-foreground text-xs">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2">
                          Thresholds
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                              Error Rate
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="number"
                                value={
                                  alertTriggers.errors.thresholds.errorRate
                                    .value
                                }
                                onChange={(e) =>
                                  setAlertTriggers((prev) => ({
                                    ...prev,
                                    errors: {
                                      ...prev.errors,
                                      thresholds: {
                                        ...prev.errors.thresholds,
                                        errorRate: {
                                          ...prev.errors.thresholds.errorRate,
                                          value: parseInt(e.target.value),
                                        },
                                      },
                                    },
                                  }))
                                }
                                className="flex-1 px-3 py-1.5 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              />
                              <select
                                value={
                                  alertTriggers.errors.thresholds.errorRate.unit
                                }
                                onChange={(e) =>
                                  setAlertTriggers((prev) => ({
                                    ...prev,
                                    errors: {
                                      ...prev.errors,
                                      thresholds: {
                                        ...prev.errors.thresholds,
                                        errorRate: {
                                          ...prev.errors.thresholds.errorRate,
                                          unit: e.target.value,
                                        },
                                      },
                                    },
                                  }))
                                }
                                className="px-2 py-1.5 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              >
                                <option value="percent">%</option>
                                <option value="count">count</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                              Error Count
                            </label>
                            <input
                              type="number"
                              value={
                                alertTriggers.errors.thresholds.errorCount.value
                              }
                              onChange={(e) =>
                                setAlertTriggers((prev) => ({
                                  ...prev,
                                  errors: {
                                    ...prev.errors,
                                    thresholds: {
                                      ...prev.errors.thresholds,
                                      errorCount: {
                                        ...prev.errors.thresholds.errorCount,
                                        value: parseInt(e.target.value),
                                      },
                                    },
                                  },
                                }))
                              }
                              className="w-full px-3 py-1.5 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "general" && (
              <div className="space-y-6">
                {/* Alert Frequency */}
                <div className="bg-muted/30 border border-border rounded p-4 text-xs text-foreground">
                  <h3 className="text-sm font-bold text-foreground mb-4">
                    Alert Frequency
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-2">
                        Notification Frequency
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-start space-x-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="frequency"
                            value="immediate"
                            checked={
                              generalConfig.alertFrequency === "immediate"
                            }
                            onChange={(e) =>
                              setGeneralConfig((prev) => ({
                                  ...prev,
                                  alertFrequency: e.target.value,
                              }))
                            }
                            className="mt-0.5 w-3.5 h-3.5 text-primary bg-background border-border focus:ring-ring"
                          />
                          <div>
                            <span className="text-foreground text-xs font-semibold">Immediate</span>
                            <p className="text-[10px] text-muted-foreground">
                              Send alerts as soon as they occur
                            </p>
                          </div>
                        </label>
                        <label className="flex items-start space-x-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="frequency"
                            value="batched"
                            checked={generalConfig.alertFrequency === "batched"}
                            onChange={(e) =>
                              setGeneralConfig((prev) => ({
                                ...prev,
                                alertFrequency: e.target.value,
                              }))
                            }
                            className="mt-0.5 w-3.5 h-3.5 text-primary bg-background border-border focus:ring-ring"
                          />
                          <div>
                            <span className="text-foreground text-xs font-semibold">Batched</span>
                            <p className="text-[10px] text-muted-foreground">
                              Group alerts and send periodically
                            </p>
                          </div>
                        </label>
                        <label className="flex items-start space-x-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="frequency"
                            value="digest"
                            checked={generalConfig.alertFrequency === "digest"}
                            onChange={(e) =>
                              setGeneralConfig((prev) => ({
                                ...prev,
                                alertFrequency: e.target.value,
                              }))
                            }
                            className="mt-0.5 w-3.5 h-3.5 text-primary bg-background border-border focus:ring-ring"
                          />
                          <div>
                            <span className="text-foreground text-xs font-semibold">Digest</span>
                            <p className="text-[10px] text-muted-foreground">
                              Send summary reports on schedule
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {generalConfig.alertFrequency === "batched" && (
                      <div>
                        <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                          Batch Window (minutes)
                        </label>
                        <input
                          type="number"
                          value={generalConfig.batchWindow}
                          onChange={(e) =>
                            setGeneralConfig((prev) => ({
                              ...prev,
                              batchWindow: parseInt(e.target.value),
                            }))
                          }
                          className="w-24 px-2.5 py-1 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          min="1"
                          max="1440"
                        />
                      </div>
                    )}

                    {generalConfig.alertFrequency === "digest" && (
                      <div>
                        <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                          Digest Schedule
                        </label>
                        <select
                          value={generalConfig.digestSchedule}
                          onChange={(e) =>
                            setGeneralConfig((prev) => ({
                              ...prev,
                              digestSchedule: e.target.value,
                            }))
                          }
                          className="px-2 py-1 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quiet Hours */}
                <div className="bg-muted/30 border border-border rounded p-4 text-xs text-foreground">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Quiet Hours
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Suppress non-critical alerts during specified hours
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generalConfig.quietHours.enabled}
                        onChange={(e) =>
                          setGeneralConfig((prev) => ({
                            ...prev,
                            quietHours: {
                              ...prev.quietHours,
                              enabled: e.target.checked,
                            },
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {generalConfig.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={generalConfig.quietHours.start}
                          onChange={(e) =>
                            setGeneralConfig((prev) => ({
                              ...prev,
                              quietHours: {
                                ...prev.quietHours,
                                start: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-2.5 py-1 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={generalConfig.quietHours.end}
                          onChange={(e) =>
                            setGeneralConfig((prev) => ({
                              ...prev,
                              quietHours: {
                                ...prev.quietHours,
                                end: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-2.5 py-1 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Escalation Rules */}
                <div className="bg-muted/30 border border-border rounded p-4 text-xs text-foreground">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Escalation Rules
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Automatically escalate unacknowledged alerts
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generalConfig.escalationRules.enabled}
                        onChange={(e) =>
                          setGeneralConfig((prev) => ({
                            ...prev,
                            escalationRules: {
                              ...prev.escalationRules,
                              enabled: e.target.checked,
                            },
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {generalConfig.escalationRules.enabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                          Initial Escalation After (minutes)
                        </label>
                        <input
                          type="number"
                          value={generalConfig.escalationRules.escalateAfter}
                          onChange={(e) =>
                            setGeneralConfig((prev) => ({
                              ...prev,
                              escalationRules: {
                                ...prev.escalationRules,
                                escalateAfter: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="w-24 px-2.5 py-1 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          min="1"
                        />
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-foreground mb-3">
                          Escalation Levels
                        </h4>
                        <div className="space-y-3">
                          {generalConfig.escalationRules.escalationLevels.map(
                            (level, index) => (
                              <div
                                key={index}
                                className="bg-muted/40 border border-border p-3 rounded"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-bold text-foreground text-xs">
                                    Level {level.level}
                                  </h5>
                                  <button
                                    onClick={() =>
                                      setGeneralConfig((prev) => ({
                                        ...prev,
                                        escalationRules: {
                                          ...prev.escalationRules,
                                          escalationLevels:
                                            prev.escalationRules.escalationLevels.filter(
                                              (_, i) => i !== index
                                            ),
                                        },
                                      }))
                                    }
                                    className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer"
                                  >
                                    <HugeiconsIcon icon={Delete02Icon} className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                                      Escalate After (minutes)
                                    </label>
                                    <input
                                      type="number"
                                      value={level.after}
                                      onChange={(e) => {
                                        const newLevels = [
                                          ...generalConfig.escalationRules
                                            .escalationLevels,
                                        ];
                                        newLevels[index] = {
                                          ...newLevels[index],
                                          after: parseInt(e.target.value),
                                        };
                                        setGeneralConfig((prev) => ({
                                          ...prev,
                                          escalationRules: {
                                            ...prev.escalationRules,
                                            escalationLevels: newLevels,
                                          },
                                        }));
                                      }}
                                      className="w-full px-2.5 py-1 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                                      Notify Emails
                                    </label>
                                    <div className="space-y-1.5">
                                      {level.notify.map((email, emailIndex) => (
                                        <div
                                          key={emailIndex}
                                          className="flex items-center space-x-1.5 text-xs text-foreground"
                                        >
                                          <span className="text-foreground">
                                            {email}
                                          </span>
                                          <button
                                            onClick={() => {
                                              const newLevels = [
                                                ...generalConfig.escalationRules
                                                  .escalationLevels,
                                              ];
                                              newLevels[index] = {
                                                ...newLevels[index],
                                                notify: newLevels[
                                                  index
                                                ].notify.filter(
                                                  (_, i) => i !== emailIndex
                                                ),
                                              };
                                              setGeneralConfig((prev) => ({
                                                ...prev,
                                                escalationRules: {
                                                  ...prev.escalationRules,
                                                  escalationLevels: newLevels,
                                                },
                                              }));
                                            }}
                                            className="p-0.5 text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer"
                                          >
                                            <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                      <input
                                        type="email"
                                        placeholder="Add email"
                                        className="w-full px-2.5 py-1 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        onKeyUp={(e) => {
                                          if (
                                            e.key === "Enter" &&
                                            e.target.value
                                          ) {
                                            const newLevels = [
                                              ...generalConfig.escalationRules
                                                .escalationLevels,
                                            ];
                                            newLevels[index] = {
                                              ...newLevels[index],
                                              notify: [
                                                ...newLevels[index].notify,
                                                e.target.value,
                                              ],
                                            };
                                            setGeneralConfig((prev) => ({
                                              ...prev,
                                              escalationRules: {
                                                ...prev.escalationRules,
                                                escalationLevels: newLevels,
                                              },
                                            }));
                                            e.target.value = "";
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                          <button
                            onClick={() => {
                              const newLevel = {
                                level:
                                  generalConfig.escalationRules.escalationLevels
                                    .length + 1,
                                notify: [],
                                after: 60,
                              };
                              setGeneralConfig((prev) => ({
                                ...prev,
                                  escalationRules: {
                                    ...prev.escalationRules,
                                    escalationLevels: [
                                      ...prev.escalationRules.escalationLevels,
                                      newLevel,
                                    ],
                                  },
                              }));
                            }}
                            className="flex items-center space-x-1.5 bg-primary/10 hover:bg-primary/15 text-primary px-3 py-1.5 rounded text-xs transition-colors cursor-pointer"
                          >
                            <HugeiconsIcon icon={Add01Icon} className="w-3.5 h-3.5" />
                            <span>Add Escalation Level</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alert Retention */}
                <div className="bg-muted/30 border border-border rounded p-4 text-xs text-foreground">
                  <h3 className="text-sm font-bold text-foreground mb-4">
                    Alert Retention
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                        Keep Alerts For (days)
                      </label>
                      <input
                        type="number"
                        defaultValue="30"
                        className="w-full px-2.5 py-1 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        min="1"
                        max="365"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                        Archive After (days)
                      </label>
                      <input
                        type="number"
                        defaultValue="90"
                        className="w-full px-2.5 py-1 bg-background border border-border rounded text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        min="1"
                        max="365"
                      />
                    </div>
                  </div>
                </div>

                {/* Alert Formatting */}
                <div className="bg-muted/30 border border-border rounded p-4 text-xs text-foreground">
                  <h3 className="text-sm font-bold text-foreground mb-4">
                    Alert Formatting
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center space-x-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-3.5 h-3.5 text-primary bg-background border-border rounded focus:ring-ring"
                        />
                        <span className="text-foreground text-xs">
                          Include timestamp in alerts
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-3.5 h-3.5 text-primary bg-background border-border rounded focus:ring-ring"
                        />
                        <span className="text-foreground text-xs">
                          Include severity level
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-3.5 h-3.5 text-primary bg-background border-border rounded focus:ring-ring"
                        />
                        <span className="text-foreground text-xs">
                          Include source information
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 text-primary bg-background border-border rounded focus:ring-ring"
                        />
                        <span className="text-foreground text-xs">
                          Include stack trace for errors
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2.5 p-4 border-t border-border bg-card">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Test configuration - send a test alert
              console.log("Sending test alert...");
            }}
            className="px-3 py-1.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground border border-border text-xs rounded transition-colors cursor-pointer"
          >
            Test Configuration
          </button>
          <button
            onClick={handleSaveConfiguration}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs rounded transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={FloppyDiskIcon} className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertConfiguration;
