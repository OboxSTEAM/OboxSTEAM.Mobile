import { z } from "zod";

import { apiFetch, parseJsonOrThrow } from "@/lib/api/client";
import { assertApiSuccess } from "@/lib/api/errors";
import {
  createApiResponseSchema,
  type apiValueMessageOnlySchema,
} from "@/lib/api/schemas";

type EndpointAuthOptions = {
  skipAuth?: boolean;
  signal?: AbortSignal;
};

export function createApiPost<TInput extends z.ZodType, TValue extends z.ZodType>({
  path,
  input,
  value,
  skipAuth,
}: {
  path: string;
  input: TInput;
  value: TValue;
  skipAuth?: boolean;
}) {
  const responseSchema = createApiResponseSchema(value);

  return async (
    body: z.infer<TInput>,
    options?: EndpointAuthOptions,
  ): Promise<z.infer<TValue>> => {
    const parsedInput = input.parse(body);
    const response = await apiFetch(path, {
      method: "POST",
      body: parsedInput,
      skipAuth: options?.skipAuth ?? skipAuth,
      signal: options?.signal,
    });
    const json = await parseJsonOrThrow(response);
    const envelope = responseSchema.parse(json);
    assertApiSuccess(envelope);
    if (!envelope.value) {
      throw new Error("Phản hồi API thiếu value.");
    }
    return envelope.value;
  };
}

export function createApiGet<TValue extends z.ZodType>({
  path,
  value,
  skipAuth,
}: {
  path: string | (() => string);
  value: TValue;
  skipAuth?: boolean;
}) {
  const responseSchema = createApiResponseSchema(value);

  return async (options?: EndpointAuthOptions): Promise<z.infer<TValue>> => {
    const resolvedPath = typeof path === "function" ? path() : path;
    const response = await apiFetch(resolvedPath, {
      method: "GET",
      skipAuth: options?.skipAuth ?? skipAuth,
      signal: options?.signal,
    });
    const json = await parseJsonOrThrow(response);
    const envelope = responseSchema.parse(json);
    assertApiSuccess(envelope);
    if (!envelope.value) {
      throw new Error("Phản hồi API thiếu value.");
    }
    return envelope.value;
  };
}

/** GET with path/query params — annotate the `path` callback to infer `TParams`. */
export function createApiGetWith<TParams, TValue extends z.ZodType>({
  path,
  value,
  skipAuth,
}: {
  path: (params: TParams) => string;
  value: TValue;
  skipAuth?: boolean;
}) {
  const responseSchema = createApiResponseSchema(value);

  return async (
    params: TParams,
    options?: EndpointAuthOptions,
  ): Promise<z.infer<TValue>> => {
    const response = await apiFetch(path(params), {
      method: "GET",
      skipAuth: options?.skipAuth ?? skipAuth,
      signal: options?.signal,
    });
    const json = await parseJsonOrThrow(response);
    const envelope = responseSchema.parse(json);
    assertApiSuccess(envelope);
    if (!envelope.value) {
      throw new Error("Phản hồi API thiếu value.");
    }
    return envelope.value;
  };
}

export function createApiPatch<TValue extends z.ZodType>({
  path,
  value,
  skipAuth,
}: {
  path: string | (() => string);
  value: TValue;
  skipAuth?: boolean;
}) {
  const responseSchema = createApiResponseSchema(value);

  return async (options?: EndpointAuthOptions): Promise<z.infer<TValue>> => {
    const resolvedPath = typeof path === "function" ? path() : path;
    const response = await apiFetch(resolvedPath, {
      method: "PATCH",
      skipAuth: options?.skipAuth ?? skipAuth,
      signal: options?.signal,
    });
    const json = await parseJsonOrThrow(response);
    const envelope = responseSchema.parse(json);
    assertApiSuccess(envelope);
    if (!envelope.value) {
      throw new Error("Phản hồi API thiếu value.");
    }
    return envelope.value;
  };
}

/** PATCH with path params — annotate the `path` callback to infer `TParams`. */
export function createApiPatchWith<TParams, TValue extends z.ZodType>({
  path,
  value,
  skipAuth,
}: {
  path: (params: TParams) => string;
  value: TValue;
  skipAuth?: boolean;
}) {
  const responseSchema = createApiResponseSchema(value);

  return async (
    params: TParams,
    options?: EndpointAuthOptions,
  ): Promise<z.infer<TValue>> => {
    const response = await apiFetch(path(params), {
      method: "PATCH",
      skipAuth: options?.skipAuth ?? skipAuth,
      signal: options?.signal,
    });
    const json = await parseJsonOrThrow(response);
    const envelope = responseSchema.parse(json);
    assertApiSuccess(envelope);
    if (!envelope.value) {
      throw new Error("Phản hồi API thiếu value.");
    }
    return envelope.value;
  };
}

export type MessageOnlyValue = z.infer<typeof apiValueMessageOnlySchema>;
