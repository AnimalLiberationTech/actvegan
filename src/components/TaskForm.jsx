import { useId, useState } from "react";

const ADVANCED_OPTIONAL_FIELDS = [
  { key: "description", label: "description" },
  { key: "priority", label: "priority" },
  { key: "capacity", label: "capacity" },
  { key: "type", label: "type" },
  { key: "timeRequired", label: "time required" },
  { key: "tools", label: "tools" },
];

const SIMPLE_OPTIONAL_FIELDS = [
  { key: "description", label: "description" },
  { key: "priority", label: "priority" },
];

function OptionalFieldToggles({ fields, visibleFields, onToggle, baseId }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Optional task fields">
      {fields.map(({ key, label }) => {
        const isVisible = Boolean(visibleFields[key]);
        return (
          <button
            key={key}
            type="button"
            className="field-toggle"
            aria-expanded={isVisible}
            aria-controls={`${baseId}-${key}`}
            onClick={() => onToggle(key)}
          >
            {isVisible ? `Hide ${label}` : `Show ${label}`}
          </button>
        );
      })}
    </div>
  );
}

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
  const baseId = useId();
  const [visibleFields, setVisibleFields] = useState({});

  const toggleField = (key) => {
    setVisibleFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (advanced) {
    const hasVisibleGridFields =
      visibleFields.priority ||
      visibleFields.capacity ||
      visibleFields.type ||
      visibleFields.timeRequired ||
      visibleFields.tools;

    return (
      <form onSubmit={handleSubmit} className="panel grid gap-4 p-5 sm:p-6">
        <h2>{editingId ? "Update task" : "Create task"}</h2>
        <label className="field" htmlFor={`${baseId}-title`}>
          <input
            id={`${baseId}-title`}
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Task title"
            maxLength="200"
            className="control"
            required
          />
        </label>

        <OptionalFieldToggles
          fields={ADVANCED_OPTIONAL_FIELDS}
          visibleFields={visibleFields}
          onToggle={toggleField}
          baseId={baseId}
        />

        {visibleFields.description && (
          <label id={`${baseId}-description`} className="field" htmlFor={`${baseId}-description-input`}>
            <span className="field-label">Description</span>
            <textarea
              id={`${baseId}-description-input`}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Description"
              maxLength="500"
              className="control"
            />
          </label>
        )}

        {hasVisibleGridFields && (
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleFields.priority && (
              <label id={`${baseId}-priority`} className="field" htmlFor={`${baseId}-priority-input`}>
                <span className="field-label">Priority</span>
                <select
                  id={`${baseId}-priority-input`}
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value })}
                  className="control"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            )}
            {visibleFields.capacity && (
              <label id={`${baseId}-capacity`} className="field" htmlFor={`${baseId}-capacity-input`}>
                <span className="field-label">Capacity</span>
                <input
                  id={`${baseId}-capacity-input`}
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(event) => setForm({ ...form, capacity: event.target.value })}
                  className="control"
                  required
                />
              </label>
            )}
            {visibleFields.type && (
              <label id={`${baseId}-type`} className="field" htmlFor={`${baseId}-type-input`}>
                <span className="field-label">Type</span>
                <select
                  id={`${baseId}-type-input`}
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value })}
                  className="control"
                >
                  <option value="action">Action</option>
                  <option value="research">Research</option>
                  <option value="review">Review</option>
                </select>
              </label>
            )}
            {visibleFields.timeRequired && (
              <label id={`${baseId}-timeRequired`} className="field" htmlFor={`${baseId}-time-required-input`}>
                <span className="field-label">Time required</span>
                <input
                  id={`${baseId}-time-required-input`}
                  value={form.timeRequired}
                  onChange={(event) => setForm({ ...form, timeRequired: event.target.value })}
                  placeholder="e.g. 2h"
                  className="control"
                />
              </label>
            )}
            {visibleFields.tools && (
              <label id={`${baseId}-tools`} className="field" htmlFor={`${baseId}-tools-input`}>
                <span className="field-label">Tools</span>
                <input
                  id={`${baseId}-tools-input`}
                  value={form.tools}
                  onChange={(event) => setForm({ ...form, tools: event.target.value })}
                  placeholder="Comma-separated tools"
                  className="control"
                />
              </label>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2.5">
          <button type="submit" disabled={saving} className="btn btn-primary">
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

      <OptionalFieldToggles
        fields={SIMPLE_OPTIONAL_FIELDS}
        visibleFields={visibleFields}
        onToggle={toggleField}
        baseId={baseId}
      />

      {visibleFields.description && (
        <textarea
          id={`${baseId}-description`}
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={addingTask || loading}
          maxLength="500"
          className="control"
        />
      )}

      {visibleFields.priority && (
        <select
          id={`${baseId}-priority`}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="control"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      )}

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