export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Eventful API',
    version: '1.0.0',
    description: 'Express.js + TypeScript event ticketing API documentation',
  },
  servers: [
    {
      url: '/api',
      description: 'Main API',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Events', description: 'Event management endpoints' },
    { name: 'Checkout', description: 'Ticketing and payment endpoints' },
    { name: 'Analytics', description: 'Reporting and analytics' },
    { name: 'Scan', description: 'Ticket scanning endpoints' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      scanAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-scan-id',
        description: 'Scan password from SCAN_PASSWORD environment variable',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['CREATOR', 'EVENTEE'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Event: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          creatorId: { type: 'string', format: 'uuid' },
          basePrice: { type: 'number' },
          calculatedPrice: { type: 'number' },
          reminderType: { type: 'string', enum: ['ONE_DAY', 'ONE_WEEK'] },
          pricingType: { type: 'string', enum: ['STANDARD', 'EARLY_BIRD', 'VIP'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Ticket: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          eventId: { type: 'string', format: 'uuid' },
          eventeeId: { type: 'string', format: 'uuid' },
          qrCodeUrl: { type: 'string', nullable: true },
          reference: { type: 'string', example: 'TKT-uuid' },
          isPaid: { type: 'boolean' },
          isScanned: { type: 'boolean' },
          amountPaid: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'User Signup',
        description: 'Rate limited: 5 req/min',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'role'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  role: { type: 'string', enum: ['CREATOR', 'EVENTEE'] },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          409: {
            description: 'Conflict',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'conflict', message: 'This email is already registered' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'User Login',
        description: 'Rate limited: 5 req/min',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Unauthorized', message: 'Invalid email or Password.' },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string' },
                        role: { type: 'string', enum: ['CREATOR', 'EVENTEE'] },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      delete: {
        tags: ['Auth'],
        summary: 'Logout user',
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Logged out successfully.' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/events': {
      post: {
        tags: ['Events'],
        summary: 'Create a new event',
        description: 'CREATOR role recommended. Rate limited: 60 req/min',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'date', 'basePrice', 'reminderType', 'pricingType'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  date: { type: 'string', format: 'date-time' },
                  basePrice: { type: 'number', minimum: 0 },
                  reminderType: { type: 'string', enum: ['ONE_DAY', 'ONE_WEEK'] },
                  pricingType: { type: 'string', enum: ['STANDARD', 'EARLY_BIRD', 'VIP'] },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Event' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/events/popular': {
      get: {
        tags: ['Events'],
        summary: 'Get popular events',
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Event' },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/events/my-events': {
      get: {
        tags: ['Events'],
        summary: 'Get events created by authenticated user',
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Event' },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/events/{eventId}': {
      get: {
        tags: ['Events'],
        summary: 'Get event by ID',
        parameters: [
          {
            name: 'eventId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Event' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/events/{eventId}/share': {
      get: {
        tags: ['Events'],
        summary: 'Get event share metadata',
        parameters: [
          {
            name: 'eventId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'platform',
            in: 'query',
            required: true,
            schema: { type: 'string', enum: ['twitter', 'linkedin', 'facebook'] },
          },
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/checkout': {
      post: {
        tags: ['Checkout'],
        summary: 'Initiate checkout',
        description: 'EVENTEE role required.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['eventId'],
                properties: {
                  eventId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    authorizationUrl: { type: 'string' },
                    reference: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { description: 'Internal Server Error' },
        },
      },
    },
    '/checkout/history': {
      get: {
        tags: ['Checkout'],
        summary: 'Get ticket history',
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Ticket' },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/checkout/verify/{reference}': {
      get: {
        tags: ['Checkout'],
        summary: 'Verify ticket payment',
        parameters: [
          {
            name: 'reference',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^TKT-' },
          },
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['ALREADY_PAID', 'JUST_PAID', 'PENDING'] },
                    ticket: { $ref: '#/components/schemas/Ticket' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { description: 'Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/checkout/webhook': {
      post: {
        tags: ['Checkout'],
        summary: 'Paystack Webhook',
        description: 'Server-to-server only. Verified via x-paystack-signature header.',
        security: [],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/analytics/overview': {
      get: {
        tags: ['Analytics'],
        summary: 'Get analytics overview',
        description: 'CREATOR role recommended.',
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalEvents: { type: 'number' },
                    totalAttendeesCount: { type: 'number' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/analytics/event/{eventId}': {
      get: {
        tags: ['Analytics'],
        summary: 'Get event-specific analytics',
        parameters: [
          {
            name: 'eventId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    eventId: { type: 'string', format: 'uuid' },
                    ticketsSold: { type: 'number' },
                    qrScannedCount: { type: 'number' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/scan': {
      post: {
        tags: ['Scan'],
        summary: 'Scan ticket',
        security: [{ scanAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['ticketId', 'eventId'],
                properties: {
                  ticketId: { type: 'string', format: 'uuid' },
                  eventId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Ticket scanned successfully.' },
                    ticket: { $ref: '#/components/schemas/Ticket' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'unauthorized', message: 'Invalid scan password.' },
              },
            },
          },
          402: {
            description: 'Payment Required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'payment_required', message: 'Ticket has not been paid for.' },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
          409: {
            description: 'Conflict',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'conflict', message: 'Ticket has already been scanned.' },
              },
            },
          },
        },
      },
    },
  },
  'components/responses': {
    BadRequest: {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    Unauthorized: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    NotFound: {
      description: 'Not Found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
};
