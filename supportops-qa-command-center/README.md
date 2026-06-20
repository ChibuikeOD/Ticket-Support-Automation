# SupportOps QA Command Center

An AI support automation and QA command center. The app processes a seeded customer support ticket dataset, drafts and routes support responses with DeepSeek, applies deterministic safety guardrails, and gives human reviewers a queue for approve/edit/reject/escalate decisions.

## Why This Exists

The project demonstrates practical AI operations:

- structured LLM outputs
- conservative automation
- human-in-the-loop review
- policy/SOP guardrails
- evaluation runs
- dashboard quality metrics
- exportable QA reports

## First Run

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Dataset

The app is designed around the Kaggle Customer Support Ticket Dataset by `suraj520`:

https://www.kaggle.com/datasets/suraj520/customer-support-ticket-dataset

Before publishing the full raw CSV, verify Kaggle license and redistribution terms. This repository can ship with a small sample and an import path for local use.

## Demo Script

1. Open the overview dashboard.
2. Go to Backlog and run an automation batch.
3. Review the split between auto-resolved, human-review, and escalated tickets.
4. Open the Review Queue and approve, edit, reject, and escalate examples.
5. Return to the dashboard to show metric changes.
6. Open Evaluation Runs to compare prompt/model batches.
7. Export the Markdown QA report from Reports.

## Safety Notes

The app does not send real customer messages, issue refunds, cancel subscriptions, or perform production account actions. It is a portfolio simulation of a support operations workflow with conservative routing.
