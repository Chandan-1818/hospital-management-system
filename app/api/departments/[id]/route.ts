
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;

    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      return NextResponse.json(
        { error: "Department not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error("GET department error:", error);

    return NextResponse.json(
      { error: "Failed to fetch department." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const name = String(body.name ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Department name is required." },
        { status: 400 }
      );
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
        head: String(body.head ?? "").trim(),
        location: String(body.location ?? "").trim(),
        phone: String(body.phone ?? "").trim(),
        email: String(body.email ?? "").trim(),
        description: String(body.description ?? "").trim(),
      },
    });

    return NextResponse.json(department);
  } catch (error: any) {
    console.error("PUT department error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Department not found." },
        { status: 404 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A department with this name already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update department." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;

    await prisma.department.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Department deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE department error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Department not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete department." },
      { status: 500 }
    );
  }
}
