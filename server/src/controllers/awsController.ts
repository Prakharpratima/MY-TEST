import AWS from 'aws-sdk';
import {Request, Response} from "express";

/**
 * Configures the AWS SDK with credentials and region settings.
 *
 * This function sets up AWS SDK credentials by retrieving the access key ID and
 * secret access key from the environment variables `AWS_ACCESS_KEY_ID` and
 * `AWS_SECRET_ACCESS_KEY`. It also configures the SDK with the region specified
 * in the environment variable `AWS_REGION`.
 *
 * The AWS SDK must be properly imported and initialized before calling this function.
 */
const config = () => {
    AWS.config.credentials = new AWS.Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, // From environment variables
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // From environment variables
    });

    // Configure the AWS SDK
    AWS.config.update({
        region: process.env.AWS_REGION,
    });
};

/**
 * Generates a presigned URL for uploading an object to an AWS S3 bucket.
 *
 * This asynchronous function configures the AWS S3 service and creates
 * a presigned URL for a specified object key. The URL allows temporary
 * permission to upload an object to the designated bucket with the specified
 * key and MIME type.
 *
 * @param {string} key - The key (path/name) of the object in the S3 bucket.
 * @returns {Promise<string>} A promise that resolves to the generated presigned URL.
 * @throws {Error} Throws an error if there is an issue generating the presigned URL.
 */
const generatePresignedUrl = async (key: string): Promise<string> => {

    // Configure the S3 service
    config();
    const s3 = new AWS.S3();

    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Expires: 60, // In seconds
        ContentType: 'application/octet-stream', // MIME type (adjust as needed)
    };

    try {
        const url = await s3.getSignedUrlPromise('putObject', params);
        return url;
    } catch (err) {
        console.error('Error generating presigned URL:', err);
        throw err;
    }
};

/**
 * Generates a presigned URL for downloading a specific file from an S3 bucket.
 *
 * @param {string} key - The key (path) of the file in the S3 bucket for which the presigned URL is to be generated.
 * @returns {Promise<string>} A promise that resolves to the presigned URL string for downloading the file.
 *
 * @throws Will throw an error if the presigned URL cannot be generated.
 *
 * The presigned URL allows temporary access to the file in the S3 bucket without requiring additional authentication.
 * The expiration time for the URL is set to 60 seconds by default.
 */
const generatePresignedUrlToDownload = async (key: string): Promise<string> => {

    // Configure the S3 service
    config();
    const s3 = new AWS.S3();

    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Expires: 60, // In seconds
    };

    try {
        const url = await s3.getSignedUrlPromise('getObject', params);
        return url;
    } catch (err) {
        console.error('Error generating presigned URL:', err);
        throw err;
    }
};

/**
 * Asynchronously generates and returns a presigned URL for accessing a file.
 *
 * @param {Request} req - The HTTP request object containing the file key in the request parameters.
 * @param {Response} res - The HTTP response object used to send back the generated presigned URL or an error message.
 * @throws Sends a 500 status code response with an error message if an exception occurs during the presigned URL generation.
 */
export const getPresignedUrl = async (req: Request, res: Response) => {
    try {
        const { fileKey } = req.params;
        console.log(fileKey);
        const url = await generatePresignedUrl(fileKey);
        res.status(200).json(url);
    } catch (error) {
        res.status(500).json({ error: "Error while generation the presigned url" });
    }
};


/**
 * Handles the generation of a presigned URL for downloading a resource.
 *
 * @async
 * @function
 * @param {Request} req - Express request object, with the parameter `fileKey` indicating the resource to generate the presigned URL for.
 * @param {Response} res - Express response object, used to send the generated presigned URL or handle errors.
 * @returns {Promise<void>}
 * Resolves with the response containing the presigned URL if successful.
 * Rejects with a 500 status and an error message if URL generation fails.
 */
export const getPresignedUrlForDownload = async (req: Request, res: Response) => {
    try {
        const { fileKey } = req.params;
        console.log(fileKey);
        const url = await generatePresignedUrlToDownload(fileKey);
        res.status(200).json(url);
    } catch (error) {
        res.status(500).json({ error: "Error while generation the presigned url for resource download" });
    }
};
