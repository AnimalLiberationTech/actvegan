import { useState, useEffect, useCallback } from "react";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import TaskForm from "./components/TaskForm.jsx";
import TaskList from "./components/TaskList.jsx";
import { userService } from "./services/userService.js";
import { useTasks } from "./hooks/useTasks.js";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home.jsx";
import Stats from "./pages/Stats.jsx";
import Donate from "./pages/Donate.jsx";
import TelegramLogin from "./components/TelegramLogin.jsx";
import { useTelegramApp } from "./hooks/useTelegramApp.js";
import "./index.css";

function App() {

  // Telegram Mini App detection — always called at top level (Rules of Hooks)
  const { isInTelegram } = useTelegramApp();
  const [tgAuthDone, setTgAuthDone] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const navigate = useNavigate();
  
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const [addingTask, setAddingTask] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [filter, setFilter] = useState("all");
  const {
    tasks,
    loading,
    error,
    setError,
    fetchTasks,
    createTask,
    deleteTask,
    updateTask,
    toggleTask,
  } = useTasks();

 
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

 
  const fetchUser = useCallback(async () => {
    setUserLoading(true);
    const result = await userService.getCurrentUser();
    if (result.success) {
      setUsername(result.data.email);
      setCurrentUser(result.data);
    } else {
      setError(result.error);
    }
    setUserLoading(false);
  }, [setError]);


  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchUser();
    }
  }, [fetchTasks, fetchUser, isAuthenticated]);


  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    if (filter === "high") return t.priority === "high";
    if (filter === "medium") return t.priority === "medium";
    if (filter === "low") return t.priority === "low";
    return true;
  });


  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate("/login");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!task.trim()) {
      setError("Task cannot be empty");
      return;
    }

    setAddingTask(true);

    const result = await createTask({ title: task, description, priority });

    if (result.success) {
      setTask("");
      setDescription("");
      setPriority("medium");
      showSuccess("Task added successfully");
    } else {
      setError(result.error);
    }

    setAddingTask(false);
  };


  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const result = await deleteTask(id);
      if (result.success) showSuccess("Task deleted successfully");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = async (id) => {
    setUpdatingId(id);
    try {
      const result = await updateTask(id, {
        title: editText,
        description,
        priority,
      });

      if (result.success) {
        setEditId(null);
        setEditText("");
        showSuccess("Task updated successfully");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      await toggleTask(id);
    } finally {
      setTogglingId(null);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 2000);
  };


  if (isAuthenticated && (userLoading || !currentUser)) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <p className="loading-state py-7 text-center text-[var(--muted)]">Loading your account...</p>
      </div>
    );
  }

  // Inside Telegram and not yet authenticated: attempt auto-login via initData
  if (isInTelegram && !isAuthenticated && !tgAuthDone) {
    return (
      <TelegramLogin
        onLogin={() => {
          setIsAuthenticated(true);
          setTgAuthDone(true);
          navigate("/dashboard");
        }}
        onFallback={() => setTgAuthDone(true)}
      />
    );
  }

  const taskDashboard = (
    <div className="panel dashboard-panel">
      <div className="mb-6"><h1>Task Manager</h1><p>Keep your next actions visible and moving.</p></div>

      {error && (
        <div className="notice notice-error">{error}</div>
      )}

      <TaskForm
        task={task}
        setTask={setTask}
        description={description}
        setDescription={setDescription}
        priority={priority}
        setPriority={setPriority}
        handleSubmit={handleSubmit}
        addingTask={addingTask}
        loading={loading}
      />

      {successMsg && (
        <div className="notice notice-success">{successMsg}</div>
      )}

      <TaskList
        tasks={tasks}
        filteredTasks={filteredTasks}
        filter={filter}
        setFilter={setFilter}
        loading={loading}
        editId={editId}
        editText={editText}
        setEditText={setEditText}
        updatingId={updatingId}
        togglingId={togglingId}
        deletingId={deletingId}
        handleToggle={handleToggle}
        handleUpdate={handleUpdate}
        handleDelete={handleDelete}
        setEditId={setEditId}
        setError={setError}
      />
    </div>
  );

  const authenticatedRoutes = (
    <>
      <Route
        path="/"
        element={
          <Navigate
            to={
              ["admin", "super_admin"].includes(currentUser?.user_type)
                ? "/admin"
                : "/dashboard"
            }
            replace
          />
        }
      />
      <Route
        path="/dashboard"
        element={
          ["admin", "super_admin"].includes(currentUser?.user_type) ? (
            <Navigate to="/admin" replace />
          ) : (
            taskDashboard
          )
        }
      />
      <Route
        path="/admin"
        element={
          ["admin", "super_admin"].includes(currentUser?.user_type) ? (
            <AdminDashboard user={currentUser} />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={
              ["admin", "super_admin"].includes(currentUser?.user_type)
                ? "/admin"
                : "/dashboard"
            }
            replace
          />
        }
      />
    </>
  );

  const authenticatedLayout = (
    <>
      <Navbar
        onLogout={handleLogout}
        username={username}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isAdmin={["admin", "super_admin"].includes(currentUser?.user_type)}
      />
      <div className="min-h-[calc(100vh-65px)] px-2.5 py-5 sm:px-4 sm:py-12">
        <div className="mx-auto w-full max-w-[1120px]">
          <Outlet />
        </div>
      </div>
    </>
  );

  return (
    <Routes>
      <Route path="/stats" element={<Stats />} />
      <Route path="/donate" element={<Donate />} />
      {!isAuthenticated ? (
        <>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <Login
                onLogin={() => {
                  setIsAuthenticated(true);
                  navigate("/dashboard");
                }}
                onSwitchToRegister={() => navigate("/register")}
              />
            }
          />
          <Route
            path="/register"
            element={
              <Register
                onRegister={() => navigate("/login")}
                onSwitchToLogin={() => navigate("/login")}
              />
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <Route element={authenticatedLayout}>{authenticatedRoutes}</Route>
      )}
    </Routes>
  );
}

export default App;