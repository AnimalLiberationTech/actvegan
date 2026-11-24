import { useEffect, useState } from "react";
import { taskService } from "../services/taskService.js";
import { userService } from "../services/userService.js";
import TaskForm from "../components/TaskForm.jsx";

const ADMIN_TYPES = ["admin", "super_admin"];

function AdminDashboard({ user }) {
  const isSuperAdmin = user?.user_type === "super_admin";
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    capacity: 1,
    type: "action",
    timeRequired: "",
    tools: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const [taskResult, userResult] = await Promise.all([
      taskService.getTasks(),
      userService.getUsers(),
    ]);

    if (taskResult.success) setTasks(taskResult.data);
    if (userResult.success) {
      setUsers(userResult.data);
    }
    if (!taskResult.success || !userResult.success) {
      setError(taskResult.error ?? userResult.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!ADMIN_TYPES.includes(user?.user_type)) return undefined;
    const loadTimer = setTimeout(loadData, 0);
    return () => clearTimeout(loadTimer);
  }, [user?.user_type]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      priority: "medium",
      capacity: 1,
      type: "action",
      timeRequired: "",
      tools: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);

    const result = editingId
      ? await taskService.updateTask(editingId, {
          title: form.title,
          description: form.description,
          priority: form.priority,
        })
      : await taskService.createTask({
          title: form.title.trim(),
          description: form.description.trim() || null,
          priority: form.priority,
          completed: false,
          capacity: Number(form.capacity),
          type: form.type,
          time_required: form.timeRequired.trim() || null,
          tools: form.tools
            .split(",")
            .map((tool) => tool.trim())
            .filter(Boolean),
          extra: {},
        });

    if (result.success) {
      resetForm();
      await loadData();
    } else {
      setError(result.error);
    }
    setSaving(false);
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title ?? "",
      description: task.description ?? "",
      priority: task.priority ?? "medium",
      capacity: task.capacity ?? 1,
      type: task.type ?? "action",
      timeRequired: task.time_required ?? "",
      tools: Array.isArray(task.tools) ? task.tools.join(", ") : "",
    });
  };

  const handleDelete = async (id) => {
    const result = await taskService.deleteTask(id);
    if (result.success) setTasks((current) => current.filter((task) => task.id !== id));
    else setError(result.error);
  };

  const handleUserStatus = async (targetUser) => {
    const enabled = targetUser.user_type !== "disabled";
    const result = await userService.setUserEnabled(targetUser.id, !enabled);
    if (result.success) await loadData();
    else setError(result.error);
  };

  if (!ADMIN_TYPES.includes(user?.user_type)) return null;

  return (
    <section className="grid gap-4 sm:gap-6">
      <div className="page-heading">
        <h1>Admin dashboard</h1>
        <p>Manage tasks and user access.</p>
      </div>

      {error && <div className="notice notice-error">{error}</div>}

      <TaskForm
        advanced
        form={form}
        setForm={setForm}
        handleSubmit={handleSubmit}
        editingId={editingId}
        saving={saving}
        resetForm={resetForm}
      />

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="panel admin-section">
          <h2>Tasks</h2>
          {loading ? <p>Loading...</p> : (
            <div className="grid gap-2.5">
              {tasks.length === 0 && <p className="empty-state">No tasks found.</p>}
              {tasks.map((task) => (
                <div key={task.id} className="admin-item">
                  <div>
                    <p>{task.title}</p>
                    <p className="subtle">
                      {task.priority} · {task.completed ? "Completed" : "Pending"} · Capacity: {task.capacity}
                    </p>
                    {task.description && <p className="subtle">{task.description}</p>}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button onClick={() => startEditing(task)} className="btn-link">Edit</button>
                    <button onClick={() => handleDelete(task.id)} className="btn-link">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel admin-section">
          <h2>Users</h2>
          <div className="grid gap-2.5">
            {users.length === 0 && <p className="empty-state">No users found.</p>}
            {users.map((targetUser) => {
              const enabled = targetUser.user_type !== "disabled";
              return (
                <div key={targetUser.id} className="admin-item">
                  <div>
                    <p>{targetUser.display_name ?? targetUser.email}</p>
                    <p className="subtle">{targetUser.user_type} · {enabled ? "Enabled" : "Disabled"}</p>
                  </div>
                  <button
                    onClick={() => handleUserStatus(targetUser)}
                    disabled={!isSuperAdmin}
                    className="btn-link"
                  >
                    {enabled ? "Disable" : "Enable"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
