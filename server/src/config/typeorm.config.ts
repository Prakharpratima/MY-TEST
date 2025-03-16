import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "mongodb", // Database type
    url: "mongodb+srv://prakharkumar1314:4h0TKimFXaHO8MyJ@cluster0.kwskxal.mongodb.net/my_test",
    useNewUrlParser: true,
    useUnifiedTopology: true,
    synchronize: true, // Automatically sync entity schemas (set to false in production)
    logging: true,
    entities: ['./src/entities/*.ts'], // Point to your entities
});
