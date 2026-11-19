
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];

function serializeAppointment(appointment: any) {
  return {
    id: appointment.id,
    patientId: appointment.patientId,
    patientName: appointment.patient.name,
    doctorId: appointment.doctorId,
    doctorName: appointment.doctor.name,
    specialization: appointment.doctor.specialization ?? "",
    date: appointment.date.toISOString().slice(0, 10),
    time: appointment.time,
    reason: appointment.reason ?? "",
    status: appointment.status,
  };
}

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: [{ date: "desc" }, { time: "desc" }],
    });

    return NextResponse.json(appointments.map(serializeAppointment));
  } catch (error) {
    console.error("GET appointments error:", error);

    return NextResponse.json(
      { error: "Failed to fetch appointments." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      patientId,
      doctorId,
      date,
      time,
      reason,
      status,
    } = body;

    if (!patientId || !doctorId || !date || !time) {
      return NextResponse.json(
        { error: "Patient, doctor, date, and time are required." },
        { status: 400 }
      );
    }

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid appointment status." },
        { status: 400 }
      );
    }

    const appointmentDate = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid appointment date." },
        { status: 400 }
      );
    }

    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (date < todayString) {
      return NextResponse.json(
        { error: "Appointments cannot be booked in the past." },
        { status: 400 }
      );
    }

    const [patient, doctor] = await Promise.all([
      prisma.patient.findUnique({ where: { id: patientId } }),
      prisma.doctor.findUnique({ where: { id: doctorId } }),
    ]);

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found." },
        { status: 404 }
      );
    }

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found." },
        { status: 404 }
      );
    }

    if (doctor.availability !== "Available") {
      return NextResponse.json(
        { error: "Selected doctor is not available." },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date: appointmentDate,
        time,
        reason: reason?.trim() || null,
        status: status || "Pending",
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return NextResponse.json(serializeAppointment(appointment), {
      status: 201,
    });
  } catch (error) {
    console.error("POST appointment error:", error);

    return NextResponse.json(
      { error: "Failed to create appointment." },
      { status: 500 }
    );
  }
}
