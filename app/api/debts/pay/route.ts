import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Debt from "@/lib/models/Debt";
import Income from "@/lib/models/Income";

export async function POST(request: NextRequest) {
  await dbConnect();
  const { debtId, amount } = await request.json();

  if (!debtId || !amount || amount <= 0) {
    return Response.json({ error: "يجب إدخال المبلغ" }, { status: 400 });
  }

  const debt = await Debt.findById(debtId);
  if (!debt) {
    return Response.json({ error: "الدين غير موجود" }, { status: 404 });
  }

  if (amount > debt.remainingAmount) {
    return Response.json({ error: `المبلغ المتبقي ${debt.remainingAmount} فقط` }, { status: 400 });
  }

  debt.remainingAmount -= amount;
  debt.payments.push({ amount, date: new Date() });
  await debt.save();

  await Income.create({
    amount,
    description: `دفع دين - ${debt.customerName} - ${debt.description}`,
    category: "دفع دين",
    date: new Date(),
  });

  return Response.json({
    debt,
    paid: debt.remainingAmount === 0,
  });
}
