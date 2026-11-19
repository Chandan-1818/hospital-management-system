
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("GET departments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Department name is required." },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        id: `DEP-${Date.now().toString().slice(-6)}`,
        name,
        head: String(body.head ?? "").trim(),
        location: String(body.location ?? "").trim(),
        phone: String(body.phone ?? "").trim(),
        email: String(body.email ?? "").trim(),
        description: String(body.description ?? "").trim(),
      },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error: any) {
    console.error("POST departments error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A department with this name already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create department." },
      { status: 500 }
    );
  }
}
