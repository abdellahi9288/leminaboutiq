import dbConnect from "@/lib/mongodb";
import Income from "@/lib/models/Income";
import Inventory from "@/lib/models/Inventory";

export async function GET() {
  await dbConnect();

  const soldData = await Income.aggregate([
    { $match: { inventoryItemId: { $ne: null }, quantitySold: { $gt: 0 } } },
    { $group: { _id: "$inventoryItemId", totalSold: { $sum: "$quantitySold" } } },
  ]);

  let fixed = 0;
  for (const s of soldData) {
    await Inventory.findByIdAndUpdate(s._id, { totalSold: s.totalSold });
    fixed++;
  }

  return Response.json({ message: `Fixed ${fixed} inventory items`, soldData });
}
