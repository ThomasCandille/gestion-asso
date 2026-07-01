import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/auth/session";
import { hasPermission } from "@/server/permissions";
import {
  listBudgetEntries,
  getBudgetSummary,
  getEventBudgetBreakdown,
  getBudgetForecast,
} from "@/features/budget/budget-service";
import { listEvents } from "@/features/events/event-service";
import { BudgetClient } from "@/features/budget/budget-client";

export const metadata = { title: "Budget — IIMPACT" };

export default async function BudgetPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/auth/login");


  const canManage = hasPermission(session.role, "budget:manage");

  const [entries, summary, breakdown, forecast, events] = await Promise.all([
    listBudgetEntries(),
    getBudgetSummary(),
    getEventBudgetBreakdown(),
    getBudgetForecast(),
    listEvents(),
  ]);

  const eventOptions = events.map((e) => ({ id: e.id, title: e.title }));

  return (
    <BudgetClient
      initialEntries={entries}
      initialSummary={summary}
      initialBreakdown={breakdown}
      initialForecast={forecast}
      eventOptions={eventOptions}
      canManage={canManage}
    />
  );
}
