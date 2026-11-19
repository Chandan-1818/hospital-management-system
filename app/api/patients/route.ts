
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all patients
export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error("Fetch patients error:", error);

    return NextResponse.json(
      { message: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

// POST: Create a patient
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.id || !body.name) {
      return NextResponse.json(
        { message: "Patient ID and name are required" },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.create({
      data: {
        id: String(body.id),
        name: String(body.name),
        dateOfBirth: body.dateOfBirth
          ? new Date(body.dateOfBirth)
          : null,
        gender: body.gender || null,
        phone: body.phone || null,
        email: body.email || null,
        bloodGroup: body.bloodGroup || null,
        address: body.address || null,
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error: any) {
    console.error("Create patient error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Patient ID already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create patient" },
      { status: 500 }
    );
  }
}
