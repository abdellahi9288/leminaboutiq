import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/lib/models/Inventory";

export async function GET() {
  await dbConnect();
  const items = await Inventory.find().sort({ createdAt: -1 });
  return Response.json(items);
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const body = await request.json();
  const item = await Inventory.create(body);
  return Response.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  const body = await request.json();
  const { _id, ...update } = body;
  const item = await Inventory.findByIdAndUpdate(_id, update, { new: true });
  return Response.json(item);
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });

  await Inventory.findByIdAndDelete(id);
  return Response.json({ success: true });
}
