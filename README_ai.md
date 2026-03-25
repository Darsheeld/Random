# AI Help Setup & Troubleshooting

## Local Testing (Limited)
Static servers (npx serve, open file://) can't run `/api/chat` (serverless). Expect CORS/preflight/500.

**Better local:**
```
npx vercel dev
```
Opens preview with full backend.

## Deploy to Vercel (Recommended)
1. `npm i -g vercel` or use VSCode Vercel extension.
2. `vercel` (login, deploy).
3. In Vercel dashboard > Project > Settings > Environment Variables:
   - Name: `GROQ_API_KEY`
   - Value: Get free at https://console.groq.com/keys
4. Redeploy. Test preview URL e.g. https://your-project-xxx.vercel.app/AIHelp.html

## Common Errors Fixed
- **CORS/Preflight/405**: Use Vercel preview/deploy URL.
- **500 API Key missing**: Add GROQ_API_KEY in Vercel env vars.
- **Empty response**: Check Vercel function logs (Dashboard > Functions).

AI tutor: Electronics-focused Llama3 via Groq (fast/free tier).

Enjoy your circuit assistant!
