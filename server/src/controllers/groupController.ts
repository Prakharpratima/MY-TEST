import { Request, Response } from "express";
import Joi from "joi";
import {AppDataSource} from "../config/typeorm.config";
import {Group, saveGroupOwner} from "../entities/group";
import { ObjectId } from "mongodb";
import {
    removeGroupCreatedByUser,
    removeUserGroupMembership,
    removeUserGroupOwnership,
    saveGroupCreatedByUser,
    saveUserGroupMembership
} from "../entities/user";

// Validation schema
const creatGroupSchema = Joi.object({
    name: Joi.string().min(6).required()
});

// Validation schema
const groupIdSchema = Joi.object({
    groupId: Joi.string().required()
});


/**
 * Asynchronously handles the creation of a new group.
 *
 * This function validates the incoming request body to ensure it meets
 * the necessary schema requirements. If the validation is successful,
 * it retrieves the authenticated user's ID from the request, creates a
 * new group object, and saves it to the database using the Group repository.
 * If successful, the group is returned in the response with a 201 status.
 * In case of validation errors or unexpected server errors, appropriate
 * error responses are sent.
 *
 * @param {Request} req - The HTTP request object, expected to contain the group name in its body.
 *                         The authenticated user's ID should be accessible as part of the request user object.
 * @param {Response} res - The HTTP response object, used to send back a status code and any relevant data or error messages.
 *
 * @throws Will send a 400 response if the request body validation fails.
 * @throws Will send a 500 response if there is an error during the group creation process.
 */
export const createGroup = async (req: Request, res: Response) => {
    const { name } = req.body;

    // Validate request body
    const {error} = creatGroupSchema.validate({name});
    if (error) return res.status(400).send(error.details[0].message);

    const creatorId = (req as any).user._id;

    try {
        const groupRepository = AppDataSource.getRepository(Group);

        const group = new Group();
        group.name = name;
        group.creator = creatorId;
        group.owners = [creatorId];

        await groupRepository.save(group);

        console.log(group, creatorId);
        if (!group._id) throw new Error("Group ID is undefined after saving.");
        await saveGroupCreatedByUser(res, creatorId, group._id);

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ error: "Error creating group. " + error.message });
    }
};

/**
 * Handles the retrieval of a list of groups from the database.
 *
 * This asynchronous function fetches all group data from the database
 * and sends it as a JSON response. If an error occurs during the fetch operation,
 * it returns a 500 status response with an error message.
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The outgoing response object.
 *
 * @returns {Promise<void>} A promise that resolves to no value upon completion.
 */
export const listGroups = async (req: Request, res: Response) => {
    try {
        const groupRepository = AppDataSource.getRepository(Group);
        const groups = await groupRepository.find();

        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: "Error retrieving groups" });
    }
};

/**
 * Handles the process of a user joining a specific group based on the provided group ID.
 *
 * This function validates the incoming request parameter `groupId`, ensuring it adheres
 * to the required schema. If validation fails, it responds with a 400 status and an
 * appropriate error message.
 *
 * If the `groupId` is valid, the function attempts to retrieve the group from the database.
 * If the group is not found, it responds with a 404 status and an error message indicating
 * that the group does not exist.
 *
 * If the group exists, the function checks whether the user is already a member of the group:
 * - If the user is not a member, their ID is added to the group's list of members, and the
 *   updated group is saved to the database.
 * - If the group does not have a `members` property, a new array is created with the user's ID,
 *   and the group is saved to the database.
 *
 * Responds with a 200 status and the updated group object upon successful completion of the
 * join operation.
 *
 * In case of an unexpected server error during the operation, the function responds with
 * a 500 status and an appropriate error message.
 *
 * @param {Request} req - The incoming HTTP request object, which must include `groupId` in the
 *                        request parameters and the user's ID in the authenticated request object.
 * @param {Response} res - The HTTP response object used to send the server's response back
 *                         to the client.
 * @returns {Promise<void>} - A promise indicating the completion of the join group operation.
 *                            The response is sent directly to the client.
 */
export const joinGroup = async (req: Request, res: Response) => {
    const { groupId } = req.params;

    // Validate request param
    const {error} = groupIdSchema.validate({groupId});
    if (error) return res.status(400).send(error.details[0].message);

    const userId = (req as any).user._id;
    try {
        const groupRepository = AppDataSource.getRepository(Group);
        const group = await groupRepository.findOne({where: {_id: new ObjectId(groupId)}});
        if (!group) return res.status(404).json({ message: "Group not found" });

        if(group.members) {
            if (!group.members.includes(userId)) {
                group.members.push(userId);
            }
        } else {
            group.members = [userId];
        }

        await groupRepository.save(group);

        await saveUserGroupMembership(res, userId, new ObjectId(groupId))

        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: "Error joining group" });
    }
};

