# Deployment guide for Vercel and Firebase

This guide covers deploying SnapFrame to Vercel and connecting cloud services like Firebase and Paddle.

## 1. Deploying to Vercel

SnapFrame is configured for standard Next.js deployment on Vercel.

### Step 1: Import repository
1. Sign in to [Vercel](https://vercel.com).
2. Click "Add New..." and select "Project".
3. Choose your GitHub repository (`snapframe.store`).
4. The framework preset will automatically detect Next.js.

### Step 2: Configure environment variables
Add the following configuration in the Vercel project settings:

```env
# AI providers (Gemini and Groq offer free tiers)
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
XAI_API_KEY=your_xai_grok_key_here          # Optional
OPENAI_API_KEY=your_openai_api_key_here     # Optional

# Firebase client configuration (browser SDK)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-...

# Firebase Admin service account (token verification and cloud sync)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-app-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Paddle billing configuration
NEXT_PUBLIC_PADDLE_ENV=sandbox               # "sandbox" or "production"
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_...
NEXT_PUBLIC_PADDLE_PRICE_MONTHLY=pri_...
NEXT_PUBLIC_PADDLE_PRICE_ANNUAL=pri_...
PADDLE_WEBHOOK_SECRET_KEY=ntfset_...
```

For `FIREBASE_PRIVATE_KEY`, you can paste the multi-line private key directly into the environment variable field.

### Step 3: Deploy
Click "Deploy". Vercel will build and launch your deployment.

## 2. Setting up AI API keys

### Google Gemini (Text and vision)
1. Open [Google AI Studio](https://aistudio.google.com/).
2. Create an API key and set it as `GEMINI_API_KEY`.
3. The free tier supports multimodal screenshot analysis, text generation, and translations.

### Groq Cloud (Text and vision)
1. Open [Groq Console](https://console.groq.com/).
2. Create an API key and set it as `GROQ_API_KEY`.
3. Powers fast text generation and fallback vision analysis.

### Mistral AI (Localization and vision)
1. Open [Mistral Console](https://console.mistral.ai/).
2. Create an API key and set it as `MISTRAL_API_KEY`.

### xAI Grok (Optional)
1. Open [xAI Console](https://console.x.ai/).
2. Add your API key as `XAI_API_KEY`.

## 3. Local production build verification

Before pushing updates, test the production build locally:

```bash
# Type checking
npx tsc --noEmit

# Production build
npm run build

# Start production server
npm run start
```
