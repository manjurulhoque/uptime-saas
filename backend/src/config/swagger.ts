import swaggerJsdoc from "swagger-jsdoc";
import { SwaggerDefinition } from "swagger-jsdoc";

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Uptime SaaS API",
    version: "1.0.0",
    description: "API documentation for Uptime SaaS backend service",
    contact: {
      name: "API Support",
      email: "support@uptimesaas.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: process.env.API_URL || "http://localhost:9900",
      description: "Development server",
    },
    {
      url: "https://api.uptimesaas.com",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "User unique identifier",
          },
          email: {
            type: "string",
            format: "email",
            description: "User email address",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "User creation timestamp",
          },
        },
        required: ["id", "email", "createdAt"],
      },
      AuthTokens: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
            description: "JWT access token",
          },
          refreshToken: {
            type: "string",
            description: "JWT refresh token",
          },
        },
        required: ["accessToken", "refreshToken"],
      },
      RegisterRequest: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "User email address",
            example: "user@example.com",
          },
          password: {
            type: "string",
            format: "password",
            minLength: 8,
            description: "User password (minimum 8 characters)",
            example: "password123",
          },
        },
        required: ["email", "password"],
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "User email address",
            example: "user@example.com",
          },
          password: {
            type: "string",
            format: "password",
            description: "User password",
            example: "password123",
          },
        },
        required: ["email", "password"],
      },
      RefreshTokenRequest: {
        type: "object",
        properties: {
          refreshToken: {
            type: "string",
            description: "JWT refresh token",
          },
        },
        required: ["refreshToken"],
      },
      ChangePasswordRequest: {
        type: "object",
        properties: {
          currentPassword: {
            type: "string",
            format: "password",
            description: "Current password",
          },
          newPassword: {
            type: "string",
            format: "password",
            minLength: 8,
            description: "New password (minimum 8 characters)",
          },
        },
        required: ["currentPassword", "newPassword"],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Error message",
          },
          code: {
            type: "string",
            description: "Error code",
          },
        },
        required: ["error"],
      },
      SuccessResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Success message",
          },
        },
        required: ["message"],
      },
      HealthCheck: {
        type: "object",
        properties: {
          status: {
            type: "string",
            example: "OK",
            description: "Service status",
          },
          timestamp: {
            type: "string",
            format: "date-time",
            description: "Current timestamp",
          },
          uptime: {
            type: "number",
            description: "Service uptime in seconds",
          },
          environment: {
            type: "string",
            description: "Current environment",
          },
        },
        required: ["status", "timestamp", "uptime", "environment"],
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/server.ts"], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);
