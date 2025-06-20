import React, { useState } from "react";
import {
  Settings,
  X,
  Plus,
  Trash2,
  Mail,
  MessageSquare,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Edit3,
  Check,
} from "lucide-react";

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <Settings className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white">
              Alert Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(95vh-140px)]">
          {/* Sidebar */}
          <div className="w-64 bg-slate-800/50 border-r border-slate-700 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "notifications"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5" />
                  <span>Notifications</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("triggers")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "triggers"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Alert Triggers</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("general")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "general"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5" />
                  <span>General Settings</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "notifications" && (
              <div className="space-y-8">
                {/* Notification Groups */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">
                      Notification Groups
                    </h3>
                    <button
                      onClick={() => setShowAddGroup(true)}
                      className="flex items-center space-x-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Group</span>
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="bg-slate-700/30 border border-slate-600 rounded-lg p-4"
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
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                              placeholder="Group name"
                            />

                            <div>
                              <label className="block text-sm text-slate-300 mb-2">
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
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                                placeholder="#channel-name"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-slate-300 mb-2">
                                Email Addresses
                              </label>
                              <div className="space-y-2">
                                {editingGroup.emails.map((email, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between bg-slate-800 p-2 rounded"
                                  >
                                    <span className="text-white">{email}</span>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() =>
                                          handleToggleExcludedEmail(
                                            group.id,
                                            email
                                          )
                                        }
                                        className={`p-1 rounded ${
                                          editingGroup.excludedEmails.includes(
                                            email
                                          )
                                            ? "bg-red-500/20 text-red-300"
                                            : "bg-green-500/20 text-green-300"
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
                                          <EyeOff className="w-4 h-4" />
                                        ) : (
                                          <Eye className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleRemoveEmailFromGroup(
                                            group.id,
                                            email
                                          )
                                        }
                                        className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex space-x-2">
                                  <input
                                    type="email"
                                    placeholder="Add email address"
                                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
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
                                className="px-4 py-2 text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveGroup}
                                className="flex items-center space-x-2 bg-green-500/20 text-green-300 px-4 py-2 rounded"
                              >
                                <Check className="w-4 h-4" />
                                <span>Save</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-white">
                                {group.name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditGroup(group)}
                                  className="p-1 text-slate-400 hover:text-purple-400"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGroup(group.id)}
                                  className="p-1 text-slate-400 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="text-sm text-slate-400 mb-2">
                              {group.emails.length} emails •{" "}
                              {group.excludedEmails.length} excluded
                            </div>

                            {group.slackChannel && (
                              <div className="flex items-center space-x-2 text-sm text-green-400">
                                <MessageSquare className="w-4 h-4" />
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
                    <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 mt-4">
                      <h4 className="font-medium text-white mb-4">
                        Add New Group
                      </h4>
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={newGroup.name}
                          onChange={(e) =>
                            setNewGroup((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
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
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                          placeholder="Slack channel (optional)"
                        />
                        <div>
                          <input
                            type="email"
                            placeholder="Add email addresses (press Enter)"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
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
                            <div className="mt-2 space-y-1">
                              {newGroup.emails.map((email, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-slate-800 p-2 rounded text-sm"
                                >
                                  <span className="text-white">{email}</span>
                                  <button
                                    onClick={() =>
                                      setNewGroup((prev) => ({
                                        ...prev,
                                        emails: prev.emails.filter(
                                          (_, i) => i !== index
                                        ),
                                      }))
                                    }
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowAddGroup(false)}
                            className="px-4 py-2 text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddGroup}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
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
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Individual Email Addresses
                  </h3>
                  <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                    <div className="flex space-x-2 mb-4">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                        placeholder="Enter email address"
                        onKeyUp={(e) =>
                          e.key === "Enter" && handleAddIndividualEmail()
                        }
                      />
                      <button
                        onClick={handleAddIndividualEmail}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {individualEmails.map((email, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-800 p-2 rounded"
                        >
                          <span className="text-white">{email}</span>
                          <button
                            onClick={() =>
                              setIndividualEmails((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "triggers" && (
              <div className="space-y-8">
                {/* Log Alerts */}
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">
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
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>

                  {alertTriggers.logs.enabled && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                          Severity Levels
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {["critical", "error", "warning", "info"].map(
                            (level) => (
                              <label
                                key={level}
                                className="flex items-center space-x-2 cursor-pointer"
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
                                  className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded"
                                />
                                <span className="text-slate-300 capitalize">
                                  {level}
                                </span>
                              </label>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                          Log Types
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                              className="flex items-center space-x-2 cursor-pointer"
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
                                className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded"
                              />
                              <span className="text-slate-300 capitalize">
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
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">
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
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>

                  {alertTriggers.errors.enabled && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                          Error Types
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                              className="flex items-center space-x-2 cursor-pointer"
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
                                className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded"
                              />
                              <span className="text-slate-300">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                          Thresholds
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm text-slate-400 mb-2">
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
                                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
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
                                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                              >
                                <option value="percent">%</option>
                                <option value="count">count</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-slate-400 mb-2">
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
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
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
              <div className="space-y-8">
                {/* Alert Frequency */}
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    Alert Frequency
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Notification Frequency
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
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
                            className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600"
                          />
                          <div>
                            <span className="text-white">Immediate</span>
                            <p className="text-sm text-slate-400">
                              Send alerts as soon as they occur
                            </p>
                          </div>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
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
                            className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600"
                          />
                          <div>
                            <span className="text-white">Batched</span>
                            <p className="text-sm text-slate-400">
                              Group alerts and send periodically
                            </p>
                          </div>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
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
                            className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600"
                          />
                          <div>
                            <span className="text-white">Digest</span>
                            <p className="text-sm text-slate-400">
                              Send summary reports on schedule
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {generalConfig.alertFrequency === "batched" && (
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">
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
                          className="w-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                          min="1"
                          max="1440"
                        />
                      </div>
                    )}

                    {generalConfig.alertFrequency === "digest" && (
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">
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
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
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
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Quiet Hours
                      </h3>
                      <p className="text-sm text-slate-400">
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
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>

                  {generalConfig.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">
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
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">
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
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Escalation Rules */}
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Escalation Rules
                      </h3>
                      <p className="text-sm text-slate-400">
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
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>

                  {generalConfig.escalationRules.enabled && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">
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
                          className="w-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                          min="1"
                        />
                      </div>

                      <div>
                        <h4 className="text-lg font-medium text-white mb-4">
                          Escalation Levels
                        </h4>
                        <div className="space-y-4">
                          {generalConfig.escalationRules.escalationLevels.map(
                            (level, index) => (
                              <div
                                key={index}
                                className="bg-slate-800 p-4 rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-white">
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
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm text-slate-400 mb-2">
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
                                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm text-slate-400 mb-2">
                                      Notify Emails
                                    </label>
                                    <div className="space-y-2">
                                      {level.notify.map((email, emailIndex) => (
                                        <div
                                          key={emailIndex}
                                          className="flex items-center space-x-2"
                                        >
                                          <span className="text-white text-sm">
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
                                            className="text-red-400 hover:text-red-300"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                      <input
                                        type="email"
                                        placeholder="Add email"
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
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
                            className="flex items-center space-x-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Escalation Level</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alert Retention */}
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    Alert Retention
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">
                        Keep Alerts For (days)
                      </label>
                      <input
                        type="number"
                        defaultValue="30"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                        min="1"
                        max="365"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">
                        Archive After (days)
                      </label>
                      <input
                        type="number"
                        defaultValue="90"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                        min="1"
                        max="365"
                      />
                    </div>
                  </div>
                </div>

                {/* Alert Formatting */}
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    Alert Formatting
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded"
                        />
                        <span className="text-white">
                          Include timestamp in alerts
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded"
                        />
                        <span className="text-white">
                          Include severity level
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded"
                        />
                        <span className="text-white">
                          Include source information
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded"
                        />
                        <span className="text-white">
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
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Test configuration - send a test alert
              console.log("Sending test alert...");
            }}
            className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg transition-colors"
          >
            Test Configuration
          </button>
          <button
            onClick={handleSaveConfiguration}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertConfiguration;
