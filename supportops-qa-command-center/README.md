# SupportOps QA Command Center

An AI support evaluation console. The app shows gold-dataset evaluation results, then lets you run one open support ticket at a time through DeepSeek and deterministic guardrails.

## Why This Exists

The project demonstrates practical AI operations:

- structured LLM outputs
- conservative automation
- policy/SOP guardrails
- gold-dataset evaluation metrics
- one-ticket sample runs
- exportable QA reports

## First Run

The app uses **Neon Postgres** (via Vercel) for local and production database access.

```bash
npm install
cp .env.example .env
vercel link
```

Add your Neon connection string to `.env.local` (not committed):

1. Open Vercel → **echo-ai** → **Storage** → **echo-ai-db**
2. Copy the **pooled** `DATABASE_URL` (or `POSTGRES_PRISMA_URL`)
3. Paste into `.env.local`:

```bash
DATABASE_URL="postgresql://..."
```

Then sync the schema and start the app:

```bash
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

Production on [echo-ai-support.vercel.app](https://echo-ai-support.vercel.app) uses the same Neon database via Vercel integration env vars.

## Datasets

The dashboard focuses on the curated gold evaluation dataset:

```text
../Datasets/gold_eval_clean_closed_sat5.csv
```

The sample-run panel pulls one open ticket at a time from:

```text
../Datasets/customer_support_tickets_200k.csv
```

The app no longer uses `data/kaggle`.

## Gold Evaluation

The project includes a gold-dataset evaluator for measuring model and prompt quality against curated expected labels. By default, it reads:

```text
../Datasets/gold_eval_clean_closed_sat5.csv
```

Run a gold evaluation:

```bash
npm run eval:gold
```

Useful environment variables:

```text
GOLD_DATASET_PATH=../Datasets/gold_eval_clean_closed_sat5.csv
SAMPLE_DATASET_PATH=../Datasets/customer_support_tickets_200k.csv
GOLD_EVAL_LIMIT=10
GOLD_EVAL_PROMPT_VERSION=v1
```

The evaluator runs each gold ticket through the normal LLM analysis flow, applies deterministic guardrails, and writes JSON/Markdown reports to `evaluation-reports/`. It scores category, customer intent, and final action (3 points per case).

## Reports

The **Run Reports** tab shows the latest gold evaluation with case-level breakdown, failure themes, and run history. Export markdown from:

- the Reports page
- `/api/reports/gold-eval/latest/markdown`
- `/api/reports/gold-eval/{runId}/markdown`

## Demo Script

1. Run `npm run eval:gold` to generate or refresh the gold evaluation report.
2. Open the overview dashboard and review the gold evaluation metrics.
3. Use Sample Run to process one open ticket from the 200k CSV.
4. Inspect the LLM category, intent, risk, confidence, draft response, and final guardrail action.
5. Open **Run Reports** to review case breakdowns and export markdown.

## Safety Notes

The app does not send real customer messages, issue refunds, cancel subscriptions, or perform production account actions. It is a portfolio simulation of a support operations workflow with conservative routing.
