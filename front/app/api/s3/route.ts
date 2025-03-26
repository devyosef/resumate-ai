import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const key = `${timestamp}-${file.name}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(uploadCommand);

    return NextResponse.json({
      success: true,
      fileKey: key
    });
  } catch (error: unknown) {
    console.error('S3 Upload Error:', error);
    
    if (error && typeof error === 'object' && 'Code' in error && error.Code === 'RequestTimeout') {
      return NextResponse.json(
        { error: 'Upload timed out. Please try again with a smaller file or check your connection.' },
        { status: 504 }
      );
    }
    
    if (error && typeof error === 'object' && 'Code' in error && error.Code === 'AccessDenied') {
      return NextResponse.json(
        { error: 'Access denied. Please check your credentials.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}
