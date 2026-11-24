import { useCallback, useState } from "react";
import { taskService } from "../services/taskService.js";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await taskService.getTasks();

    if (result.success) {
      setTasks(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  const createTask = useCallback(async (input) => {
    const result = await taskService.createTask(input);
    if (!result.success) {
      setError(result.error);
      return result;
    }

    await fetchTasks();
    return result;
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id) => {
    const result = await taskService.deleteTask(id);
    if (result.success) {
      setTasks((current) => current.filter((task) => task.id !== id));
    } else {
      setError(result.error);
    }
    return result;
  }, []);

  const updateTask = useCallback(async (id, input) => {
    const result = await taskService.updateTask(id, input);
    if (!result.success) {
      setError(result.error);
      return result;
    }

    await fetchTasks();
    return result;
  }, [fetchTasks]);

  const toggleTask = useCallback(async (id) => {
    const result = await taskService.toggleTask(id);
    if (!result.success) {
      setError(result.error);
      return result;
    }

    await fetchTasks();
    return result;
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    setError,
    fetchTasks,
    createTask,
    deleteTask,
    updateTask,
    toggleTask,
  };
}
