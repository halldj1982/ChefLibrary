import { handler } from './index';
import { APIGatewayProxyEvent } from 'aws-lambda';

// Mock console methods for testing logs
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
let consoleLogSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;

// Mock Pinecone
jest.mock('@pinecone-database/pinecone', () => {
  return {
    Pinecone: jest.fn().mockImplementation(() => {
      return {
        index: jest.fn().mockImplementation(() => {
          return {
            namespace: jest.fn().mockImplementation(() => {
              return {
                upsert: jest.fn().mockResolvedValue({}),
                query: jest.fn().mockResolvedValue({ matches: [{ id: 'test-id', score: 0.9 }] }),
                deleteOne: jest.fn().mockResolvedValue({})
              };
            })
          };
        })
      };
    })
  };
});

describe('Lambda Handler with Logging', () => {
  beforeEach(() => {
    // Setup console spies
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Set environment variables
    process.env.PINECONE_API_KEY = 'test-api-key';
    process.env.PINECONE_ENVIRONMENT = 'test-environment';
    process.env.PINECONE_INDEX = 'test-index';
    process.env.PINECONE_NAMESPACE = 'test-namespace';
    process.env.DEBUG_LOGGING = 'true';
  });

  afterEach(() => {
    // Restore console methods
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    
    // Clear environment variables
    delete process.env.DEBUG_LOGGING;
  });

  afterAll(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  it('should log request information for OPTIONS request', async () => {
    const event = {
      httpMethod: 'OPTIONS',
      path: '/api/recipes',
      headers: {},
      requestContext: {
        requestId: 'test-request-id',
        identity: {
          sourceIp: '127.0.0.1'
        }
      }
    } as unknown as APIGatewayProxyEvent;

    await handler(event);
    
    // Verify logs were called
    expect(consoleLogSpy).toHaveBeenCalled();
    
    // Check for request logging
    const logCalls = consoleLogSpy.mock.calls.map(call => JSON.parse(call[0]));
    const requestLog = logCalls.find(log => log.message === 'Received API request');
    expect(requestLog).toBeDefined();
    expect(requestLog.data.httpMethod).toBe('OPTIONS');
    expect(requestLog.data.requestId).toBe('test-request-id');
    
    // Check for debug logging
    const debugLog = logCalls.find(log => log.message === 'Handling OPTIONS request');
    expect(debugLog).toBeDefined();
  });

  it('should log store action information', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        action: 'store',
        recipe: {
          id: 'test-recipe-id',
          title: 'Test Recipe',
          embedding: [0.1, 0.2, 0.3],
          ingredients: ['ingredient1', 'ingredient2']
        }
      }),
      requestContext: {
        requestId: 'test-request-id'
      }
    } as unknown as APIGatewayProxyEvent;

    await handler(event);
    
    // Verify logs were called
    expect(consoleLogSpy).toHaveBeenCalled();
    
    // Check for specific log messages
    const logCalls = consoleLogSpy.mock.calls.map(call => JSON.parse(call[0]));
    
    const storeActionLog = logCalls.find(log => 
      log.message === 'Processing store action' && 
      log.data.recipeId === 'test-recipe-id'
    );
    expect(storeActionLog).toBeDefined();
    
    const successLog = logCalls.find(log => 
      log.message === 'Recipe stored successfully' && 
      log.data.recipeId === 'test-recipe-id'
    );
    expect(successLog).toBeDefined();
  });

  it('should log error information', async () => {
    const event = {
      httpMethod: 'DELETE',
      queryStringParameters: null, // This will cause an error
      requestContext: {
        requestId: 'test-request-id'
      }
    } as unknown as APIGatewayProxyEvent;

    await handler(event);
    
    // Verify error logs were called
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Check for error log
    const errorLogCalls = consoleErrorSpy.mock.calls.map(call => JSON.parse(call[0]));
    const errorLog = errorLogCalls.find(log => log.message === 'Error processing request');
    expect(errorLog).toBeDefined();
    expect(errorLog.error).toContain('Recipe ID is required');
  });

  it('should disable debug logs when DEBUG_LOGGING is not true', async () => {
    // Set DEBUG_LOGGING to false
    process.env.DEBUG_LOGGING = 'false';
    
    const event = {
      httpMethod: 'OPTIONS',
      requestContext: {
        requestId: 'test-request-id'
      }
    } as unknown as APIGatewayProxyEvent;

    consoleLogSpy.mockClear();
    await handler(event);
    
    // Check that debug logs were not called
    const logCalls = consoleLogSpy.mock.calls.map(call => JSON.parse(call[0]));
    const debugLog = logCalls.find(log => log.level === 'DEBUG');
    expect(debugLog).toBeUndefined();
  });
});