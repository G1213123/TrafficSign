# Supabase setup for Road Sign Factory

## 1. Create Project
1. Go to https://supabase.com
2. Click "New Project"
3. Choose organization and region
4. Set database password
5. Wait for project creation (2-3 minutes)

## 2. Database Setup
1. Go to SQL Editor in dashboard
2. Run the schema from `supabase-schema.sql`
3. Enable Row Level Security (RLS)
4. Set up storage bucket for files

## 3. Environment Variables
Add to your project:

```bash
# .env file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# For local development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. Authentication Setup
1. Go to Authentication > Settings
2. Enable email confirmation (optional)
3. Configure email templates
4. Set up social providers (optional)

## 5. Storage Setup
1. Go to Storage
2. Create bucket: `project-files`
3. Set public access policy for thumbnails
4. Configure file size limits (50MB recommended)

## 6. API Integration
Replace your ProjectManager with SupabaseProjectManager:

```javascript
// In your main.js
import { SupabaseProjectManager } from './api/supabaseManager.js';

// Initialize
const projectManager = new SupabaseProjectManager();
window.ProjectManager = projectManager;
```

## 7. Deploy Configuration
Update your app.yaml to include environment variables:

```yaml
env_variables:
  VITE_SUPABASE_URL: "https://your-project.supabase.co"
  VITE_SUPABASE_ANON_KEY: "your-anon-key"
```

## 8. Cost Management
- Free tier: 500MB database, 1GB storage
- Pro tier: $25/month for 8GB database, 100GB storage
- Scale as needed

## Benefits over Cloud SQL:
✅ No server management
✅ Automatic API generation
✅ Built-in authentication
✅ Real-time subscriptions
✅ File storage included
✅ Generous free tier
✅ Easy local development
