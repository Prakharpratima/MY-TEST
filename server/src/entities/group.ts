import {
    Entity,
    Column,
    ObjectIdColumn,
} from "typeorm";
import "reflect-metadata"
import {AppDataSource} from "../config/typeorm.config";
import {Response} from "express";
import {ObjectId} from "mongodb";

@Entity()
export class Group {
    @ObjectIdColumn()
    _id: ObjectId | undefined; // Unique group identifier (UUID)

    @Column({unique: true, type: "varchar", length: 255})
    name!: string; // Name of the group

    @Column({type: "varchar", length: 255})
    creator!: ObjectId; // The user who created the group

    @Column({type: "array"})
    members!: ObjectId[]; // List of users who are members of this group

    @Column({type: "array"})
    owners!: ObjectId[]; // List of users who are owners of this group
}

/**
 * Asynchronously saves a user as an owner of a specified group in the database.
 *
 * @param {Response} res - The HTTP response object used to send status and messages.
 * @param {ObjectId} groupId - The unique identifier of the group to which the owner is to be added.
 * @param {ObjectId} userId - The unique identifier of the user to be added as an owner of the group.
 * @throws Will return a 404 status response if the group with the provided ID is not found.
 */
export const saveGroupOwner = async (res: Response, groupId: ObjectId, userId: ObjectId) => {
    console.log(groupId, userId);
    const groupRepository = AppDataSource.getRepository(Group);
    const group = await groupRepository.findOne({where: {_id: new ObjectId(groupId)}});
    if (!group) return res.status(404).json({ message: "Group not found" });

    if(group.owners) {
        if (!group.owners.includes(userId)) {
            group.owners.push(userId);
        }
    } else {
        group.owners = [userId];
    }

    await groupRepository.save(group);
}
                                                    ``
