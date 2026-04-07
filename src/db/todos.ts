import { desc, eq, sql } from "drizzle-orm";
import { db, ensureDatabaseReady, hasDatabaseUrl } from "@/db/client";
import { todos, type TodoRecord } from "@/db/schema";

export type TodoItem = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

function requireDatabase() {
  if (!db || !hasDatabaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }
}

function serializeTodo(todo: TodoRecord): TodoItem {
  return {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

export async function listTodos() {
  requireDatabase();
  await ensureDatabaseReady();

  const results = await db!.select().from(todos).orderBy(desc(todos.createdAt));
  return results.map(serializeTodo);
}

export async function createTodo(title: string) {
  requireDatabase();
  await ensureDatabaseReady();

  const cleanedTitle = title.trim();
  if (!cleanedTitle) {
    throw new Error("Todo title cannot be empty.");
  }

  const [todo] = await db!
    .insert(todos)
    .values({
      id: crypto.randomUUID(),
      title: cleanedTitle,
      completed: false,
    })
    .returning();

  return serializeTodo(todo);
}

export async function updateTodo(id: string, title: string) {
  requireDatabase();
  await ensureDatabaseReady();

  const cleanedTitle = title.trim();
  if (!cleanedTitle) {
    throw new Error("Todo title cannot be empty.");
  }

  const [todo] = await db!
    .update(todos)
    .set({
      title: cleanedTitle,
      updatedAt: sql`now()`,
    })
    .where(eq(todos.id, id))
    .returning();

  if (!todo) {
    throw new Error("Todo not found.");
  }

  return serializeTodo(todo);
}

export async function setTodoCompleted(id: string, completed: boolean) {
  requireDatabase();
  await ensureDatabaseReady();

  const [todo] = await db!
    .update(todos)
    .set({
      completed,
      updatedAt: sql`now()`,
    })
    .where(eq(todos.id, id))
    .returning();

  if (!todo) {
    throw new Error("Todo not found.");
  }

  return serializeTodo(todo);
}

export async function deleteTodo(id: string) {
  requireDatabase();
  await ensureDatabaseReady();

  const [todo] = await db!
    .delete(todos)
    .where(eq(todos.id, id))
    .returning({ id: todos.id });

  if (!todo) {
    throw new Error("Todo not found.");
  }
}
