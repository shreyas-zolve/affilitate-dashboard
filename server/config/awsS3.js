import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { Readable } from 'stream';

// Load environment variables
dotenv.config();

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucket = process.env.AWS_S3_BUCKET;

// Generate a random file name
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

// Upload a file to S3
const uploadFile = async (file, leadId) => {
  if (!file || !leadId) {
    throw new Error('File and leadId are required');
  }
  
  const fileName = generateFileName(file.originalname);
  const key = `leads/${leadId}/${fileName}`;
  
  try {
    // Create a readable stream from the buffer
    const stream = Readable.from(file.buffer);
    
    // Upload to S3
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: stream,
        ContentType: file.mimetype,
        ContentDisposition: `inline; filename="${file.originalname}"`,
        Metadata: {
          originalName: file.originalname
        }
      }
    });
    
    await upload.done();
    
    // Generate a signed URL for retrieving the file
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 * 24 * 7 }); // 7 days expiry
    
    return {
      key,
      url: signedUrl,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

// Get a signed URL for a file
const getFileUrl = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 * 24 }); // 24 hours expiry
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

// Delete a file from S3
const deleteFile = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

export default {
  uploadFile,
  getFileUrl,
  deleteFile
};