import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const server = setupServer(
  http.get('http://localhost:8080/api/auth/me', () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }))
);
