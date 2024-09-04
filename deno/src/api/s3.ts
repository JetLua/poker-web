// deno-lint-ignore-file no-namespace
import {
  S3Client, ListBucketsCommand, CreateMultipartUploadCommand,
  UploadPartCommand, CompleteMultipartUploadCommand, PutObjectCommand,
  type CreateMultipartUploadRequest,
  type CompletedPart,
} from 's3'
import {getSignedUrl} from 'presigner'
import {env} from '~/core/mod.ts'

const s3 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ID,
    secretAccessKey: env.R2_KEY,
  }
})

export function list() {
  return s3.send(new ListBucketsCommand())
}

export namespace uploader {
  /**
   * @param r
   */
  export async function multipart(opts: {
    num: number
    acl: CreateMultipartUploadRequest['ACL']}) {
    // deno-lint-ignore prefer-const
    let r

    const key = crypto.randomUUID()

    r = await s3.send(new CreateMultipartUploadCommand({
      ACL: opts.acl,
      Key: key,
      Bucket: env.R2_BUCKET,
    }))

    const uploadId = r.UploadId

    return {
      key,
      uploadId,
      urls: await Promise.all(Array.from({length: opts.num}, (_, i) => {
        return getSignedUrl(s3, new UploadPartCommand({
          Bucket: env.R2_BUCKET,
          Key: key,
          UploadId: uploadId,
          PartNumber: i + 1
        }), {expiresIn: 36e2})
      }))
    }
  }

  /** 检测文件hash值 */
  export function same(s: string) {

  }

  export function complete(opts: {
    key: string
    parts: CompletedPart[]
    uploadId: string}) {
    return s3.send(new CompleteMultipartUploadCommand({
      Bucket: env.R2_BUCKET,
      Key: opts.key,
      UploadId: opts.uploadId,
      MultipartUpload: {Parts: opts.parts}
    }))
  }

  export async function put() {
    const key = crypto.randomUUID()
    return {
      key,
      url: await getSignedUrl(s3, new PutObjectCommand({
        Bucket: env.R2_BUCKET,
        Key: key
      }))
    }
  }
}
