#!/usr/bin/env node
import { env } from 'process';

async function runS3Check() {
  const bucket = env.TAVUS_S3_BUCKET || env.AWS_S3_BUCKET;
  if (!bucket) {
    console.log('S3 bucket not configured; skipping S3 check');
    return;
  }
  console.log('Running S3 check against bucket:', bucket);
  try {
    const { S3Client, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const client = new S3Client({ region: env.AWS_REGION || undefined });
    const key = `smoke-${Date.now()}.txt`;
    const body = Buffer.from('smoke test');
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: 'text/plain' }));
    console.log('Uploaded', key);
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    console.log('Head succeeded for', key);
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    console.log('Deleted', key);
  } catch (e) {
    console.error('S3 smoke check failed:', e);
    throw e;
  }
}

async function runRedisCheck() {
  const url = env.REDIS_URL || env.REDIS || env.REDIS_URI;
  if (!url) {
    console.log('REDIS not configured; skipping Redis check');
    return;
  }
  console.log('Running Redis check against:', url);
  try {
    const IORedis = (await import('ioredis')).default || (await import('ioredis'));
    const client = new IORedis(url);
    const pong = await client.ping();
    console.log('Redis PING response:', pong);
    await client.quit();
  } catch (e) {
    console.error('Redis smoke check failed:', e);
    throw e;
  }
}

async function main() {
  try {
    await runS3Check();
    await runRedisCheck();
    console.log('Smoke checks passed');
    process.exit(0);
  } catch (e) {
    console.error('Smoke checks failed');
    process.exit(2);
  }
}

main();
