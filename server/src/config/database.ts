import mongoose from "mongoose";
import {AppDataSource} from "./typeorm.config";


export const connectDatabase = () => {
    AppDataSource.initialize()
        .then((dataSource) => {

            console.log("Entity Metadatas:");
            dataSource.entityMetadatas.forEach((metadata) => {
                console.log(metadata.name, metadata.relations.map((relation) => relation.propertyName));
            });

            console.log("🚀 MongoDB connected successfully using TypeORM");
            return;
        })
        .catch((error) => {
            console.error("Error during Data Source initialization:", error);
        });
};
