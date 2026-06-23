export function defaultPolicyTexts() {
  return [
    "Financial-sensitive tickets, including payment, billing, and refund issues, require human review.",
    "Authentication, account access, and security-sensitive issues require escalation.",
    "Bug reports require human review unless there is a known safe workaround.",
    "Technical troubleshooting can be auto-resolved only when the risk is low and the response avoids account, billing, refund, or security actions.",
    "Subscription changes and cancellation disputes require human review.",
  ];
}
