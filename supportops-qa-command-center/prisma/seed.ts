import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const defaultPolicies = [
    {
      name: "Billing and refunds require review",
      category: "Billing",
      ruleText:
        "Tickets involving charges, refunds, cancellations, invoices, or payment disputes must not be auto-resolved.",
      severity: "high",
    },
    {
      name: "Account access requires review",
      category: "Account",
      ruleText:
        "Tickets involving login failures, password resets, suspicious access, or account ownership require human review.",
      severity: "high",
    },
    {
      name: "Shipping status can be automated",
      category: "Shipping",
      ruleText:
        "Simple shipping status questions can be auto-resolved when no refund, replacement, or address change is requested.",
      severity: "low",
    },
  ];

  for (const policy of defaultPolicies) {
    await prisma.policyRule.upsert({
      where: { name: policy.name },
      update: policy,
      create: policy,
    });
  }

  console.log(`Seeded ${defaultPolicies.length} policy rules.`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
