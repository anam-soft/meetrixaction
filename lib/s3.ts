import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
})

export async function generateUploadUrl(fileName: string, fileType: string) {
  const key = `meetings/${Date.now()}-${fileName}`
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: fileType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  
  return {
    uploadUrl,
    key,
    fileUrl: `${process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`,
  }
}

export async function uploadToS3(file: Buffer, fileName: string, fileType: string) {
  const key = `meetings/${Date.now()}-${fileName}`
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Body: file,
    ContentType: fileType,
  })

  await s3Client.send(command)
  
  return {
    key,
    fileUrl: `${process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`,
  }
}
