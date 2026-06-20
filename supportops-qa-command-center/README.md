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
