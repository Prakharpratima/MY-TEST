import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {saveUserGroupOwnership, User} from "../entities/user";
import { AppDataSource } from "../config/typeorm.config";
import { Request, Response } from "express";
import Joi from "joi";
import {Group, saveGroupOwner} from "../entities/group";

// Validation schema
const authSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

// Validation schema
const groupOwnerSchema = Joi.object({
    userId: Joi.string().required(),
    groupId: Joi.string().required(),
});

/**
 * Handles the user registration process.
 * Validates the request body, checks for existing user with the provided email,
 * hashes the password, creates a new user record, and saves it to the database.
 * Responds with appropriate status codes and messages based on the success or failure of the operation.
 *
 * @param {Request} req - The HTTP request object containing user registration details.
 * @param {Response} res - The HTTP response object to send back the result of the registration process.
 * @returns {Promise<void>} Sends a response indicating the result of the registration process.
 */
export const register = async (req: Request, res: Response) => {
    const {email, password} = req.body;

    // Validate request body
    const {error} = authSchema.validate({email, password});
    if (error) return res.status(400).send(error.details[0].message);

    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) return res.status(400).send("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User();
    user.email = email;
    user.password =hashedPassword

    await userRepository.save(user);

    res.status(201).send("User registered successfully");
};

/**
 * Handles user login by validating credentials and generating a JWT token.
 *
 * @param {Request} req - The Express request object containing email and password in the body.
 * @param {Response} res - The Express response object to send the response.
 * @return {Promise<void>} Returns a promise that resolves with no data when the request is processed successfully.
 *                          Sends a status response with a JWT token on success or an error message on failure.
 */
export const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;

    // Validate request body
    const {error} = authSchema.validate({email, password});
    if (error) return res.status(400).send(error.details[0].message);

    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email } });
    if (!existingUser) return res.status(400).send("User not found");

    const isValid = await bcrypt.compare(password, existingUser.password);
    if (!isValid) return res.status(400).send("Incorrect password");

    const token = jwt.sign({ _id: existingUser._id }, process.env.JWT_SECRET!);

    // @ts-ignore
    delete existingUser.password; // Remove password property before sending to client
    res.status(200).send({ token, user: existingUser });
};

/**
 * Asynchronously assigns a user as the owner of a specific group.
 * Processes the request body to validate the user ID and group ID, then updates the group ownership in the database.
 * Sends an appropriate response status and message based on the operation outcome.
 *
 * @async
 * @function setGroupOwner
 * @param {Request} req - The incoming HTTP request, containing the user ID and group ID in the request body.
 * @param {Response} res - The HTTP response object used to send the operation's result.
 * @throws {Error} Responds with a 400 status code and error message if validation fails.
 * @throws {Error} Responds with appropriate status and message if the database operations fail.
 */
export const setGroupOwner = async (req: Request, res: Response) => {
    const {userId, groupId} = req.body;

    // Validate request body
    const {error} = groupOwnerSchema.validate({userId, groupId});
    if (error) return res.status(400).send(error.details[0].message);

    await saveUserGroupOwnership(res, userId, groupId)
    console.log(userId, groupId);
    await saveGroupOwner(res, groupId, userId)

    res.status(200).send("User added as owner successfully");
};

/**
 * Asynchronous function to retrieve a list of users from the database.
 *
 * Retrieves data using the User entity repository and sends the list of users
 * as a JSON response with HTTP status code 200. If an error occurs during the
 * process, it sends a JSON response with an error message and HTTP status code 500.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
 */
export const getUsersList = async (req: Request, res: Response) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find();

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Error retrieving users" });
    }
}
