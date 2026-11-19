import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatRecord(record: any) {
  return {
    ...record,
    patientName: record.patient?.name ?? "Unknown Patient",
    doctorName: record.doctor?.name ?? "Not assigned",
    recordDate: record.recordDate.toISOString().split("T")[0],
    followUpDate: record.followUpDate
      ? record.followUpDate.toISOString().split("T")[0]
      : "",
  };
}

// GET all medical records
export async function GET() {
  try {
    const records = await prisma.medicalRecord.findMany({
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        recordDate: "desc",
      },
    });

    return NextResponse.json(records.map(formatRecord));
  } catch (error) {
    console.error("GET medical records error:", error);

    return NextResponse.json(
      { error: "Failed to fetch medical records." },
      { status: 500 }
    );
  }
}

// CREATE medical record
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body.patientId ||
      !body.diagnosis?.trim() ||
      !body.treatment?.trim() ||
      !body.recordDate
    ) {
      return NextResponse.json(
        { error: "Patient, diagnosis, treatment and record date are required." },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id: String(body.patientId) },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Selected patient does not exist." },
        { status: 404 }
      );
    }

    let doctorId: string | null = body.doctorId || null;

    if (doctorId) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
      });

      if (!doctor) {
        return NextResponse.json(
          { error: "Selected doctor does not exist." },
          { status: 404 }
        );
      }
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: String(body.patientId),
        doctorId,
        diagnosis: body.diagnosis.trim(),
        treatment: body.treatment.trim(),
        prescription: body.prescription?.trim() || null,
        recordDate: parseDate(body.recordDate),
        followUpDate: body.followUpDate
          ? parseDate(body.followUpDate)
          : null,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return NextResponse.json(formatRecord(record), { status: 201 });
  } catch (error) {
    console.error("POST medical record error:", error);

    return NextResponse.json(
      { error: "Failed to create medical record." },
      { status: 500 }
    );
  }
}