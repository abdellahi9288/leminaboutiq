import dbConnect from "@/lib/mongodb";
import Income from "@/lib/models/Income";
import Expense from "@/lib/models/Expense";
import Inventory from "@/lib/models/Inventory";

export async function POST() {
  await dbConnect();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };

  // Clear existing test data
  await Promise.all([
    Income.deleteMany({}),
    Expense.deleteMany({}),
    Inventory.deleteMany({}),
  ]);

  // Income: today, 2 days ago, 5 days ago, 15 days ago, 40 days ago
  await Income.insertMany([
    { amount: 5000, description: "بيع ملابس", category: "بيع", date: today },
    { amount: 3200, description: "بيع أحذية", category: "بيع", date: today },
    { amount: 1800, description: "خدمة تفصيل", category: "خدمة", date: daysAgo(2) },
    { amount: 7500, description: "بيع أقمشة", category: "بيع", date: daysAgo(5) },
    { amount: 4000, description: "بيع إكسسوارات", category: "بيع", date: daysAgo(5) },
    { amount: 12000, description: "بيع جملة", category: "بيع", date: daysAgo(15) },
    { amount: 6000, description: "بيع عطور", category: "بيع", date: daysAgo(20) },
    { amount: 9500, description: "بيع حقائب", category: "بيع", date: daysAgo(40) },
  ]);

  // Expenses: today, 3 days ago, 8 days ago, 25 days ago
  await Expense.insertMany([
    { amount: 2000, description: "نقل بضاعة من نواكشوط", category: "نقل", date: today },
    { amount: 500, description: "فاتورة كهرباء", category: "فاتورة", date: today },
    { amount: 15000, description: "إيجار المحل", category: "إيجار", date: daysAgo(3) },
    { amount: 8000, description: "شراء ملابس جديدة", category: "شراء بضاعة", date: daysAgo(3) },
    { amount: 1200, description: "نقل من الميناء", category: "نقل", date: daysAgo(8) },
    { amount: 3500, description: "فاتورة ماء وكهرباء", category: "فاتورة", date: daysAgo(14) },
    { amount: 25000, description: "شراء بضاعة من دبي", category: "شراء بضاعة", date: daysAgo(25) },
    { amount: 1000, description: "مصاريف متنوعة", category: "أخرى", date: daysAgo(35) },
  ]);

  // Inventory
  await Inventory.insertMany([
    { name: "قميص رجالي", quantity: 50, unitPrice: 800, category: "ملابس" },
    { name: "فستان نسائي", quantity: 30, unitPrice: 1500, category: "ملابس" },
    { name: "حذاء رياضي", quantity: 25, unitPrice: 1200, category: "أحذية" },
    { name: "حقيبة يد", quantity: 15, unitPrice: 2000, category: "إكسسوارات" },
    { name: "عطر فرنسي", quantity: 40, unitPrice: 3000, category: "عطور" },
    { name: "ساعة يد", quantity: 10, unitPrice: 5000, category: "إكسسوارات" },
  ]);

  return Response.json({ success: true, message: "Test data seeded" });
}
