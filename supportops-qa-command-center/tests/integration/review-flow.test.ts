import { describe, expect, it } from "vitest";
import { statusForReviewAction } from "@/app/api/reviews/route";

describe("review action status mapping", () => {
  it("maps reviewer actions to ticket statuses", () => {
    expect(statusForReviewAction("approve")).toBe("review_approved");
    expect(statusForReviewAction("edit_approve")).toBe("review_edited");
    expect(statusForReviewAction("reject")).toBe("review_rejected");
    expect(statusForReviewAction("escalate")).toBe("escalated");
  });

  it("rejects unknown review actions", () => {
    expect(() => statusForReviewAction("unknown")).toThrow("Unknown review action");
  });
});
