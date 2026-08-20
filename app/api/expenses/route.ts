import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Expense from "@/lib/models/Expense";
import { getDateRange } from "@/lib/dateFilter";

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = request.nextUrl;
  const filter = searchParams.get("filter") || "today";
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  const { start, end } = getDateRange(filter, from, to);

  const expenses = await Expense.find({
    date: { $gte: start, $lte: end },
  }).sort({ date: -1 });

  return Response.json(expenses);
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const body = await request.json();
  const expense = await Expense.create(body);
  return Response.json(expense, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });

  await Expense.findByIdAndDelete(id);
  return Response.json({ success: true });
}
