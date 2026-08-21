import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/lib/models/Inventory";
import Income from "@/lib/models/Income";

export async function GET() {
  await dbConnect();

  const [items, soldData] = await Promise.all([
    Inventory.find().sort({ date: -1 }).lean(),
    Income.aggregate([
      { $match: { inventoryItemId: { $exists: true } } },
      { $group: { _id: "$inventoryItemId", totalSold: { $sum: "$quantitySold" } } },
    ]),
  ]);

  const soldMap = new Map(soldData.map((s) => [String(s._id), s.totalSold]));

  const enriched = items.map((item) => ({
    ...item,
    _id: String(item._id),
    sold: soldMap.get(String(item._id)) || 0,
  }));

  return Response.json(enriched);
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
