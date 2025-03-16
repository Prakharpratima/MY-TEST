import { Router } from "express";
import {register, login, setGroupOwner, getUsersList} from "../controllers/AuthController";
import {auth} from "../middlewares/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API for user registration and login
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *           example:
 *             email: "user@example.com"
 *             password: "strongPassword123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *           example:
 *             email: "user@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 test:
 *                   type: string
 *                   example: "test"
 *       400:
 *         description: Invalid credentials or user not found
 *       500:
 *         description: Internal server error
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/assign_group_owner:
 *   post:
 *     summary: Assign ownership of a group to a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - groupId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to be assigned as the group owner
 *               groupId:
 *                 type: string
 *                 description: ID of the group for ownership assignment
 *           example:
 *             userId: "64b7e490f5d4ef00123abcde"
 *             groupId: "64b7e490f5d4ef00987fedcb"
 *     responses:
 *       201:
 *         description: User added as owner successfully
 *       400:
 *         description: Validation error or user/group not found
 *       500:
 *         description: Internal server error
 */
router.post("/assign_group_owner", auth, setGroupOwner);


/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get a list of all users
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: User's unique identifier
 *                   email:
 *                     type: string
 *                     description: User's email address
 *                   name:
 *                     type: string
 *                     description: User's full name
 *       401:
 *         description: Unauthorized, invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */
router.get("/users", auth, getUsersList);

export default router;
