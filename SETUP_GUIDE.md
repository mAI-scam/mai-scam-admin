# 🛡️ Mai Scam Admin Dashboard Setup Guide

This admin dashboard supports two authentication flows with different data sources.

## 🧪 Authentication Flows

### 1. Test Authentication

- **Username:** `test`
- **Password:** `1234`
- **Data Source:** Dummy data from `src/data/dummyData.ts`
- **Purpose:** Quick testing and demonstration

### 2. Google Authentication + DynamoDB

- **Method:** Google OAuth via Supabase
- **Data Source:** AWS DynamoDB tables
- **Fallback:** Dummy data if DynamoDB is not configured

## 🚀 Quick Start (Test Mode)

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000)

3. **Sign in with test credentials:**

   - Select "🧪 Test Login" tab
   - Username: `test`
   - Password: `1234`
   - Click "Auto-fill credentials" for convenience

4. **Explore the dashboard:**
   - View dummy statistics and user data
   - Navigate through different sections
   - All data comes from `src/data/dummyData.ts`

## ⚙️ Google + DynamoDB Setup

### Step 1: Create Supabase Project

1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Click "New Project"
3. Set up your project with a name and password

### Step 2: Configure Google OAuth

1. **In Supabase Dashboard:**

   - Go to **Authentication > Providers**
   - Enable **Google** provider
   - Note: You'll need Google OAuth credentials

2. **In Google Cloud Console:**

   - Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to **Credentials > Create Credentials > OAuth 2.0 Client ID**
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000` (for development)

3. **Back in Supabase:**
   - Add your Google Client ID and Secret
   - Save the configuration

### Step 3: Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# AWS DynamoDB Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key-here
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-key-here

# DynamoDB Table Names (optional - will use defaults)
NEXT_PUBLIC_DYNAMODB_USERS_TABLE=admin-users
NEXT_PUBLIC_DYNAMODB_ORDERS_TABLE=admin-orders
NEXT_PUBLIC_DYNAMODB_ANALYTICS_TABLE=admin-analytics
NEXT_PUBLIC_DYNAMODB_ACTIVITIES_TABLE=admin-activities
```

### Step 4: Set Up DynamoDB Tables

Create these tables in AWS DynamoDB:

#### Users Table (`admin-users`)

```json
{
  "TableName": "admin-users",
  "KeySchema": [
    {
      "AttributeName": "id",
      "KeyType": "HASH"
    }
  ],
  "AttributeDefinitions": [
    {
      "AttributeName": "id",
      "AttributeType": "S"
    }
  ]
}
```

**Sample User Record:**

```json
{
  "id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "status": "active",
  "joinDate": "2024-01-15"
}
```

#### Activities Table (`admin-activities`)

```json
{
  "TableName": "admin-activities",
  "KeySchema": [
    {
      "AttributeName": "id",
      "KeyType": "HASH"
    }
  ],
  "AttributeDefinitions": [
    {
      "AttributeName": "id",
      "AttributeType": "S"
    }
  ]
}
```

**Sample Activity Record:**

```json
{
  "id": "activity-123",
  "action": "User registered",
  "user": "john@example.com",
  "timestamp": "2 minutes ago",
  "type": "user"
}
```

#### Analytics Table (`admin-analytics`)

```json
{
  "TableName": "admin-analytics",
  "KeySchema": [
    {
      "AttributeName": "id",
      "KeyType": "HASH"
    }
  ],
  "AttributeDefinitions": [
    {
      "AttributeName": "id",
      "AttributeType": "S"
    }
  ]
}
```

**Sample Analytics Record:**

```json
{
  "id": "current-stats",
  "totalUsers": 2651,
  "activeUsers": 2234,
  "revenue": 45231,
  "orders": 1423,
  "conversionRate": 3.24
}
```

### Step 5: AWS IAM Permissions

Create an IAM user with DynamoDB permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:Scan", "dynamodb:Query", "dynamodb:GetItem"],
      "Resource": ["arn:aws:dynamodb:*:*:table/admin-*"]
    }
  ]
}
```

## 📊 Data Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Test Login    │    │  Google Login    │    │   Dashboard     │
│   (test/1234)   │    │  (via Supabase)  │    │   Components    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Dummy Data     │    │   AWS DynamoDB   │    │  Real-time UI   │
│ (src/data/*.ts) │    │    (Tables)      │    │   Updates       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎨 Features

### Test Mode Features:

- ✅ Instant access with test/1234
- ✅ Pre-populated dummy data
- ✅ All dashboard sections functional
- ✅ Perfect for demos and development

### Google + DynamoDB Mode Features:

- ✅ Secure Google OAuth authentication
- ✅ Real-time data from DynamoDB
- ✅ Live data indicators in UI
- ✅ Graceful fallback to dummy data
- ✅ Production-ready architecture

## 🔧 Troubleshooting

### Google Authentication Issues:

1. Check Supabase project URL and keys
2. Verify Google OAuth redirect URIs
3. Ensure Google+ API is enabled
4. Check browser console for errors

### DynamoDB Connection Issues:

1. Verify AWS credentials in `.env.local`
2. Check IAM permissions
3. Confirm table names match configuration
4. Test AWS CLI access: `aws dynamodb list-tables`

### Data Not Loading:

1. Check browser console for errors
2. Verify environment variables
3. Test with dummy data first (test login)
4. Check DynamoDB table structure

## 🛠️ Development

### Project Structure:

```
src/
├── contexts/AuthContext.tsx     # Authentication management
├── components/
│   ├── SignIn.tsx              # Login interface
│   └── Dashboard.tsx           # Main dashboard
├── data/dummyData.ts           # Test data
├── lib/
│   ├── supabase.ts            # Supabase client
│   └── dynamodb.ts            # DynamoDB client
└── app/
    ├── layout.tsx             # App layout
    └── page.tsx               # Main page
```

### Adding New Data:

1. **For test mode:** Update `src/data/dummyData.ts`
2. **For DynamoDB:** Add new tables and update `src/lib/dynamodb.ts`

### Customizing UI:

- Dashboard sections are in `src/components/Dashboard.tsx`
- Styling uses Tailwind CSS
- Icons are Unicode emojis for simplicity

## 📝 Environment Variables Reference

| Variable                            | Required        | Description            |
| ----------------------------------- | --------------- | ---------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`          | For Google auth | Supabase project URL   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | For Google auth | Supabase anonymous key |
| `NEXT_PUBLIC_AWS_REGION`            | For DynamoDB    | AWS region             |
| `NEXT_PUBLIC_AWS_ACCESS_KEY_ID`     | For DynamoDB    | AWS access key         |
| `NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY` | For DynamoDB    | AWS secret key         |
| `NEXT_PUBLIC_DYNAMODB_*_TABLE`      | Optional        | Custom table names     |

## 🎯 Next Steps

1. **Start with test mode** to explore the interface
2. **Set up Google authentication** for real user management
3. **Configure DynamoDB** for live data integration
4. **Customize the dashboard** for your specific needs
5. **Deploy to production** with proper environment variables

Need help? Check the browser console for detailed error messages and ensure all environment variables are properly configured.
