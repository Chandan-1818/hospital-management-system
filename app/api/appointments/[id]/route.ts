
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid appointment status." },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: body.status },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("PATCH appointment error:", error);

    return NextResponse.json(
      { error: "Failed to update appointment." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Appointment deleted successfully." });
  } catch (error) {
    console.error("DELETE appointment error:", error);

    return NextResponse.json(
      { error: "Failed to delete appointment." },
      { status: 500 }
    );
  }
}
