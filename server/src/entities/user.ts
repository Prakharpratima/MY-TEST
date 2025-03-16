import {Entity, Column, ObjectIdColumn} from "typeorm";
import "reflect-metadata"
import {Response} from "express";
import {AppDataSource} from "../config/typeorm.config";
import {ObjectId} from "mongodb";

@Entity()
export class User {
    @ObjectIdColumn()
    _id: ObjectId | undefined;

    @Column({unique: true, type: "varchar", length: 255})
    email!: string; // Email address (must be unique)

    @Column({type: "varchar", length: 255})
    password!: string; // Hashed user password (for security)

    @Column({type: "varchar", length: 255})
    name?: string; // Full name of the user (optional)

    @Column({type: "array"})
    createdGroups?: ObjectId[]; // Groups this user has created

    @Column({type: "array"})
    memberships?: ObjectId[]; // Groups this user is a member of

    @Column({type: "array"})
    ownerships?: ObjectId[]; // Groups this user is a owner of
}

/**
 * Asynchronously saves a group associated with a specific user as a group created by the user.
 *
 * This function checks if the user with the given `userId` exists, and then adds the
 * specified `groupId` to the user's list of created groups. If the `groupId` already
 * exists in the user's list of created groups, no duplicate entries will be added.
 * If the user does not have a `createdGroups` list, a new list is created with the provided `groupId`.
 *
 * @param {Response} res - The HTTP response object used to send responses back to the client.
 * @param {string} userId - The identifier of the user to associate the group with.
 * @param {ObjectId} groupId - The identifier of the group to be associated with the user.
 * @returns {Promise<void>} Resolves when the operation is completed. If the user is not found, sends a 400 status with an error message.
 */
export const saveGroupCreatedByUser = async (res: Response, userId: string, groupId: ObjectId) => {
    console.log(userId, groupId);
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { _id: new ObjectId(userId)} });
    if (!existingUser) return res.status(400).send("User not found");

    if(existingUser.createdGroups) {
        if (!existingUser.createdGroups.includes(groupId)) {
            existingUser.createdGroups.push(groupId);
        }
    } else {
        existingUser.createdGroups = [groupId]
    }

    await userRepository.save(existingUser);
}

/**
 * Asynchronously saves the user's group membership.
 *
 * This function checks if the user exists in the database and updates
 * their group memberships by adding the specified group ID if it is
 * not already included. If the user does not have any memberships,
 * it initializes the membership list with the given group ID.
 *
 * @param {Response} res - The HTTP response object used to send a response in case of errors.
 * @param {string} userId - The unique identifier of the user whose membership is being updated.
 * @param {ObjectId} groupId - The unique identifier of the group being added to the user's memberships.
 * @returns {Promise<void>} Resolves after the user's membership is successfully updated or an error response is sent.
 */
export const saveUserGroupMembership = async (res: Response, userId: string, groupId: ObjectId) => {
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { _id: new ObjectId(userId)} });
    if (!existingUser) return res.status(400).send("User not found");

    if(existingUser.memberships) {
        if (!existingUser.memberships.includes(groupId)) {
            existingUser.memberships.push(groupId);
        }
    } else {
        existingUser.memberships = [groupId]
    }

    await userRepository.save(existingUser);
}

/**
 * Removes a user's membership in a specified group.
 *
 * This function updates the user's memberships by filtering out the specified group ID.
 * If the user does not exist or cannot be found, it returns a 400 status with a "User not found" message.
 * It uses the provided user ID and group ID to identify and remove the membership.
 *
 * @param {Response} res - The HTTP response object used to send back the result of the operation.
 * @param {string} userId - The ID of the user whose group membership needs to be removed.
 * @param {ObjectId} groupId - The ID of the group that needs to be removed from the user's memberships.
 * @returns {Promise<void>} A promise that resolves once the membership is removed and the user data is saved.
 */
export const removeUserGroupMembership = async (res: Response, userId: string, groupId: ObjectId) => {
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({where: {_id: new ObjectId(userId)}});
    if (!existingUser) return res.status(400).send("User not found");

    if (existingUser.memberships) {
        existingUser.memberships = existingUser.memberships.filter(id => id.toString() !== groupId.toString());
    }

    await userRepository.save(existingUser);
}

/**
 * Asynchronously saves the ownership of a group to the specified user by adding
 * the group ID to the user's ownerships array if it does not already exist.
 * If the user does not have an ownerships array, a new one is created with the group ID.
 * Updates the userRecord in the database upon successful execution.
 *
 * @function
 * @async
 * @param {Response} res - The HTTP response object to send responses to the client.
 * @param {string} userId - The ID of the user to whom the group ownership is being assigned.
 * @param {ObjectId} groupId - The ID of the group to add to the user's ownerships array.
 * @throws {Error} Sends a 400 HTTP response with an error message if the user is not found in the database.
 */
export const saveUserGroupOwnership = async (res: Response, userId: string, groupId: ObjectId) => {
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { _id: new ObjectId(userId)} });
    if (!existingUser) return res.status(400).send("User not found");

    if(existingUser.ownerships) {
        if (!existingUser.ownerships.includes(groupId)) {
            existingUser.ownerships.push(groupId);
        }
    } else {
        existingUser.ownerships = [groupId]
    }

    await userRepository.save(existingUser);
}

/**
 * Asynchronously removes a group ownership from a user's list of ownerships in the database.
 *
 * @param {Response} res - The HTTP response object.
 * @param {string} userId - The ID of the user from whom the group ownership is to be removed.
 * @param {ObjectId} groupId - The ID of the group ownership to be removed.
 *
 * @throws Will respond with a 400 status and an error message if the user is not found.
 *
 * Updates the user's ownerships by filtering out the specified group ID and saves the updated user record to the database.
 */
export const removeUserGroupOwnership = async (res: Response, userId: string, groupId: ObjectId) => {
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({where: {_id: new ObjectId(userId)}});
    if (!existingUser) return res.status(400).send("User not found");

    if (existingUser.ownerships) {
        existingUser.ownerships = existingUser.ownerships.filter(id => id.toString() !== groupId.toString());
    }

    await userRepository.save(existingUser);
}

/**
 * Removes a group created by the user from the user's associated created groups list.
 *
 * @async
 * @function removeGroupCreatedByUser
 * @param {Response} res - The response object used to send the status and messages.
 * @param {string} userId - The unique identifier of the user whose group is being removed.
 * @param {ObjectId} groupId - The unique identifier of the group to be removed.
 * @throws Will return a 400 status response if the user is not found.
 * @description This function fetches the user from the database and checks if the user has any created groups.
 * If the user has such groups, the function filters out the specified group and updates the user's data in the database.
 */
export const removeGroupCreatedByUser = async (res: Response, userId: string, groupId: ObjectId) => {
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({where: {_id: new ObjectId(userId)}});
    if (!existingUser) return res.status(400).send("User not found");

    if (existingUser.createdGroups) {
        existingUser.ownerships = existingUser.createdGroups.filter(id => id.toString() !== groupId.toString());
    }

    await userRepository.save(existingUser);
}
