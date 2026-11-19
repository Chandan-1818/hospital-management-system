import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

// GET: Fetch all doctors
export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("GET /api/doctors error:", error);

    return NextResponse.json(
      { error: "Failed to fetch doctors." },
      { status: 500 }
    );
  }
}

// POST: Add a new doctor
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.name ||
      !body.specialization ||
      !body.department ||
      !body.phone
    ) {
      return NextResponse.json(
        {
          error:
            "Name, specialization, department and phone are required.",
        },
        { status: 400 }
      );
    }

    // Create doctor in PostgreSQL
    const doctor = await prisma.doctor.create({
      data: {
        id: randomUUID(),
        name: body.name.trim(),
        specialization: body.specialization.trim(),
        department: body.department.trim(),
        phone: body.phone.trim(),
        email: body.email?.trim() || null,
        experience: body.experience || null,
        availability: body.availability || "Available",
      },
    });

    return NextResponse.json(doctor, { status: 201 });
  } catch (error) {
    console.error("POST /api/doctors error:", error);

    return NextResponse.json(
      { error: "Failed to create doctor." },
      { status: 500 }
    );
  }
}