import { Router } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { getMatchStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";

export const matchRouter = Router();

const MAX_LIMIT = 100;

matchRouter.get("/", async (req, res) => {
  const parsedMatches = listMatchesQuerySchema.safeParse(req.query);
  if (!parsedMatches.success) {
    res.status(400).json({
      errors: parsedMatches.error.errors,
      message: "Invalid query parameters",
    });
  }
  const limit = Math.min(parsedMatches.data.limit ?? 50, MAX_LIMIT);

  try {
    const match = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);
    res.json({ match });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching matches",
    });
  }
});

matchRouter.post("/", async (req, res) => {
  const parsedData = createMatchSchema.safeParse(req.body);

  // First validate
  if (!parsedData.success) {
    return res.status(400).json({
      errors: parsedData.error.errors,
    });
  }

  // Now safely access data
  const { startTime, endTime, homeScore, awayScore } = parsedData.data;

  try {
    const [match] = await db
      .insert(matches)
      .values({
        ...parsedData.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime),
      })
      .returning();

    return res.status(201).json({ match });
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      error: "An error occurred while creating the match",
      details: e instanceof Error ? e.message : String(e),
    });
  }
});
