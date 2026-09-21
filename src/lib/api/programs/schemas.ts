import { z } from "zod";

/** Slim program fields for mentor grouping — full curriculum tree stays on web. */
export const programSummarySchema = z
  .object({
    id: z.string(),
    code: z.string().nullish(),
    name: z.string().nullish(),
  })
  .passthrough();

export type ProgramSummary = z.infer<typeof programSummarySchema>;
