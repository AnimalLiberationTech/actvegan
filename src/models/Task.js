const DEFAULT_TASK = {
  id: null,
  title: "",
  description: null,
  priority: "medium",
  completed: false,
  capacity: 1,
  type: null,
  time_required: null,
  tools: [],
  skills: [],
  extra: {},
  created_at: null,
};

export function createTask(data = {}) {
  return {
    ...DEFAULT_TASK,
    ...data,
    tools: Array.isArray(data.tools) ? data.tools : [],
    skills: Array.isArray(data.skills) ? data.skills : [],
    extra: data.extra && typeof data.extra === "object" ? data.extra : {},
  };
}

export function toTaskCreatePayload(data = {}) {
  const task = createTask(data);

  return {
    title: task.title.trim(),
    description: task.description?.trim() || null,
    priority: task.priority,
    completed: task.completed,
    capacity: Number(task.capacity),
    type: task.type,
    time_required: task.time_required?.trim() || null,
    tools: task.tools,
    skills: task.skills,
    extra: task.extra,
  };
}

export function toTaskUpdatePayload(data = {}) {
  const task = createTask(data);

  return {
    title: task.title.trim() || null,
    description: task.description?.trim() || null,
    priority: task.priority,
    completed: task.completed,
  };
}
