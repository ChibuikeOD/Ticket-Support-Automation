import { NextResponse } from "next/server";
import { readDatasetTickets, selectRandomUnimportedTicket } from "@/lib/dataset/tickets";
import { prisma } from "@/lib/db";

export async function POST() {
  const dataset = readDatasetTickets();
  const importedTickets = await prisma.ticket.findMany({
    select: { externalId: true },
  });
  const importedExternalIds = new Set(importedTickets.map((ticket) => ticket.externalId));
  const selected = selectRandomUnimportedTicket(dataset.tickets, importedExternalIds);

  if (!selected) {
    return NextResponse.json(
      {
        error: "Every available dataset ticket has already been imported.",
        isFullDataset: dataset.isFullDataset,
      },
      { status: 409 },
    );
  }

  const ticket = await prisma.ticket.create({
    data: {
      externalId: selected.externalId,
      ...selected.data,
    },
    select: {
      id: true,
      externalId: true,
      ticketSubject: true,
    },
  });

  return NextResponse.json({
    ticket,
    isFullDataset: dataset.isFullDataset,
  });
}
