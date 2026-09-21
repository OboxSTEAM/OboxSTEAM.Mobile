import { createApiGetWith } from "@/lib/api/create-endpoint";
import { createApiValueSchema } from "@/lib/api/schemas";
import {
  programSummarySchema,
  type ProgramSummary,
} from "@/lib/api/programs/schemas";

const programSummaryValueSchema = createApiValueSchema(programSummarySchema);

/** `GET /api/programs/{id}` — name/code for section headers. */
export const getProgramById = createApiGetWith({
  path: ({ id }: { id: string }) =>
    `/api/programs/${encodeURIComponent(id)}`,
  value: programSummaryValueSchema,
});

export type { ProgramSummary };
