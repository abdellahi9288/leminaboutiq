import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Debt from "@/lib/models/Debt";

export async function GET() {
  await dbConnect();
  const debts = await Debt.find().sort({ date: -1 });
  return Response.json(debts);
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });
  await Debt.findByIdAndDelete(id);
  return Response.json({ success: true });
}
