import { taskAPI } from "./api.js";
import {
  createTask,
  toTaskCreatePayload,
  toTaskUpdatePayload,
} from "../models/Task.js";

export const taskService = {
  async getTasks() {
    const result = await taskAPI.getTasks();
    if (!result.success) return result;

    return { success: true, data: result.data.map(createTask) };
  },

  async createTask(input) {
    const result = await taskAPI.createTask(toTaskCreatePayload(input));
    if (!result.success) return result;

    return { success: true, data: createTask(result.data) };
  },

  deleteTask(id) {
    return taskAPI.deleteTask(id);
  },

  async updateTask(id, input) {
    const payload = toTaskUpdatePayload(input);
    const result = await taskAPI.updateTask(
      id,
      payload.title,
      payload.description,
      payload.priority
    );
    if (!result.success) return result;

    return { success: true, data: createTask(result.data) };
  },

  async toggleTask(id) {
    const result = await taskAPI.toggleTask(id);
    if (!result.success) return result;

    return { success: true, data: createTask(result.data) };
  },
};
