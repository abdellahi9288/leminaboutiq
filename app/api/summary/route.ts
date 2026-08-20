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

  const [incomeResult, expenseResult, inventoryItems] = await Promise.all([
    Income.aggregate([
      { $match: dateQuery },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: dateQuery },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Inventory.find(),
  ]);

  const totalIncome = incomeResult[0]?.total || 0;
  const totalExpenses = expenseResult[0]?.total || 0;
  const inventoryValue = inventoryItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  return Response.json({ totalIncome, totalExpenses, inventoryValue });
}
