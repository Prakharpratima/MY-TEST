const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation for the project (REST + WebSocket)',
    },
    servers: [
      {
        url: 'http://localhost:8000/api/v1',
        description: 'Development server (REST)',
      },
      {
        url: 'ws://localhost:8000',
        description: 'Development server (WebSocket)',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the user',
            },
            name: {
              type: 'string',
              description: 'The name of the user',
            },
          },
        },
        WebSocketMessage: {
          type: 'object',
          properties: {
            event: {
              type: 'string',
              description: 'The event type being emitted',
              example: 'user-connected',
            },
            data: {
              type: 'object',
              description: 'Payload of the WebSocket message',
              additionalProperties: true,
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
          apiKey: 'Authorization',
        },
      },
    },
    paths: {
      '/socket.io/?EIO=4&transport=websocket': {
        get: {
          summary: 'WebSocket Connection',
          tags: ['WebSocket'],
          description: `
            Establish a WebSocket connection.

            Client should connect to \`ws://localhost:8000/socket.io/?EIO=4&transport=websocket\` and send events.
          `,
          responses: {
            '101': {
              description: 'Switching Protocols - WebSocket connection established',
            },
            '400': {
              description: 'Bad Request - Invalid connection request',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
