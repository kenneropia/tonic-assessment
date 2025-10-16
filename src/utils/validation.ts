import { Request, Response, NextFunction } from "express";
import { z, ZodObject, ZodRawShape } from "zod";

export const transferSchema = {
  body: z.object({
    receiverAccountNumber: z.string().min(1),
    amount: z.number().positive("Amount must be greater than 0"),
    description: z.string().optional(),
    idempotencyKey: z.string().uuid().optional(),
  }),
};

export const signupSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(["CUSTOMER", "ADMIN"]).optional(),
  }),
};

export const signinSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
};

export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string().min(1),
  }),
};

type SchemaConfig = {
  body?: z.ZodType<any>;
  params?: z.ZodType<any>;
  query?: z.ZodType<any>;
  headers?: z.ZodType<any>;
};

export const validate = (schemaConfig: SchemaConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate: {
        body?: any;
        params?: any;
        query?: any;
        headers?: any;
      } = {};
      const validatedData: {
        body?: any;
        params?: any;
        query?: any;
        headers?: any;
      } = {};

      if (schemaConfig.body) {
        if (!req.body) req.body = {};
        dataToValidate.body = req.body;
        validatedData.body = await schemaConfig.body.parseAsync(req.body);
      }

      if (schemaConfig.params && req.params) {
        dataToValidate.params = req.params;
        validatedData.params = await schemaConfig.params.parseAsync(req.params);
      }

      if (schemaConfig.query && req.query) {
        dataToValidate.query = req.query;
        validatedData.query = await schemaConfig.query.parseAsync(req.query);
      }

      if (schemaConfig.headers && req.headers) {
        dataToValidate.headers = req.headers;
        validatedData.headers = await schemaConfig.headers.parseAsync(
          req.headers
        );
      }

      if (validatedData.body) req.body = validatedData.body;
      if (validatedData.params) req.params = validatedData.params;
      if (validatedData.query) req.query = validatedData.query;
      if (validatedData.headers) req.headers = validatedData.headers;
      next();
    } catch (error: any) {
      if (error.errors) {
        const formattedErrors = error.errors.map((err: any) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: formattedErrors,
        });
      }

      return res.status(400).json({
        status: "error",
        message: error.message || "Validation failed",
      });
    }
  };
};
