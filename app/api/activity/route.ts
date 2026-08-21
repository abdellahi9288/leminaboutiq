import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Income from "@/lib/models/Income";
import Expense from "@/lib/models/Expense";
import { getDateRange } from "@/lib/dateFilter";

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = request.nextUrl;
  const filter = searchParams.get("filter") || "today";
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  const { start, end } = getDateRange(filter, from, to);
  const dateQuery = { date: { $gte: start, $lte: end } };

  const [incomes, expenses, incomeCount, expenseCount] = await Promise.all([
    Income.find(dateQuery).sort({ date: -1 }).skip(skip).limit(limit).lean(),
    Expense.find(dateQuery).sort({ date: -1 }).skip(skip).limit(limit).lean(),
    Income.countDocuments(dateQuery),
    Expense.countDocuments(dateQuery),
  ]);

  type ActivityEntry = {
    _id: string;
    type: "income" | "expense";
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

  activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = incomeCount + expenseCount;
  const hasMore = skip + limit < total;

  return Response.json({ items: activity.slice(0, limit), page, hasMore, total });
}
