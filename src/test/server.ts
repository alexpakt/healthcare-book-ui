import { setupServer } from 'msw/node';

// Network layer for component and service tests. Unhandled requests fail the test.
export const server = setupServer();
