import { Router } from "express";
import {auth} from "../middlewares/auth";
import {getPresignedUrl, getPresignedUrlForDownload} from "../controllers/awsController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AWS
 *   description: API for connection with AWS
 */

/**
 * @swagger
 * /aws/{fileKey}/get_presigned_url:
 *   get:
 *     summary: Get AWS S3 presigned URL for a file
 *     tags: [AWS]
 *     description: This endpoint generates a presigned URL for accessing an AWS S3 file. The `fileKey` parameter specifies the key of the file in the S3 bucket.
 *     parameters:
 *       - in: path
 *         name: fileKey
 *         required: true
 *         description: The key of the file in the S3 bucket.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully generated the presigned URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The presigned URL for the file.
 *                   example: "https://s3.amazonaws.com/bucket-name/file-key?AWSAccessKeyId=example"
 *       400:
 *         description: Bad request, invalid fileKey parameter.
 *       401:
 *         description: Unauthorized, user is not authenticated.
 *       500:
 *         description: Internal server error.
 *     security:
 *       - bearerAuth: []
 */
router.get("/:fileKey/get_presigned_url", auth, getPresignedUrl);


/**
 * @swagger
 * /aws/{fileKey}/get_presigned_url_download:
 *   get:
 *     summary: Get AWS S3 presigned URL for downloading a file
 *     tags: [AWS]
 *     description: This endpoint generates a presigned URL for downloading a file from AWS S3. The `fileKey` parameter specifies the key of the file in the S3 bucket.
 *     parameters:
 *       - in: path
 *         name: fileKey
 *         required: true
 *         description: The key of the file in the S3 bucket.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully generated the presigned URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The presigned URL for downloading the file.
 *                   example: "https://s3.amazonaws.com/bucket-name/file-key?AWSAccessKeyId=example&response-content-disposition=attachment"
 *       400:
 *         description: Bad request, invalid fileKey parameter.
 *       401:
 *         description: Unauthorized, user is not authenticated.
 *       500:
 *         description: Internal server error.
 *     security:
 *       - bearerAuth: []
 */
router.get("/:fileKey/get_presigned_url_download", auth, getPresignedUrlForDownload);

export default router;
