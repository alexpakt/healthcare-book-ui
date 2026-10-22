import { http, HttpResponse } from 'msw';
import { server } from './server';

export const API_BASE = 'http://localhost:8080';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface RecordedRequest {
  method: string;
  path: string;
  search: string;
  authorization: string | null;
  body: unknown;
}

/**
 * Answers one route with a fixed response and records every request made to it.
 * Requests to routes without a handler fail the test (see setup.ts).
 */
export function mockApi(method: Method, path: string, response: unknown = {}, status = 200): RecordedRequest[] {
  const recorded: RecordedRequest[] = [];
  server.use(
    http[method](`${API_BASE}${path}`, async ({ request }) => {
      const url = new URL(request.url);
      const text = await request.text();
      recorded.push({
        method: request.method,
        path: url.pathname,
        search: url.search,
        authorization: request.headers.get('authorization'),
        body: text ? JSON.parse(text) : undefined,
      });
      if (status === 204) return new HttpResponse(null, { status });
      return HttpResponse.json(response as never, { status });
    })
  );
  return recorded;
}
