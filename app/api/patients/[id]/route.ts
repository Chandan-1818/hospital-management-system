
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

// GET: Fetch one patient
export async function GET(
  request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Fetch patient error:", error);

    return NextResponse.json(
      { message: "Failed to fetch patient" },
      { status: 500 }
    );
  }
}

// PUT: Update patient
export async function PUT(
  request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        name: body.name,
        dateOfBirth: body.dateOfBirth
          ? new Date(body.dateOfBirth)
          : null,
        gender: body.gender ?? null,
        phone: body.phone ?? null,
        email: body.email ?? null,
        bloodGroup: body.bloodGroup ?? null,
        address: body.address ?? null,
      },
    });

    return NextResponse.json(patient);
  } catch (error: any) {
    console.error("Update patient error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update patient" },
      { status: 500 }
    );
  }
}

// DELETE: Delete patient
export async function DELETE(
  request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;

    await prisma.patient.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Patient deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete patient error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete patient" },
      { status: 500 }
    );
  }
}
