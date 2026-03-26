# File Upload Guide

This guide explains how to add file upload capabilities.

## Recommended Approaches

### Supabase Storage (Simplest)

Already integrated via your Supabase project.

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Upload
const { data, error } = await supabase.storage.from('uploads').upload(`public/${file.name}`, file);

// Get public URL
const {
  data: { publicUrl },
} = supabase.storage.from('uploads').getPublicUrl(`public/${file.name}`);
```

### AWS S3

For larger-scale applications:

```bash
# Backend
cd apps/backend && uv add boto3

# Frontend
pnpm --filter web add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Use presigned URLs for secure direct uploads from the browser.

## Further Reading

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)
