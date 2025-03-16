import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express"; // Importing types for TypeScript

/**
 * Middleware to auth and validate JWT tokens
 */
export const auth = (req: Request, res: Response, next: NextFunction) => {
    // Retrieve the token from the `Authorization` header
    const token = getTokenFromHeader(req.header("Authorization"));

    if (!token) {
        // If the token is missing, return a 401 Unauthorized response
        return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    try {
        // Verify the token using the JWT secret key
        const verified = jwt.verify(token, process.env.JWT_SECRET!);
        // Attach the verified user details to the `req` object to allow downstream access
        (req as any).user = verified;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // If the token verification fails, return a 400 Bad Request response
        res.status(400).json({ message: "Invalid Token" });
    }
};

/**
 * Extracts the token from the Authorization header
 * Handles cases where the token is prefixed with "Bearer"
 */
const getTokenFromHeader = (authHeader: string | undefined): string | null => {
    if (!authHeader) return null;
    const parts = authHeader.split(" ");
    return parts.length > 1 ? parts[1] : parts[0];
};
