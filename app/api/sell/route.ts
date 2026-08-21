import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Income from "@/lib/models/Income";
import Inventory from "@/lib/models/Inventory";

export async function POST(request: NextRequest) {
  await dbConnect();
  const body = await request.json();
  const { inventoryItemId, quantity, salePrice } = body;

  if (!inventoryItemId || !quantity || quantity < 1) {
    return Response.json({ error: "inventoryItemId and quantity required" }, { status: 400 });
  }

  const item = await Inventory.findById(inventoryItemId);
  if (!item) {
    return Response.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  if (item.quantity < quantity) {
    return Response.json(
      { error: `الكمية المتوفرة ${item.quantity} فقط` },
      { status: 400 }
    );
  }

  const totalPrice = salePrice || item.unitPrice * quantity;

  const income = await Income.create({
    amount: totalPrice,
    description: item.name,
    category: "بيع",
    date: new Date(),
    inventoryItemId: item._id,
    quantitySold: quantity,
  });

  item.quantity -= quantity;
  item.totalSold = (item.totalSold || 0) + quantity;
  await item.save();

  return Response.json(
    { income, inventoryItem: item, lowStock: item.quantity <= 1 },
    { status: 201 }
  );
}
