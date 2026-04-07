import { NextResponse } from "next/server";
import { createTodo, listTodos } from "@/db/todos";

export async function GET() {
  try {
    const todos = await listTodos();
    return NextResponse.json({ todos });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load todos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { title?: string };
    const todo = await createTodo(body.title ?? "");
    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create todo.";
    const status = message === "Todo title cannot be empty." ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
