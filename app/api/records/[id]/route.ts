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

// GET one medical record
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: params.id },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Medical record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(formatRecord(record));
  } catch (error) {
    console.error("GET medical record error:", error);

    return NextResponse.json(
      { error: "Failed to fetch medical record." },
      { status: 500 }
    );
  }
}

// UPDATE medical record
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id: params.id },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Medical record not found." },
        { status: 404 }
      );
    }

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

    const doctorId: string | null = body.doctorId || null;

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

    const updatedRecord = await prisma.medicalRecord.update({
      where: { id: params.id },
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

    return NextResponse.json(formatRecord(updatedRecord));
  } catch (error) {
    console.error("PUT medical record error:", error);

    return NextResponse.json(
      { error: "Failed to update medical record." },
      { status: 500 }
    );
  }
}

// DELETE medical record
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: params.id },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Medical record not found." },
        { status: 404 }
      );
    }

    await prisma.medicalRecord.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Medical record deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE medical record error:", error);

    return NextResponse.json(
      { error: "Failed to delete medical record." },
      { status: 500 }
    );
  }
}