import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import MyDebt from "@/lib/models/MyDebt";

export async function GET() {
  await dbConnect();
  const debts = await MyDebt.find().sort({ date: -1 });
  return Response.json(debts);
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const { creditorName, creditorPhone, debtName, totalAmount, date } =
    await request.json();

  if (!creditorName || !debtName || !totalAmount || totalAmount <= 0) {
    return Response.json(
      { error: "يجب إدخال اسم الدائن واسم الدين والمبلغ" },
      { status: 400 }
    );
  }

  const debt = await MyDebt.create({
    creditorName,
    creditorPhone: creditorPhone || "",
    debtName,
    totalAmount,
    remainingAmount: totalAmount,
    payments: [],
    date: date ? new Date(date) : new Date(),
  });

  return Response.json(debt, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });
  await MyDebt.findByIdAndDelete(id);
  return Response.json({ success: true });
}