/**
 * Handles the logic for a user leaving a group.
 *
 * This asynchronous function processes the user's request to leave a specified group.
 * It validates the group ID from the request parameters, checks if the group exists,
 * and ensures the user is a member or owner of the group. The function then removes
 * the user from the group's members and/or owners lists. If removal of the user would
 * leave the group without any owners, the operation is not permitted, and an appropriate
 * response is returned. Once the user is successfully removed, the updates are saved
 * in the database, and related user-group associations are cleaned up.
 *
 * @param {Request} req - The HTTP request object containing parameters and user information.
 * @param {Response} res - The HTTP response object used for sending the response.
 * @throws Will return a 400 error if the group ID validation fails.
 * @throws Will return a 404 error if the specified group is not found.
 * @throws Will return a 406 error if the group has no members or if no owners remain after user removal.
 * @throws Will return a 500 error if an internal server error occurs during processing.
 */
export const leaveGroup = async (req: Request, res: Response) => {
    const { groupId } = req.params;

    // Validate request param
    const {error} = groupIdSchema.validate({groupId});
    if (error) return res.status(400).send(error.details[0].message);

    const userId = (req as any).user._id;
    try {
        const groupRepository = AppDataSource.getRepository(Group);
        const group = await groupRepository.findOne({where: {_id: new ObjectId(groupId)}});
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (group.members && group.members.includes(userId)) {
            group.members.splice(group.members.indexOf(userId), 1);

        } else {
            return res.status(406).json({ message: "Group not have any members" });
        }

        if(group.owners && group.owners.includes(userId)) {
            group.owners.splice(group.owners.indexOf(userId), 1);
        }

        if(!group.owners || group.owners.length === 0) {
            return res.status(406).json({ message: "Please link group with owner, before leaving the group." });
        }

        await groupRepository.save(group);

        await removeUserGroupMembership(res, userId, new ObjectId(groupId));
        await removeUserGroupOwnership(res, userId, new ObjectId(groupId));

        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: "Error leaving group" });
    }
};


/**
 * Deletes a group based on the provided group ID.
 *
 * This asynchronous function handles the deletion of a group, validating the
 * request parameters using a predefined schema. It ensures that the requesting
 * user is a member and owner of the group before proceeding with the deletion.
 * If the group does not exist, or if the user does not have sufficient ownership
 * permissions, appropriate errors are returned.
 *
 * Validation:
 * - Expects `groupId` as a parameter from the request.
 * - Validates `groupId` using the `groupIdSchema`.
 *
 * Pre-conditions:
 * - The requesting user must be authenticated.
 * - The requesting user must be an owner of the group to delete it.
 *
 * Error Cases:
 * - Returns 400 if `groupId` validation fails.
 * - Returns 404 if the group is not found in the database.
 * - Returns 400 if the requesting user is not an owner of the group.
 * - Returns 500 if an internal server error occurs.
 *
 * Success:
 * - Deletes the group from the database and removes user memberships.
 * - Returns a 200 status code with a success message upon successful deletion.
 *
 * @param {Request} req - The HTTP request object containing group ID in the parameters and user information.
 * @param {Response} res - The HTTP response object to send the result of the operation.
 * @async
 */
export const deleteGroup = async (req: Request, res: Response) => {
    const { groupId } = req.params;

    // Validate request param
    const {error} = groupIdSchema.validate({groupId});
    if (error) return res.status(400).send(error.details[0].message);

    const userId = (req as any).user._id;
    try {
        const groupRepository = AppDataSource.getRepository(Group);
        const group = await groupRepository.findOne({where: {_id: new ObjectId(groupId)}});
        if (!group) return res.status(404).json({ message: "Group not found" });

        let groupHasOwner = false;
        for (const owner of group.owners) {
            if(owner.toString() === userId.toString()) {
                groupHasOwner = true;
                await removeUserGroupMembership(res, userId, new ObjectId(groupId));
                await removeUserGroupOwnership(res, userId, new ObjectId(groupId));
                await removeGroupCreatedByUser(res, userId, new ObjectId(groupId));
            }
        }
        if(!groupHasOwner) return res.status(400).json({ message: "You can't delete group where you are not an owner" });

        await groupRepository.delete(groupId);

        res.status(200).json("Group deleted successfully!");
    } catch (error) {
        res.status(500).json({ error: "Error deleting group", e: error.message });
    }
};
