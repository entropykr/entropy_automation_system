// Jest setup file
// Add any global test setup here

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';
process.env.GOOGLE_DRIVE_FOLDER_ID = 'test-folder-id';
process.env.N8N_HOST = 'localhost';
process.env.N8N_PORT = '5678';

// Extend Jest matchers if needed
expect.extend({
  toBeValidWorkflowNode(received) {
    const pass = received &&
      typeof received.id === 'string' &&
      typeof received.name === 'string' &&
      typeof received.type === 'string' &&
      Array.isArray(received.position) &&
      received.position.length === 2;

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid workflow node`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid workflow node with id, name, type, and position properties`,
        pass: false,
      };
    }
  },
});

// Global test timeout
jest.setTimeout(30000);