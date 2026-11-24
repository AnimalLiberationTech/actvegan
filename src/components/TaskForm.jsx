function TaskForm({
  task,
  setTask,
  description,
  setDescription,
  priority,
  setPriority,
  handleSubmit,
  addingTask,
  loading,
  advanced = false,
  form,
  setForm,
  editingId,
  saving,
  resetForm,
}) {
  if (advanced) {
    return (
      <form onSubmit={handleSubmit} className="panel grid gap-4 p-5 sm:p-6">
        <h2>{editingId ? "Update task" : "Create task"}</h2>
        <label className="field">
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Task title" maxLength="200" className="control" required />
        </label>
        <label className="field">
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Description" maxLength="500" className="control" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field">
            <span className="field-label">Priority</span>
            <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}
              className="control">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">Capacity</span>
            <input type="number" min="1" value={form.capacity}
              onChange={(event) => setForm({ ...form, capacity: event.target.value })}
              className="control" required />
          </label>
          <label className="field">
            <span className="field-label">Type</span>
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}
              className="control">
              <option value="action">Action</option><option value="research">Research</option><option value="review">Review</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">Time required</span>
            <input value={form.timeRequired} onChange={(event) => setForm({ ...form, timeRequired: event.target.value })}
              placeholder="e.g. 2h" className="control" />
          </label>
          <label className="field">
            <span className="field-label">Tools</span>
            <input value={form.tools} onChange={(event) => setForm({ ...form, tools: event.target.value })}
              placeholder="Comma-separated tools" className="control" />
          </label>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button disabled={saving} className="btn btn-primary">
            {saving ? "Saving..." : editingId ? "Update task" : "Create task"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>}
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <input
        type="text"
        placeholder="Enter task title..."
        value={task}
        onChange={(e) => setTask(e.target.value)}
        disabled={addingTask || loading}
        maxLength="200"
        className="control"
      />

      
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={addingTask || loading}
        maxLength="500"
        className="control"
      />

    
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="control"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button
        type="submit"
        disabled={addingTask || loading || !task.trim()}
        className="btn btn-primary"
      >
        {addingTask ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}

export default TaskForm;