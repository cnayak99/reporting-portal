import type { BackendProblemDetail } from "./types";

export class ApiError extends Error {
  readonly status: number;
  readonly problem?: BackendProblemDetail;
  readonly code?: string;
  readonly parameter?: string;

  constructor(message: string, status: number, problem?: BackendProblemDetail) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
    this.code = problem?.code;
    this.parameter = problem?.parameter;
  }
}

interface JsonRequestOptions extends Omit<RequestInit, "body" | "headers"> {
  body?: unknown;
  headers?: HeadersInit;
}

export async function requestJson<T>(
  path: `/api${string}`,
  options: JsonRequestOptions = {}
): Promise<T> {
  const { body, headers, ...requestOptions } = options;
  const response = await fetch(path, {
    ...requestOptions,
    headers: buildHeaders(headers, body),
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function buildHeaders(headers: HeadersInit | undefined, body: unknown) {
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  return requestHeaders;
}

async function buildApiError(response: Response) {
  const problem = await readProblemDetail(response);
  const message =
    problem?.detail ??
    problem?.title ??
    `Request failed with status ${response.status}.`;

  return new ApiError(message, response.status, problem);
}

async function readProblemDetail(response: Response) {
  const contentType = response.headers.get("Content-Type") ?? "";

  if (!contentType.includes("application/problem+json") && !contentType.includes("application/json")) {
    return undefined;
  }

  try {
    const body = (await response.json()) as unknown;
    return isProblemDetail(body) ? body : undefined;
  } catch {
    return undefined;
  }
}

function isProblemDetail(value: unknown): value is BackendProblemDetail {
  return typeof value === "object" && value !== null;
}

