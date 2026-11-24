function TaskItem({
  t,
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
    <div
      className={`task-item ${t.completed ? "is-complete" : ""} flex-wrap sm:flex-nowrap`}
    >
      
      <div className="task-body">
        <input
          type="checkbox"
          checked={t.completed}
          onChange={() => handleToggle(t.id)}
          disabled={togglingId === t.id}
          className="task-check"
        />

        {editId === t.id ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            disabled={updatingId === t.id}
            maxLength="200"
            className="control"
          />
        ) : (
          <div>
  <p className={`task-title ${t.completed ? "is-complete" : ""}`}>
    {t.title}
  </p>

  
  {t.description && (
    <p className="task-description">
      {t.description}
    </p>
  )}

  
  <div className="task-meta">
    
    <span
      className={`priority priority-${t.priority}`}
    >
      {t.priority}
    </span>

   
    <span>
      {new Date(t.created_at).toLocaleDateString()}
    </span>
  </div>
</div>
        )}
      </div>

     
      <div className="flex w-full flex-wrap justify-start gap-2 sm:w-auto sm:justify-end sm:gap-2">
        {editId === t.id ? (
          <>
            <button
              onClick={() => handleUpdate(t.id)}
              disabled={updatingId === t.id}
              className="btn-link"
            >
              {updatingId === t.id ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditId(null);
                setEditText("");
              }}
              className="btn-link"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setEditId(t.id);
              setEditText(t.title);
              setError(null);
            }}
            disabled={addingTask || deletingId === t.id || t.completed}
            className="btn-link"
          >
            Edit
          </button>
        )}

        <button
          onClick={() => handleDelete(t.id)}
          disabled={deletingId === t.id || addingTask}
          className="btn-link"
        >
          {deletingId === t.id ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default TaskItem;