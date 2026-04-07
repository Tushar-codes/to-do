import { TodoShell } from "@/components/todo-shell";
import { hasDatabaseUrl } from "@/db/client";
import { listTodos } from "@/db/todos";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const todos = hasDatabaseUrl ? await listTodos() : [];

    return (
      <TodoShell
        initialTodos={todos}
        hasDatabaseUrl={hasDatabaseUrl}
        initialError={null}
      />
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load todos.";

    return (
      <TodoShell
        initialTodos={[]}
        hasDatabaseUrl={hasDatabaseUrl}
        initialError={message}
      />
    );
  }
}
