import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    id?: string;
    name?: string;
    category?: string;
    ruleText?: string;
    severity?: string;
    enabled?: boolean;
  };

  if (!body.name || !body.category || !body.ruleText || !body.severity) {
    return NextResponse.json({ error: "name, category, ruleText, and severity are required." }, { status: 400 });
  }

  const rule = body.id
    ? await prisma.policyRule.update({
        where: { id: body.id },
        data: {
          name: body.name,
          category: body.category,
          ruleText: body.ruleText,
          severity: body.severity,
          enabled: body.enabled ?? true,
        },
      })
    : await prisma.policyRule.create({
        data: {
          name: body.name,
          category: body.category,
          ruleText: body.ruleText,
          severity: body.severity,
          enabled: body.enabled ?? true,
        },
      });

  return NextResponse.json({ id: rule.id });
}
