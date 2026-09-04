"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { generateEditToken, generateSplitId } from "@/lib/tokens";

// Guardrails — see tech spec, section 8. Deliberately light: there's no
// login, so these do the job accounts would normally do.
const MAX_PEOPLE = 25;
const MAX_NAME_LENGTH = 80;
const MAX_PRICE_CENTS = 100_000_00; // $100,000.00

class SplitNotFoundError extends Error {
  constructor() {
    super("Split not found");
  }
}

function assertName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_NAME_LENGTH) {
    throw new Error(`Name must be between 1 and ${MAX_NAME_LENGTH} characters`);
  }
  return trimmed;
}

function assertPriceCents(priceCents: number): number {
  if (
    !Number.isInteger(priceCents) ||
    priceCents < 0 ||
    priceCents > MAX_PRICE_CENTS
  ) {
    throw new Error("Price is out of range");
  }
  return priceCents;
}

async function getSplitByEditToken(editToken: string) {
  const split = await db.split.findUnique({ where: { editToken } });
  if (!split) throw new SplitNotFoundError();
  return split;
}

export async function createSplit(
  organizerName: string,
  name: string | null,
): Promise<{ id: string; editToken: string }> {
  const cleanOrganizerName = assertName(organizerName);
  const cleanName = name?.trim() ? assertName(name) : null;
  const editToken = generateEditToken();

  // Public ids are short, so collisions are possible (if unlikely) at
  // scale — retry with a fresh id on a unique-constraint violation.
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = generateSplitId();
    try {
      const split = await db.split.create({
        data: {
          id,
          editToken,
          name: cleanName,
          people: {
            create: [{ name: cleanOrganizerName, position: 0 }],
          },
        },
      });
      return { id: split.id, editToken: split.editToken };
    } catch (err) {
      const isCollision =
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002";
      if (!isCollision || attempt === 4) throw err;
    }
  }
  throw new Error("Could not generate a unique split id");
}

export async function addPerson(
  editToken: string,
  name: string,
): Promise<void> {
  const split = await getSplitByEditToken(editToken);
  const cleanName = assertName(name);

  const count = await db.person.count({ where: { splitId: split.id } });
  if (count >= MAX_PEOPLE) {
    throw new Error(`A split can have at most ${MAX_PEOPLE} people`);
  }

  await db.person.create({
    data: { splitId: split.id, name: cleanName, position: count },
  });
}

export async function addItem(
  editToken: string,
  name: string,
  priceCents: number,
): Promise<void> {
  const split = await getSplitByEditToken(editToken);
  const cleanName = assertName(name);
  const cleanPrice = assertPriceCents(priceCents);

  const count = await db.item.count({ where: { splitId: split.id } });
  await db.item.create({
    data: {
      splitId: split.id,
      name: cleanName,
      priceCents: cleanPrice,
      position: count,
    },
  });
}

export async function updateItem(
  editToken: string,
  itemId: string,
  updates: { name?: string; priceCents?: number },
): Promise<void> {
  const split = await getSplitByEditToken(editToken);
  const item = await db.item.findUnique({ where: { id: itemId } });
  if (!item || item.splitId !== split.id) throw new Error("Item not found");

  await db.item.update({
    where: { id: itemId },
    data: {
      ...(updates.name !== undefined ? { name: assertName(updates.name) } : {}),
      ...(updates.priceCents !== undefined
        ? { priceCents: assertPriceCents(updates.priceCents) }
        : {}),
    },
  });
}

export async function removeItem(
  editToken: string,
  itemId: string,
): Promise<void> {
  const split = await getSplitByEditToken(editToken);
  const item = await db.item.findUnique({ where: { id: itemId } });
  if (!item || item.splitId !== split.id) throw new Error("Item not found");

  await db.item.delete({ where: { id: itemId } }); // cascades to assignments
}

export async function toggleAssignment(
  editToken: string,
  itemId: string,
  personId: string,
): Promise<void> {
  const split = await getSplitByEditToken(editToken);
  const [item, person] = await Promise.all([
    db.item.findUnique({ where: { id: itemId } }),
    db.person.findUnique({ where: { id: personId } }),
  ]);
  if (!item || item.splitId !== split.id) throw new Error("Item not found");
  if (!person || person.splitId !== split.id)
    throw new Error("Person not found");

  const existing = await db.itemAssignment.findUnique({
    where: { itemId_personId: { itemId, personId } },
  });

  if (existing) {
    await db.itemAssignment.delete({
      where: { itemId_personId: { itemId, personId } },
    });
  } else {
    await db.itemAssignment.create({ data: { itemId, personId } });
  }
}

export async function setTaxTip(
  editToken: string,
  taxCents: number,
  tipCents: number,
): Promise<void> {
  const split = await getSplitByEditToken(editToken);
  await db.split.update({
    where: { id: split.id },
    data: {
      taxCents: assertPriceCents(taxCents),
      tipCents: assertPriceCents(tipCents),
    },
  });
}
