import React, { useState, useMemo } from "react";
import {
  Bell,
  Mail,
  MessageSquare,
  Trash2,
  Edit3,
  Plus,
  Search,
  Grid,
  List,
  Users,
  AlertTriangle,
  Bug,
  Database,
  Globe,
  Clock,
  X,
  Eye,
  EyeOff,
  Cog,
  Settings,
  Save,
  ChevronDown,
  Check,
} from "lucide-react";
import { Project } from "@/types/dashboard";

// import AlertConfiguration from "./settings/config";

const AlertPage = ({ project }: { project: Project }) => {
  const [view, setView] = useState("grid");
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [showConfigPage, setShowConfigPage] = useState(false);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      name: "Critical Database Errors",
      type: "error",
      severity: "critical",
      status: "active",
      triggers: { errorRate: ">5%", responseTime: ">2s" },
      notifications: {
        email: ["admin@company.com"],
        slack: true,
        slackChannel: "#alerts",
        groups: ["dev-team"],
        excludedEmails: [],
      },
      created: "2024-06-15",
      lastTriggered: "2024-06-18 14:30",
      alertFor: "error",
      errorTypes: ["database"],
    },
    {
      id: 2,
      name: "API Response Time",
      type: "performance",
      severity: "warning",
      status: "active",
      triggers: { responseTime: ">1s", frequency: "5 mins" },
      notifications: {
        email: ["dev@company.com"],
        slack: false,
        slackChannel: "",
        groups: [],
        excludedEmails: [],
      },
      created: "2024-06-12",
      lastTriggered: "2024-06-17 09:15",
      alertFor: "log",
      logPattern: "API slow",
    },
    {
      id: 3,
      name: "404 Error Spike",
      type: "error",
      severity: "medium",
      status: "paused",
      triggers: { errorCode: "404", count: ">50/hour" },
      notifications: {
        email: ["support@company.com"],
        slack: true,
        slackChannel: "#support",
        groups: ["support"],
        excludedEmails: ["inactive@company.com"],
      },
      created: "2024-06-10",
      lastTriggered: "Never",
      alertFor: "error",
      errorTypes: ["http"],
    },
  ]);

  const [config, setConfig] = useState({
    emails: ["admin@company.com", "dev@company.com", "support@company.com"],
    groups: [
      { name: "dev-team", emails: ["admin@company.com", "dev@company.com"] },
      { name: "support", emails: ["support@company.com"] },
    ],
    slackChannels: ["#alerts", "#support"],
  });

  const [newAlert, setNewAlert] = useState({
    name: "",
    type: "error",
    severity: "medium",
    triggers: {},
    notifications: {
      email: [],
      slack: false,
      slackChannel: "",
      groups: [],
      excludedEmails: [],
    },
    status: "active",
    alertFor: "error",
    errorTypes: [],
    logPattern: "",
  });

  const severityColors = {
    critical: "bg-red-500/20 text-red-300 border-red-500/30",
    warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    medium: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    low: "bg-green-500/20 text-green-300 border-green-500/30",
  };

  const typeIcons = {
    error: Bug,
    performance: Clock,
    database: Database,
    network: Globe,
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch = alert.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterType === "all" ||
        alert.type === filterType ||
        alert.severity === filterType ||
        alert.status === filterType ||
        alert.alertFor === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [alerts, searchTerm, filterType]);

  const handleSelectAlert = (alertId) => {
    setSelectedAlerts((prev) =>
      prev.includes(alertId)
        ? prev.filter((id) => id !== alertId)
        : [...prev, alertId]
    );
  };

  const handleSelectAll = () => {
    setSelectedAlerts(
      selectedAlerts.length === filteredAlerts.length
        ? []
        : filteredAlerts.map((alert) => alert.id)
    );
  };

  const handleDeleteSelected = () => {
    setAlerts((prev) =>
      prev.filter((alert) => !selectedAlerts.includes(alert.id))
    );
    setSelectedAlerts([]);
  };

  const handleToggleStatus = (alertId) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: alert.status === "active" ? "paused" : "active",
            }
          : alert
      )
    );
  };

  const handleCreateAlert = () => {
    const id = Math.max(...alerts.map((a) => a.id), 0) + 1;
    setAlerts((prev) => [
      ...prev,
      {
        ...newAlert,
        id,
        created: new Date().toISOString().split("T")[0],
        lastTriggered: "Never",
      },
    ]);
    setNewAlert({
      name: "",
      type: "error",
      severity: "medium",
      triggers: {},
      notifications: {
        email: [],
        slack: false,
        slackChannel: "",
        groups: [],
        excludedEmails: [],
      },
      status: "active",
      alertFor: "error",
      errorTypes: [],
      logPattern: "",
    });
    setShowCreateModal(false);
  };

  const handleEditAlert = () => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === editingAlert.id ? editingAlert : alert))
    );
    setShowEditModal(false);
    setEditingAlert(null);
  };

  const AlertCard = ({ alert }) => {
    const TypeIcon = typeIcons[alert.type] || Bug;

    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedAlerts.includes(alert.id)}
              onChange={() => handleSelectAlert(alert.id)}
              className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
            />
            <TypeIcon className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                {alert.name}
              </h3>
              <p className="text-sm text-slate-400 capitalize">{alert.type}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium border ${
                severityColors[alert.severity]
              }`}
            >
              {alert.severity}
            </span>
            <button
              onClick={() => handleToggleStatus(alert.id)}
              className={`p-1 rounded ${
                alert.status === "active"
                  ? "text-green-400 hover:bg-green-500/20"
                  : "text-slate-500 hover:bg-slate-700"
              }`}
            >
              {alert.status === "active" ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Notifications</span>
            <div className="flex items-center space-x-2">
              {alert.notifications.email.length > 0 && (
                <Mail className="w-4 h-4 text-blue-400" />
              )}
              {alert.notifications.slack && (
                <MessageSquare className="w-4 h-4 text-green-400" />
              )}
              {alert.notifications.groups.length > 0 && (
                <Users className="w-4 h-4 text-yellow-400" />
              )}
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Created: {alert.created} • Last: {alert.lastTriggered}
          </div>
          <div className="text-xs text-slate-500">
            Alert For: {alert.alertFor} •{" "}
            {alert.alertFor === "error"
              ? `Types: ${alert.errorTypes.join(", ")}`
              : `Pattern: ${alert.logPattern}`}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span
            className={`px-2 py-1 rounded text-xs ${
              alert.status === "active"
                ? "bg-green-500/20 text-green-300"
                : "bg-slate-500/20 text-slate-400"
            }`}
          >
            {alert.status}
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setEditingAlert(alert);
                setShowEditModal(true);
              }}
              className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/20 rounded transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setAlerts((prev) => prev.filter((a) => a.id !== alert.id))
              }
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AlertRow = ({ alert }) => {
    const TypeIcon = typeIcons[alert.type] || Bug;

    return (
      <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={selectedAlerts.includes(alert.id)}
            onChange={() => handleSelectAlert(alert.id)}
            className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <TypeIcon className="w-4 h-4 text-purple-400" />
            <div>
              <div className="font-medium text-white">{alert.name}</div>
              <div className="text-sm text-slate-400 capitalize">
                {alert.type}
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium border ${
              severityColors[alert.severity]
            }`}
          >
            {alert.severity}
          </span>
        </td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 rounded text-xs ${
              alert.status === "active"
                ? "bg-green-500/20 text-green-300"
                : "bg-slate-500/20 text-slate-400"
            }`}
          >
            {alert.status}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            {alert.notifications.email.length > 0 && (
              <Mail className="w-4 h-4 text-blue-400" />
            )}
            {alert.notifications.slack && (
              <MessageSquare className="w-4 h-4 text-green-400" />
            )}
            {alert.notifications.groups.length > 0 && (
              <Users className="w-4 h-4 text-yellow-400" />
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-slate-400">
          {alert.lastTriggered}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleToggleStatus(alert.id)}
              className={`p-1 rounded ${
                alert.status === "active"
                  ? "text-green-400 hover:bg-green-500/20"
                  : "text-slate-500 hover:bg-slate-700"
              }`}
            >
              {alert.status === "active" ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => {
                setEditingAlert(alert);
                setShowEditModal(true);
              }}
              className="p-1 text-slate-400 hover:text-purple-400 hover:bg-purple-500/20 rounded transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setAlerts((prev) => prev.filter((a) => a.id !== alert.id))
              }
              className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  };

  // config page
  const ConfigurationPage = () => {
    // Mock initial config - replace with your actual config state
    const [config, setConfig] = useState({
      emails: ["john@example.com", "sarah@example.com", "mike@example.com"],
      groups: [
        {
          id: 1,
          name: "Development Team",
          emails: ["john@example.com", "sarah@example.com"],
        },
        { id: 2, name: "Operations", emails: ["mike@example.com"] },
      ],
      slackChannels: ["#alerts", "#dev-alerts"],
      alertConditions: {
        alertFor: "error",
        errorTypes: ["database", "http"],
        logPattern: "",
        severityLevels: ["critical", "warning"],
      },
    });

    const [activeTab, setActiveTab] = useState("emails");
    const [editingGroup, setEditingGroup] = useState(null);
    const [showGroupDialog, setShowGroupDialog] = useState(false);
    const [newGroupForm, setNewGroupForm] = useState({ name: "", emails: [] });
    const [newEmail, setNewEmail] = useState("");
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [newSlackChannel, setNewSlackChannel] = useState("");

    // Multi-select dropdown states
    const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);
    const [showErrorTypeDropdown, setShowErrorTypeDropdown] = useState(false);

    // Dropdown options
    const severityOptions = [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "warning", label: "Warning" },
      { value: "critical", label: "Critical" },
    ];

    const errorTypeOptions = [
      { value: "database", label: "Database Errors" },
      { value: "http", label: "HTTP Errors" },
      { value: "network", label: "Network Errors" },
      { value: "application", label: "Application Errors" },
    ];

    // Email Management
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleAddEmail = () => {
      // Handle multiple emails separated by comma or pipe
      const emailsToAdd = newEmail
        .split(/[,|]/)
        .map((email) => email.trim())
        .filter(
          (email) =>
            email && validateEmail(email) && !config.emails.includes(email)
        );

      if (emailsToAdd.length > 0) {
        setConfig((prev) => ({
          ...prev,
          emails: [...prev.emails, ...emailsToAdd],
        }));
        setNewEmail("");
      }
    };

    const handleRemoveEmails = () => {
      if (selectedEmails.length === 0) return;

      setConfig((prev) => ({
        ...prev,
        emails: prev.emails.filter((e) => !selectedEmails.includes(e)),
        groups: prev.groups.map((group) => ({
          ...group,
          emails: group.emails.filter((e) => !selectedEmails.includes(e)),
        })),
      }));
      setSelectedEmails([]);
    };

    const toggleEmailSelection = (email) => {
      setSelectedEmails((prev) =>
        prev.includes(email)
          ? prev.filter((e) => e !== email)
          : [...prev, email]
      );
    };

    const selectAllEmails = () => {
      setSelectedEmails(config.emails);
    };

    const clearEmailSelection = () => {
      setSelectedEmails([]);
    };

    //   const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // const handleAddEmail = () => {
    //   if (validateEmail(newEmail) && !config.emails.includes(newEmail)) {
    //     setConfig((prev) => ({ ...prev, emails: [...prev.emails, newEmail] }));
    //     setNewEmail("");
    //   } else {
    //     alert("Invalid or duplicate email address.");
    //   }
    // };

    // const handleRemoveEmail = (email) => {
    //   setConfirmAction({
    //     action: () =>
    //       setConfig((prev) => ({
    //         ...prev,
    //         emails: prev.emails.filter((e) => e !== email),
    //         groups: prev.groups.map((group) => ({
    //           ...group,
    //           emails: group.emails.filter((e) => e !== email),
    //         })),
    //       })),
    //     message: `Are you sure you want to remove ${email}? This will also remove it from all groups.`,
    //   });
    //   setShowConfirmModal(true);
    // };

    // const handleAddGroup = () => {
    //   if (newGroupName && !config.groups.find((g) => g.name === newGroupName)) {
    //     setConfig((prev) => ({
    //       ...prev,
    //       groups: [
    //         ...prev.groups,
    //         { name: newGroupName, emails: newGroupEmails },
    //       ],
    //     }));
    //     setNewGroupName("");
    //     setNewGroupEmails([]);
    //   } else {
    //     alert("Group name is empty or already exists.");
    //   }
    // };

    // const handleRemoveGroup = (groupName) => {
    //   setConfirmAction({
    //     action: () =>
    //       setConfig((prev) => ({
    //         ...prev,
    //         groups: prev.groups.filter((g) => g.name !== groupName),
    //       })),
    //     message: `Are you sure you want to remove the group ${groupName}?`,
    //   });
    //   setShowConfirmModal(true);
    // };

    // const handleAddSlackChannel = () => {
    //   if (newSlackChannel && !config.slackChannels.includes(newSlackChannel)) {
    //     if (/^#[a-zA-Z0-9_-]+$/.test(newSlackChannel)) {
    //       setConfig((prev) => ({
    //         ...prev,
    //         slackChannels: [...prev.slackChannels, newSlackChannel],
    //       }));
    //       setNewSlackChannel("");
    //     } else {
    //       alert(
    //         "Slack channel must start with # and contain valid characters."
    //       );
    //     }
    //   } else {
    //     alert("Slack channel is empty or already exists.");
    //   }
    // };

    // const handleRemoveSlackChannel = (channel) => {
    //   setConfirmAction({
    //     action: () =>
    //       setConfig((prev) => ({
    //         ...prev,
    //         slackChannels: prev.slackChannels.filter((c) => c !== channel),
    //       })),
    //     message: `Are you sure you want to remove the Slack channel ${channel}?`,
    //   });
    //   setShowConfirmModal(true);
    // };

    // Group Management
    const handleSaveGroup = () => {
      if (!newGroupForm.name.trim()) return;

      if (editingGroup) {
        setConfig((prev) => ({
          ...prev,
          groups: prev.groups.map((group) =>
            group.id === editingGroup.id
              ? {
                  ...group,
                  name: newGroupForm.name,
                  emails: newGroupForm.emails,
                }
              : group
          ),
        }));
      } else {
        const newGroup = {
          id: Date.now(),
          name: newGroupForm.name,
          emails: newGroupForm.emails,
        };
        setConfig((prev) => ({ ...prev, groups: [...prev.groups, newGroup] }));
      }

      setShowGroupDialog(false);
      setEditingGroup(null);
      setNewGroupForm({ name: "", emails: [] });
    };

    const handleEditGroup = (group) => {
      setEditingGroup(group);
      setNewGroupForm({ name: group.name, emails: [...group.emails] });
      setShowGroupDialog(true);
    };

    const handleDeleteGroup = (groupId) => {
      setConfig((prev) => ({
        ...prev,
        groups: prev.groups.filter((group) => group.id !== groupId),
      }));
    };

    const toggleEmailInGroup = (email) => {
      setNewGroupForm((prev) => ({
        ...prev,
        emails: prev.emails.includes(email)
          ? prev.emails.filter((e) => e !== email)
          : [...prev.emails, email],
      }));
    };

    // Slack Management
    const handleAddSlackChannel = () => {
      if (newSlackChannel && !config.slackChannels.includes(newSlackChannel)) {
        if (/^#[a-zA-Z0-9_-]+$/.test(newSlackChannel)) {
          setConfig((prev) => ({
            ...prev,
            slackChannels: [...prev.slackChannels, newSlackChannel],
          }));
          setNewSlackChannel("");
        }
      }
    };

    const handleRemoveSlackChannel = (channel) => {
      setConfig((prev) => ({
        ...prev,
        slackChannels: prev.slackChannels.filter((c) => c !== channel),
      }));
    };

    // Multi-select dropdown handlers
    const handleSeverityToggle = (value) => {
      setConfig((prev) => ({
        ...prev,
        alertConditions: {
          ...prev.alertConditions,
          severityLevels: prev.alertConditions.severityLevels.includes(value)
            ? prev.alertConditions.severityLevels.filter(
                (level) => level !== value
              )
            : [...prev.alertConditions.severityLevels, value],
        },
      }));
    };

    const handleErrorTypeToggle = (value) => {
      setConfig((prev) => ({
        ...prev,
        alertConditions: {
          ...prev.alertConditions,
          errorTypes: prev.alertConditions.errorTypes.includes(value)
            ? prev.alertConditions.errorTypes.filter((type) => type !== value)
            : [...prev.alertConditions.errorTypes, value],
        },
      }));
    };

    const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
      <button
        onClick={() => onClick(id)}
        className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
          isActive
            ? "bg-purple-500 text-white"
            : "text-slate-400 hover:text-white hover:bg-slate-700/50"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </button>
    );

    const MultiSelectDropdown = ({
      label,
      options,
      selectedValues,
      onToggle,
      isOpen,
      setIsOpen,
      placeholder = "Select options...",
    }) => (
      <div className="relative">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 flex items-center justify-between"
        >
          <span className="text-left flex-1">
            {selectedValues.length === 0 ? (
              <span className="text-slate-400">{placeholder}</span>
            ) : selectedValues.length === 1 ? (
              options.find((opt) => opt.value === selectedValues[0])?.label
            ) : (
              `${selectedValues.length} options selected`
            )}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onToggle(option.value)}
                className="w-full px-4 py-2 text-left hover:bg-slate-600 flex items-center justify-between text-white transition-colors"
              >
                <span>{option.label}</span>
                {selectedValues.includes(option.value) && (
                  <Check className="w-4 h-4 text-purple-400" />
                )}
              </button>
            ))}
          </div>
        )}

        {selectedValues.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedValues.map((value) => {
              const option = options.find((opt) => opt.value === value);
              return (
                <span
                  key={value}
                  className="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                >
                  {option?.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(value);
                    }}
                    className="ml-1 hover:text-purple-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    );

    const GroupDialog = () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              {editingGroup ? "Edit Group" : "Create New Group"}
            </h3>
            <button
              onClick={() => {
                setShowGroupDialog(false);
                setEditingGroup(null);
                setNewGroupForm({ name: "", emails: [] });
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={newGroupForm.name}
                onChange={(e) =>
                  setNewGroupForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter group name"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Members
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {config.emails.map((email) => (
                  <label
                    key={email}
                    className="flex items-center space-x-3 p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={newGroupForm.emails.includes(email)}
                      onChange={() => toggleEmailInGroup(email)}
                      className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white text-sm">{email}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowGroupDialog(false);
                setEditingGroup(null);
                setNewGroupForm({ name: "", emails: [] });
              }}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveGroup}
              disabled={!newGroupForm.name.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{editingGroup ? "Update" : "Create"} Group</span>
            </button>
          </div>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                <Cog className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Alert Configuration
                </h1>
                <p className="text-slate-400 mt-1">
                  Manage notification settings and alert conditions
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowConfigPage(false)}
              className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 mb-8 bg-slate-800 p-2 rounded-xl">
            <TabButton
              id="emails"
              label="Email Addresses"
              icon={Mail}
              isActive={activeTab === "emails"}
              onClick={setActiveTab}
            />
            <TabButton
              id="groups"
              label="Groups"
              icon={Users}
              isActive={activeTab === "groups"}
              onClick={setActiveTab}
            />
            <TabButton
              id="slack"
              label="Slack Channels"
              icon={MessageSquare}
              isActive={activeTab === "slack"}
              onClick={setActiveTab}
            />
            <TabButton
              id="conditions"
              label="Alert Conditions"
              icon={Settings}
              isActive={activeTab === "conditions"}
              onClick={setActiveTab}
            />
          </div>

          {/* Content Sections */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            {/* Email Management */}
            {activeTab === "emails" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Email Addresses
                  </h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-400">
                      {config.emails.length} addresses
                    </span>
                    {selectedEmails.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-purple-400">
                          {selectedEmails.length} selected
                        </span>
                        <button
                          onClick={handleRemoveEmails}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove Selected</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter email address(es) - separate multiple with comma or |"
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddEmail}
                    disabled={!newEmail.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                {config.emails.length > 0 && (
                  <div className="flex items-center space-x-4 text-sm">
                    <button
                      onClick={selectAllEmails}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearEmailSelection}
                      className="text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {config.emails.map((email) => (
                    <div
                      key={email}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedEmails.includes(email)
                          ? "bg-purple-500/20 border-purple-500/50"
                          : "bg-slate-700 border-transparent hover:border-slate-600"
                      }`}
                      onClick={() => toggleEmailSelection(email)}
                    >
                      <span className="text-white text-sm">{email}</span>
                      <div className="flex items-center space-x-1">
                        {selectedEmails.includes(email) && (
                          <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group Management */}
            {activeTab === "groups" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Email Groups
                  </h2>
                  <button
                    onClick={() => setShowGroupDialog(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Group</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {config.groups.map((group) => (
                    <div
                      key={group.id}
                      className="border border-slate-600 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-medium text-white">
                            {group.name}
                          </h3>
                          <p className="text-sm text-slate-400">
                            {group.emails.length} members
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditGroup(group)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.emails.map((email) => (
                          <span
                            key={email}
                            className="px-2 py-1 bg-slate-600 text-white text-xs rounded"
                          >
                            {email}
                          </span>
                        ))}
                        {group.emails.length === 0 && (
                          <span className="text-slate-500 text-sm">
                            No members assigned
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Slack Channel Management */}
            {activeTab === "slack" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Slack Channels
                  </h2>
                  <span className="text-sm text-slate-400">
                    {config.slackChannels.length} channels
                  </span>
                </div>

                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newSlackChannel}
                    onChange={(e) => setNewSlackChannel(e.target.value)}
                    placeholder="Enter Slack channel (e.g., #alerts)"
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddSlackChannel}
                    disabled={
                      !newSlackChannel ||
                      config.slackChannels.includes(newSlackChannel)
                    }
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {config.slackChannels.map((channel) => (
                    <div
                      key={channel}
                      className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                    >
                      <span className="text-white text-sm">{channel}</span>
                      <button
                        onClick={() => handleRemoveSlackChannel(channel)}
                        className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alert Conditions */}
            {activeTab === "conditions" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">
                  Alert Conditions
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Alert For
                    </label>
                    <select
                      value={config.alertConditions.alertFor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          alertConditions: {
                            ...prev.alertConditions,
                            alertFor: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="error">Errors</option>
                      <option value="log">Logs</option>
                    </select>
                  </div>

                  <MultiSelectDropdown
                    label="Severity Levels"
                    options={severityOptions}
                    selectedValues={config.alertConditions.severityLevels}
                    onToggle={handleSeverityToggle}
                    isOpen={showSeverityDropdown}
                    setIsOpen={setShowSeverityDropdown}
                    placeholder="Select severity levels..."
                  />

                  {config.alertConditions.alertFor === "error" && (
                    <div className="md:col-span-2">
                      <MultiSelectDropdown
                        label="Error Types"
                        options={errorTypeOptions}
                        selectedValues={config.alertConditions.errorTypes}
                        onToggle={handleErrorTypeToggle}
                        isOpen={showErrorTypeDropdown}
                        setIsOpen={setShowErrorTypeDropdown}
                        placeholder="Select error types..."
                      />
                    </div>
                  )}

                  {config.alertConditions.alertFor === "log" && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Log Pattern
                      </label>
                      <input
                        type="text"
                        value={config.alertConditions.logPattern}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            alertConditions: {
                              ...prev.alertConditions,
                              logPattern: e.target.value,
                            },
                          }))
                        }
                        placeholder="Enter log pattern (e.g., 'ERROR *')"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>

                {/* Selected Conditions Summary */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-300 mb-2">
                    Current Alert Configuration
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Alert Type:</span>
                      <span className="text-white capitalize">
                        {config.alertConditions.alertFor}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Severity Levels:</span>
                      <span className="text-white">
                        {config.alertConditions.severityLevels.length > 0
                          ? config.alertConditions.severityLevels
                              .map(
                                (level) =>
                                  severityOptions.find(
                                    (opt) => opt.value === level
                                  )?.label
                              )
                              .join(", ")
                          : "None selected"}
                      </span>
                    </div>
                    {config.alertConditions.alertFor === "error" && (
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">Error Types:</span>
                        <span className="text-white">
                          {config.alertConditions.errorTypes.length > 0
                            ? config.alertConditions.errorTypes
                                .map(
                                  (type) =>
                                    errorTypeOptions.find(
                                      (opt) => opt.value === type
                                    )?.label
                                )
                                .join(", ")
                            : "None selected"}
                        </span>
                      </div>
                    )}
                    {config.alertConditions.alertFor === "log" &&
                      config.alertConditions.logPattern && (
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">Log Pattern:</span>
                          <span className="text-white font-mono bg-slate-800 px-2 py-1 rounded">
                            {config.alertConditions.logPattern}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Group Dialog */}
        {showGroupDialog && <GroupDialog />}

        {/* Click outside handlers */}
        {(showSeverityDropdown || showErrorTypeDropdown) && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => {
              setShowSeverityDropdown(false);
              setShowErrorTypeDropdown(false);
            }}
          />
        )}
      </div>
    );
  };

  return showConfigPage ? (
    <ConfigurationPage />
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl">
            <Bell className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              Alert Management
            </h1>
            <p className="text-slate-400 mt-1">
              {alerts.length} total alerts •{" "}
              {alerts.filter((a) => a.status === "active").length} active
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowConfigPage(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
          >
            <Cog className="w-5 h-5" />
            <span>Configuration</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <Plus className="w-5 h-5" />
            <span>New Alert</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="error">Errors</option>
              <option value="performance">Performance</option>
              <option value="database">Database</option>
              <option value="log">Logs</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            {selectedAlerts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">
                  {selectedAlerts.length} selected
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center space-x-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            )}
            <div className="flex bg-slate-700/50 rounded-lg p-1">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded transition-colors ${
                  view === "grid"
                    ? "bg-purple-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded transition-colors ${
                  view === "list"
                    ? "bg-purple-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Display */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedAlerts.length === filteredAlerts.length &&
                      filteredAlerts.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                  Alert
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                  Severity
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                  Notifications
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                  Last Triggered
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Alert Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Alert"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Alert Name
            </label>
            <input
              type="text"
              value={newAlert.name}
              onChange={(e) =>
                setNewAlert((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Enter alert name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type
              </label>
              <select
                value={newAlert.type}
                onChange={(e) =>
                  setNewAlert((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="error">Error</option>
                <option value="performance">Performance</option>
                <option value="database">Database</option>
                <option value="network">Network</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Severity
              </label>
              <select
                value={newAlert.severity}
                onChange={(e) =>
                  setNewAlert((prev) => ({ ...prev, severity: e.target.value }))
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Alert For
            </label>
            <select
              value={newAlert.alertFor}
              onChange={(e) =>
                setNewAlert((prev) => ({
                  ...prev,
                  alertFor: e.target.value,
                  errorTypes: [],
                  logPattern: "",
                }))
              }
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="error">Errors</option>
              <option value="log">Logs</option>
            </select>
          </div>

          {newAlert.alertFor === "error" ? (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Error Types
              </label>
              <select
                multiple
                value={newAlert.errorTypes}
                onChange={(e) =>
                  setNewAlert((prev) => ({
                    ...prev,
                    errorTypes: Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    ),
                  }))
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="database">Database Errors</option>
                <option value="http">HTTP Errors</option>
                <option value="network">Network Errors</option>
                <option value="application">Application Errors</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Log Pattern
              </label>
              <input
                type="text"
                value={newAlert.logPattern}
                onChange={(e) =>
                  setNewAlert((prev) => ({
                    ...prev,
                    logPattern: e.target.value,
                  }))
                }
                placeholder="Enter log pattern (e.g., 'ERROR *')"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Notifications
            </label>
            <select
              multiple
              value={newAlert.notifications.email}
              onChange={(e) =>
                setNewAlert((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    email: Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    ),
                  },
                }))
              }
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            >
              {config.emails.map((email) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Groups
            </label>
            <select
              multiple
              value={newAlert.notifications.groups}
              onChange={(e) =>
                setNewAlert((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    groups: Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    ),
                  },
                }))
              }
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            >
              {config.groups.map((group) => (
                <option key={group.name} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Exclude Emails from Groups
            </label>
            <select
              multiple
              value={newAlert.notifications.excludedEmails}
              onChange={(e) =>
                setNewAlert((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    excludedEmails: Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    ),
                  },
                }))
              }
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            >
              {config.emails.map((email) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="slack"
              checked={newAlert.notifications.slack}
              onChange={(e) =>
                setNewAlert((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    slack: e.target.checked,
                  },
                }))
              }
              className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="slack" className="text-sm text-slate-300">
              Send to Slack
            </label>
          </div>

          {newAlert.notifications.slack && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Slack Channel
              </label>
              <select
                value={newAlert.notifications.slackChannel}
                onChange={(e) =>
                  setNewAlert((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      slackChannel: e.target.value,
                    },
                  }))
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a channel</option>
                {config.slackChannels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAlert}
              disabled={
                !newAlert.name ||
                (newAlert.notifications.slack &&
                  !newAlert.notifications.slackChannel)
              }
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Alert
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Alert Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Alert"
      >
        {editingAlert && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Alert Name
              </label>
              <input
                type="text"
                value={editingAlert.name}
                onChange={(e) =>
                  setEditingAlert((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type
                </label>
                <select
                  value={editingAlert.type}
                  onChange={(e) =>
                    setEditingAlert((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="error">Error</option>
                  <option value="performance">Performance</option>
                  <option value="database">Database</option>
                  <option value="network">Network</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Severity
                </label>
                <select
                  value={editingAlert.severity}
                  onChange={(e) =>
                    setEditingAlert((prev) => ({
                      ...prev,
                      severity: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Alert For
              </label>
              <select
                value={editingAlert.alertFor}
                onChange={(e) =>
                  setEditingAlert((prev) => ({
                    ...prev,
                    alertFor: e.target.value,
                    errorTypes: [],
                    logPattern: "",
                  }))
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="error">Errors</option>
                <option value="log">Logs</option>
              </select>
            </div>

            {editingAlert.alertFor === "error" ? (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Error Types
                </label>
                <select
                  multiple
                  value={editingAlert.errorTypes}
                  onChange={(e) =>
                    setEditingAlert((prev) => ({
                      ...prev,
                      errorTypes: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      ),
                    }))
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="database">Database Errors</option>
                  <option value="http">HTTP Errors</option>
                  <option value="network">Network Errors</option>
                  <option value="application">Application Errors</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Log Pattern
                </label>
                <input
                  type="text"
                  value={editingAlert.logPattern}
                  onChange={(e) =>
                    setEditingAlert((prev) => ({
                      ...prev,
                      logPattern: e.target.value,
                    }))
                  }
                  placeholder="Enter log pattern (e.g., 'ERROR *')"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Notifications
              </label>
              <select
                multiple
                value={editingAlert.notifications.email}
                onChange={(e) =>
                  setEditingAlert((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      email: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      ),
                    },
                  }))
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                {config.emails.map((email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Groups
              </label>
              <select
                multiple
                value={editingAlert.notifications.groups}
                onChange={(e) =>
                  setEditingAlert((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      groups: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      ),
                    },
                  }))
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                {config.groups.map((group) => (
                  <option key={group.name} value={group.name}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Exclude Emails from Groups
              </label>
              <select
                multiple
                value={editingAlert.notifications.excludedEmails}
                onChange={(e) =>
                  setEditingAlert((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      excludedEmails: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      ),
                    },
                  }))
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                {config.emails.map((email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="edit-slack"
                checked={editingAlert.notifications.slack}
                onChange={(e) =>
                  setEditingAlert((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      slack: e.target.checked,
                    },
                  }))
                }
                className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="edit-slack" className="text-sm text-slate-300">
                Send to Slack
              </label>
            </div>

            {editingAlert.notifications.slack && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Slack Channel
                </label>
                <select
                  value={editingAlert.notifications.slackChannel}
                  onChange={(e) =>
                    setEditingAlert((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        slackChannel: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a channel</option>
                  {config.slackChannels.map((channel) => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditAlert}
                disabled={
                  editingAlert.notifications.slack &&
                  !editingAlert.notifications.slackChannel
                }
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-400 mb-2">
            No alerts found
          </h3>
          <p className="text-slate-500">
            {searchTerm || filterType !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Create your first alert to get started"}
          </p>
        </div>
      )}
    </div>
  );
};

export default AlertPage;
