import TaskItem from "./TaskItem";

function TaskList({
  tasks,
  filteredTasks,
  filter,
  setFilter,
  loading,
  editId,
  editText,
  setEditText,
  updatingId,
  togglingId,
  deletingId,
  addingTask,
  handleToggle,
  handleUpdate,
  handleDelete,
  setEditId,
  setError,
}) {
  return (
    <>
     
      {loading ? (
        <div className="loading-state">
          <span>Loading tasks...</span>
        </div>
      ) : tasks.length === 0 ? (
        
        <p className="empty-state">
          No tasks yet. Add one above.
        </p>
      ) : (
        <>
          
          <div className="task-filters">
            {["all", "pending", "completed", "high", "medium", "low"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`filter-btn ${filter === f ? "active" : ""}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

         
          {filteredTasks.length === 0 ? (
            <p className="empty-state">
              No {filter} tasks found.
            </p>
          ) : (
            
            <div className="grid gap-2.5">
              {filteredTasks.map((t) => (
                <TaskItem
                  key={t.id}
                  t={t}
                  editId={editId}
                  editText={editText}
                  setEditText={setEditText}
                  updatingId={updatingId}
                  togglingId={togglingId}
                  deletingId={deletingId}
                  addingTask={addingTask}
                  handleToggle={handleToggle}
                  handleUpdate={handleUpdate}
                  handleDelete={handleDelete}
                  setEditId={setEditId}
                  setError={setError}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default TaskList;