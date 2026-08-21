import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/lib/models/Inventory";
import Debt from "@/lib/models/Debt";

export async function POST(request: NextRequest) {
  await dbConnect();
  const body = await request.json();
  const { inventoryItemId, quantity, salePrice, customerName, customerPhone } = body;

  if (!inventoryItemId || !quantity || quantity < 1) {
    return Response.json({ error: "بيانات غير مكتملة" }, { status: 400 });
  }
  if (!customerName || !customerPhone) {
    return Response.json({ error: "يجب إدخال اسم ورقم هاتف الزبون" }, { status: 400 });
  }

  const item = await Inventory.findById(inventoryItemId);
  if (!item) {
    return Response.json({ error: "المنتج غير موجود" }, { status: 404 });
  }
  if (item.quantity < quantity) {
    return Response.json({ error: `الكمية المتوفرة ${item.quantity} فقط` }, { status: 400 });
  }

  const totalPrice = salePrice || item.unitPrice * quantity;

  const debt = await Debt.create({
    customerName,
    customerPhone,
    description: item.name,
    totalAmount: totalPrice,
    remainingAmount: totalPrice,
    inventoryItemId: item._id,
    quantitySold: quantity,
    payments: [],
    date: new Date(),
  });

  item.quantity -= quantity;
  item.totalSold = (item.totalSold || 0) + quantity;
  await item.save();

  return Response.json(
    { debt, inventoryItem: item, lowStock: item.quantity <= 1 },
    { status: 201 }
  );
}
