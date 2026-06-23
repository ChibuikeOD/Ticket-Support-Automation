import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../"),
  outputFileTracingIncludes: {
    "/": ["../Datasets/gold_eval_clean_closed_sat5.csv"],
    "/api/sample-run": ["../Datasets/customer_support_tickets_200k.csv"],
  },
};

export default nextConfig;
