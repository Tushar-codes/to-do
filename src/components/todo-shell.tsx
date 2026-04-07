"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import type { TodoItem } from "@/db/todos";

type TodoShellProps = {
  initialTodos: TodoItem[];
  hasDatabaseUrl: boolean;
  initialError: string | null;
};

type ApiTodoResponse = {
  todo?: TodoItem;
  todos?: TodoItem[];
  error?: string;
};

async function readResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload;
}

export function TodoShell({
  initialTodos,
  hasDatabaseUrl,
  initialError,
}: TodoShellProps) {
  const [todos, setTodos] = useState(initialTodos);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();

  const counts = useMemo(() => {
    return todos.reduce(
      (accumulator, todo) => {
        if (todo.completed) {
          accumulator.completed += 1;
        } else {
          accumulator.open += 1;
        }

        return accumulator;
      },
      { open: 0, completed: 0 },
    );
  }, [todos]);

  function runTask(task: () => Promise<void>) {
    startTransition(() => {
      void task().catch((taskError: unknown) => {
        const message = taskError instanceof Error
          ? taskError.message
          : "Something went wrong.";
        setError(message);
      });
    });
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newTitle.trim();
    if (!title) {
      setError("Todo title cannot be empty.");
      return;
    }

    setError(null);

    runTask(async () => {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      const payload = await readResponse<ApiTodoResponse>(response);
      if (!payload.todo) {
        throw new Error("Todo was not returned.");
      }

      setTodos((currentTodos) => [payload.todo!, ...currentTodos]);
      setNewTitle("");
    });
  }

  function handleToggle(id: string, completed: boolean) {
    setError(null);

    runTask(async () => {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      });

      const payload = await readResponse<ApiTodoResponse>(response);
      if (!payload.todo) {
        throw new Error("Updated todo was not returned.");
      }

      setTodos((currentTodos) =>
        currentTodos.map((todo) => (todo.id === id ? payload.todo! : todo)),
      );
    });
  }

  function beginEdit(todo: TodoItem) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  function handleUpdate(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();

    const title = editingTitle.trim();
    if (!title) {
      setError("Todo title cannot be empty.");
      return;
    }

    setError(null);

    runTask(async () => {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      const payload = await readResponse<ApiTodoResponse>(response);
      if (!payload.todo) {
        throw new Error("Updated todo was not returned.");
      }

      setTodos((currentTodos) =>
        currentTodos.map((todo) => (todo.id === id ? payload.todo! : todo)),
      );
      cancelEdit();
    });
  }

  function handleDelete(id: string) {
    setError(null);

    runTask(async () => {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        const payload = await readResponse<ApiTodoResponse>(response);
        throw new Error(payload.error ?? "Unable to delete todo.");
      }

      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
      if (editingId === id) {
        cancelEdit();
      }
    });
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <p className="eyebrow">Neon + Next.js + Drizzle</p>
        <h1>One focused place for every task that still matters.</h1>
        <p className="hero-copy">
          Capture it, finish it, and keep the list moving. This MVP ships with
          full CRUD, completion tracking, and a real Neon-backed database.
        </p>

        <div className="stat-grid">
          <article className="stat-card">
            <span>Open</span>
            <strong>{counts.open}</strong>
          </article>
          <article className="stat-card">
            <span>Completed</span>
            <strong>{counts.completed}</strong>
          </article>
          <article className="stat-card">
            <span>Status</span>
            <strong>{isPending ? "Syncing" : "Ready"}</strong>
          </article>
        </div>
      </section>

      <section className="board-panel">
        <div className="board-header">
          <div>
            <p className="eyebrow">Today&apos;s Board</p>
            <h2>Todo list</h2>
          </div>
          <span className={`status-pill ${hasDatabaseUrl ? "live" : "missing"}`}>
            {hasDatabaseUrl ? "Database connected" : "Database env missing"}
          </span>
        </div>

        {!hasDatabaseUrl ? (
          <div className="notice-card">
            Add `DATABASE_URL` in `.env.local` for local work and in Vercel
            project settings for deployment. The rest of the app is ready.
          </div>
        ) : null}

        {error ? <div className="error-card">{error}</div> : null}

        <form className="create-form" onSubmit={handleCreate}>
          <label className="sr-only" htmlFor="todo-title">
            New todo title
          </label>
          <input
            id="todo-title"
            name="title"
            type="text"
            placeholder="Add the next thing worth finishing"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            disabled={!hasDatabaseUrl || isPending}
          />
          <button type="submit" disabled={!hasDatabaseUrl || isPending}>
            Add todo
          </button>
        </form>

        <div className="todo-list">
          {todos.length === 0 ? (
            <div className="empty-card">
              <h3>No todos yet</h3>
              <p>
                Start with one concrete task. The rest of the rhythm usually
                follows.
              </p>
            </div>
          ) : null}

          {todos.map((todo) => {
            const isEditing = editingId === todo.id;

            return (
              <article
                className={`todo-card ${todo.completed ? "done" : ""}`}
                key={todo.id}
              >
                <button
                  type="button"
                  className={`toggle-button ${todo.completed ? "checked" : ""}`}
                  aria-label={
                    todo.completed ? "Mark todo as open" : "Mark todo as complete"
                  }
                  onClick={() => handleToggle(todo.id, !todo.completed)}
                  disabled={!hasDatabaseUrl || isPending}
                >
                  <span />
                </button>

                <div className="todo-content">
                  {isEditing ? (
                    <form className="edit-form" onSubmit={(event) => handleUpdate(event, todo.id)}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        disabled={isPending}
                        autoFocus
                      />
                      <div className="inline-actions">
                        <button type="submit" disabled={isPending}>
                          Save
                        </button>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={cancelEdit}
                          disabled={isPending}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="todo-title">{todo.title}</p>
                      <p className="todo-meta">
                        Updated {new Date(todo.updatedAt).toLocaleString()}
                      </p>
                    </>
                  )}
                </div>

                {!isEditing ? (
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => beginEdit(todo)}
                      disabled={!hasDatabaseUrl || isPending}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ghost-button danger-button"
                      onClick={() => handleDelete(todo.id)}
                      disabled={!hasDatabaseUrl || isPending}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
