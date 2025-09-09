import { prisma } from "../lib/prisma";

export async function listWatchlists() {
  return prisma.watchlist.findMany({ include: { terms: true } });
}

export async function getWatchlist(id: string) {
  return prisma.watchlist.findUnique({
    where: { id },
    include: {
      terms: {
        orderBy: {
          term: "asc",
        },
      },
    },
  });
}

export async function createWatchlist(name: string) {
  return prisma.watchlist.create({
    data: { name },
    include: {
      terms: {
        orderBy: {
          term: "asc",
        },
      },
    },
  });
}

export async function updateWatchlist(id: string, name: string) {
  return prisma.watchlist.update({
    where: { id },
    data: { name },
    include: { terms: true },
  });
}

export async function deleteWatchlist(id: string) {
  return prisma.watchlist.delete({ where: { id } });
}

export async function addTerm(watchlistId: string, term: string) {
  return prisma.watchlistTerm.create({
    data: { watchlistId, term },
    include: { watchlist: true },
  });
}

export async function deleteTerm(termId: string) {
  return prisma.watchlistTerm.delete({ where: { id: termId } });
}
