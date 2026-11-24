import { createUser } from "../models/User.js";
import { taskAPI } from "./api.js";

export const userService = {
  async getCurrentUser() {
    const result = await taskAPI.getCurrentUser();
    if (!result.success) return result;

    const data = result.data.user ?? result.data;
    return { success: true, data: createUser(data) };
  },

  async getUsers() {
    const result = await taskAPI.getUsers();
    if (!result.success) return result;

    const data = Array.isArray(result.data) ? result.data : result.data.users ?? [];
    return { success: true, data: data.map(createUser) };
  },

  setUserEnabled(id, enabled) {
    return taskAPI.setUserEnabled(id, enabled);
  },
};
