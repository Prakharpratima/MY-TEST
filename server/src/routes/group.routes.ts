import { Router } from "express";
import { auth } from "../middlewares/auth";
import {
    createGroup,
    listGroups,
    joinGroup,
    leaveGroup,
    deleteGroup,
} from "../controllers/GroupController";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: API for managing user groups
 */

/**
 * @swagger
 * /groups/:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the group
 *               description:
 *                 type: string
 *                 description: A short description of the group
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Group created successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post("/", auth, createGroup);

/**
 * @swagger
 * /groups/:
 *   get:
 *     summary: List all groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of groups.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Group ID
 *                   name:
 *                     type: string
 *                     description: Name of the group
 *                   description:
 *                     type: string
 *                     description: Group description
 *       401:
 *         description: Unauthorized.
 */
router.get("/", auth, listGroups);

/**
 * @swagger
 * /groups/{groupId}/join:
 *   post:
 *     summary: Join a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group to join
 *     responses:
 *       200:
 *         description: Successfully joined the group.
 *       404:
 *         description: Group not found.
 *       401:
 *         description: Unauthorized.
 */
router.post("/:groupId/join", auth, joinGroup);

/**
 * @swagger
 * /groups/{groupId}/leave:
 *   post:
 *     summary: Leave a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group to leave
 *     responses:
 *       200:
 *         description: Successfully left the group.
 *       404:
 *         description: Group not found.
 *       401:
 *         description: Unauthorized.
 */
router.post("/:groupId/leave", auth, leaveGroup);

/**
 * @swagger
 * /groups/{groupId}:
 *   delete:
 *     summary: Delete a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group to delete
 *     responses:
 *       200:
 *         description: Group deleted successfully.
 *       404:
 *         description: Group not found.
 *       401:
 *         description: Unauthorized.
 */
router.delete("/:groupId", auth, deleteGroup);

export default router;
