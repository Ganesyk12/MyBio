import 'dotenv/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const getEnv = () => ({
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    publicDomain: process.env.R2_PUBLIC_DOMAIN ? process.env.R2_PUBLIC_DOMAIN.replace(/\/+$/, '') : ''
});

let s3ClientInstance = null;

export const isR2Configured = () => {
    const { accountId, accessKeyId, secretAccessKey, bucketName } = getEnv();
    return Boolean(accountId && accessKeyId && secretAccessKey && bucketName);
};

export const getR2Client = () => {
    if (!s3ClientInstance && isR2Configured()) {
        const { accountId, accessKeyId, secretAccessKey } = getEnv();
        s3ClientInstance = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }
    return s3ClientInstance;
};

/**
 * Get public URL for a given object key in R2
 * @param {string} key
 * @returns {string}
 */
export const getPublicUrl = (key) => {
    const cleanKey = key.replace(/^\/+/, '');
    const { publicDomain, bucketName, accountId } = getEnv();
    if (publicDomain) {
        return `${publicDomain}/${cleanKey}`;
    }
    return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${cleanKey}`;
};

/**
 * Upload a file buffer to Cloudflare R2
 * @param {Object} params
 * @param {Buffer} params.fileBuffer - Buffer of the file
 * @param {string} params.fileName - Target file name
 * @param {string} params.contentType - Mime type (e.g. 'image/png', 'application/pdf')
 * @param {string} [params.folder=''] - Optional folder prefix (e.g. 'portfolio', 'uploads')
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export const uploadToR2 = async ({ fileBuffer, fileName, contentType, folder = '' }) => {
    const client = getR2Client();
    const { bucketName } = getEnv();

    if (!client || !bucketName) {
        throw new Error('Cloudflare R2 is not properly configured. Check your environment variables.');
    }

    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const key = cleanFolder ? `${cleanFolder}/${fileName}` : fileName;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
    });

    await client.send(command);
    return getPublicUrl(key);
};

/**
 * Delete a file from Cloudflare R2
 * @param {string} fileUrlOrKey - Full URL or Key of the file in R2
 * @returns {Promise<boolean>}
 */
export const deleteFromR2 = async (fileUrlOrKey) => {
    if (!fileUrlOrKey) return false;
    const client = getR2Client();
    const { bucketName, publicDomain } = getEnv();

    if (!client || !bucketName) return false;

    try {
        let key = fileUrlOrKey;

        // If a full public URL is passed, extract the key
        if (publicDomain && key.startsWith(publicDomain)) {
            key = key.replace(publicDomain, '').replace(/^\/+/, '');
        } else if (key.includes('.r2.cloudflarestorage.com/')) {
            key = key.split('.r2.cloudflarestorage.com/')[1];
        }

        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        await client.send(command);
        return true;
    } catch (error) {
        console.warn('Failed to delete object from R2:', error.message);
        return false;
    }
};

/**
 * Check if a file exists in Cloudflare R2
 * @param {string} key - Object key in bucket (e.g. 'uploads/cv.pdf')
 * @returns {Promise<boolean>}
 */
export const checkR2FileExists = async (key) => {
    const client = getR2Client();
    const { bucketName } = getEnv();

    if (!client || !bucketName) return false;

    const cleanKey = key.replace(/^\/+/, '');

    try {
        const command = new HeadObjectCommand({
            Bucket: bucketName,
            Key: cleanKey,
        });
        await client.send(command);
        return true;
    } catch (error) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404 || error.name === 'NoSuchKey') {
            return false;
        }
        console.warn(`Error checking R2 file existence for key "${cleanKey}":`, error.message);
        return false;
    }
};
