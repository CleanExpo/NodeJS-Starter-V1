---
name: supabase
version: 1.0.0
description: Supabase patterns and best practices
author: Your Team
priority: 3
triggers:
  - supabase
  - database
  - auth
---

# Supabase Patterns

## Client Setup

### Browser Client
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Server Client
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

## Authentication

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    emailRedirectTo: `${origin}/auth/callback`,
  },
});
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### Get User
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### Sign Out
```typescript
await supabase.auth.signOut();
```

## Database Queries

### Select
```typescript
// Simple select
const { data, error } = await supabase
  .from('users')
  .select('*');

// With filter
const { data, error } = await supabase
  .from('users')
  .select('id, name, email')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(10);

// With relations
const { data, error } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    author:users(name, email)
  `);
```

### Insert
```typescript
const { data, error } = await supabase
  .from('posts')
  .insert({
    title: 'New Post',
    content: 'Content here',
    user_id: user.id,
  })
  .select()
  .single();
```

### Update
```typescript
const { data, error } = await supabase
  .from('posts')
  .update({ title: 'Updated Title' })
  .eq('id', postId)
  .select()
  .single();
```

### Delete
```typescript
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId);
```

## Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users can read all posts
CREATE POLICY "Anyone can read posts"
ON posts FOR SELECT
USING (true);

-- Users can only insert their own posts
CREATE POLICY "Users can insert own posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own posts
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own posts
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
USING (auth.uid() = user_id);
```

## Realtime

```typescript
// Subscribe to changes
const channel = supabase
  .channel('posts')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'posts' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Unsubscribe
supabase.removeChannel(channel);
```

## Storage

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.png`);

// Download file
const { data, error } = await supabase.storage
  .from('avatars')
  .download(`${userId}/avatar.png`);
```

## Verification

- [ ] Queries return expected data
- [ ] RLS policies work correctly
- [ ] Auth flow functions properly
- [ ] Error handling implemented
- [ ] No SQL injection vulnerabilities
