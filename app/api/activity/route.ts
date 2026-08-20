import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Income from "@/lib/models/Income";
import Expense from "@/lib/models/Expense";
import Inventory from "@/lib/models/Inventory";
import { getDateRange } from "@/lib/dateFilter";

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = request.nextUrl;
  const filter = searchParams.get("filter") || "today";
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  const { start, end } = getDateRange(filter, from, to);
  const dateQuery = { date: { $gte: start, $lte: end } };

  const [incomes, expenses, inventoryItems] = await Promise.all([
    Income.find(dateQuery).sort({ date: -1 }).limit(20).lean(),
    Expense.find(dateQuery).sort({ date: -1 }).limit(20).lean(),
    Inventory.find().sort({ updatedAt: -1 }).limit(10).lean(),
  ]);

  type ActivityEntry = {
    _id: string;
    type: "income" | "expense" | "inventory";
    description: string;
    amount: number;
    category: string;
    date: string;
  };

  const activity: ActivityEntry[] = [];

  for (const inc of incomes) {
    activity.push({
      _id: String(inc._id),
      type: "income",
      description: inc.description,
      amount: inc.amount,
      category: inc.category,
      date: inc.date.toISOString(),
    });
  }

  for (const exp of expenses) {
    activity.push({
      _id: String(exp._id),
      type: "expense",
      description: exp.description,
      amount: exp.amount,
      category: exp.category,
      date: exp.date.toISOString(),
    });
  }

  for (const inv of inventoryItems) {
    activity.push({
      _id: String(inv._id),
      type: "inventory",
      description: inv.name,
      amount: inv.quantity * inv.unitPrice,
      category: inv.category,
      date: (inv.updatedAt || inv.createdAt).toISOString(),
    });
  }

  activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return Response.json(activity.slice(0, 15));
}
