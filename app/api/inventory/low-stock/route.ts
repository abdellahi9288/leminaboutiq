import dbConnect from "@/lib/mongodb";
import Inventory from "@/lib/models/Inventory";

export async function GET() {
  await dbConnect();
  const items = await Inventory.find({ quantity: { $lte: 1 } }).sort({ quantity: 1 });
  return Response.json(items);
}
