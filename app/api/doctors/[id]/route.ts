
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(doctor);
  } catch (error) {
    console.error("GET doctor error:", error);

    return NextResponse.json(
      { error: "Failed to fetch doctor." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        name: body.name,
        specialization: body.specialization,
        department: body.department,
        phone: body.phone,
        email: body.email || null,
        experience: body.experience || null,
        availability: body.availability || "Available",
      },
    });

    return NextResponse.json(doctor);
  } catch (error: any) {
    console.error("PUT doctor error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Doctor not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update doctor." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    await prisma.doctor.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Doctor deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE doctor error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Doctor not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete doctor." },
      { status: 500 }
    );
  }
}
