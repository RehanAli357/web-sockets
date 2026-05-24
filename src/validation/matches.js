import { z } from 'zod';

// Constant for match statuses (lowercase values)
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// ISO 8601 (basic) regex for validation (YYYY-MM-DDTHH:mm:ss(.sss)?Z or timezone offset)
const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

// Validate optional query limit coerced to a positive integer with maximum 100
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Validate route param :id as a coerced positive integer
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Create match schema
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, 'sport is required'),
    homeTeam: z.string().min(1, 'homeTeam is required'),
    awayTeam: z.string().min(1, 'awayTeam is required'),
    startTime: z.string().regex(isoDateRegex, 'startTime must be a valid ISO 8601 datetime'),
    endTime: z.string().regex(isoDateRegex, 'endTime must be a valid ISO 8601 datetime'),
    homeScore: z.coerce.number().int().min(0).optional(),
    awayScore: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    try {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      if (isNaN(start.getTime())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'startTime is not a valid date' });
      }
      if (isNaN(end.getTime())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'endTime is not a valid date' });
      }
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end.getTime() <= start.getTime()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'endTime must be after startTime' });
      }
    } catch (e) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid date values' });
    }
  });

// Update score schema: requires non-negative integer scores (coerced)
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
});
