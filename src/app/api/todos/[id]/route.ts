import { NextResponse } from "next/server";
import { deleteTodo, setTodoCompleted, updateTodo } from "@/db/todos";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      title?: string;
      completed?: boolean;
    };

    if (typeof body.completed === "boolean") {
      const todo = await setTodoCompleted(id, body.completed);
      return NextResponse.json({ todo });
    }

    if (typeof body.title === "string") {
      const todo = await updateTodo(id, body.title);
      return NextResponse.json({ todo });
    }

    return NextResponse.json(
      { error: "Provide either a title or completed value." },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update todo.";
    const status = message === "Todo not found."
      ? 404
      : message === "Todo title cannot be empty."
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_: Request, context: Params) {
  const { id } = await context.params;

  try {
    await deleteTodo(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete todo.";
    const status = message === "Todo not found." ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
