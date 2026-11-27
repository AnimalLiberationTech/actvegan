import axios from "axios";


const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000",
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("tgAuthDone");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);


export const taskAPI = {
  async getTasks() {
    try {
      const response = await API.get("/tasks/");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createTask(task) {
    try {
      const response = await API.post("/tasks/", task);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteTask(id) {
    try {
      await API.delete(`/tasks/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateTask(id, title, description, priority, assigneeId = null) {
    try {
      const response = await API.put(`/tasks/${id}`, {
        title,
        description,
        priority,
        ...(assigneeId ? { assignee_id: assigneeId } : {}),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async toggleTask(id) {
    try {
      const response = await API.patch(`/tasks/${id}/toggle`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  async getCurrentUser() {
  try {
    const response = await API.get("/users/me");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
},
async getUsers() {
  try {
    const response = await API.get("/users/");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
},
async setUserEnabled(id, enabled) {
  try {
    const response = await API.patch(`/users/${id}/${enabled ? "enable" : "disable"}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
},

async telegramAuth(payload) {
  try {
    const response = await API.post(
      "/auth/telegram",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    return { success: true, data: response.data };
  } catch (error) {
    const detail = error.response?.data?.detail;
    const message =
      (typeof detail === "object" && detail?.message) ||
      (typeof detail === "string" && detail) ||
      error.message;
    return { success: false, error: message };
  }
},
};

export default API;