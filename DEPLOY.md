# Deployment Guide for Recruitment Dashboard

This application uses a **Split Architecture**:
1.  **Frontend**: Next.js (supports Vercel natively).
2.  **Backend**: Node.js/Express Server (requires a persistent server).
3.  **Database**: MySQL (requires a database host).

Because Vercel is optimized for Serverless/Frontend, and your backend is a long-running Node process with a local MySQL database, you cannot simply "deploy everything" to Vercel in one click without some setup.

## 🚀 Recommended Deployment Strategy

### Phase 1: Database (Cloud MySQL)
You need a MySQL database accessible from the internet.
1.  **Create a database** on a provider like [Railway](https://railway.app/), [PlanetScale](https://planetscale.com/), or [Clever Cloud](https://www.clever-cloud.com/).
2.  **Get the connection string** (e.g., `mysql://user:pass@host:port/db`).
3.  **Update your schema:**
    *   In your `backend` folder locally, update `.env` with the new cloud `DATABASE_URL`.
    *   Run `npx prisma db push` to create the tables on the cloud DB.
    *   (Optional) Run your seed scripts (`node seed-complete-data.js`) to populate it.

### Phase 2: Backend (Railway / Render)
Deploy the `backend` folder to a service that supports persistent Node.js apps. **Railway** is easiest for this stack.
1.  Push your code to GitHub.
2.  On Railway, create a new project from your GitHub repo.
3.  **Root Directory:** Set to `backend`.
4.  **Environment Variables:** Add:
    *   `DATABASE_URL`: (Your cloud DB string from Phase 1)
    *   `PORT`: `5000` (or let Railway assign one)
    *   `CORS_ORIGIN`: `https://your-vercel-app-name.vercel.app` (You'll update this after deploying frontend)
5.  Deploy. You will get a Backend URL (e.g., `https://my-backend-production.up.railway.app`).

### Phase 3: Frontend (Vercel)
Now deploy the Next.js frontend to Vercel.
1.  Go to [Vercel](https://vercel.com/) and "Add New Project".
2.  Import your GitHub repository.
3.  **Framework Preset:** Next.js.
4.  **Root Directory:** `.` (default).
5.  **Environment Variables:**
    *   `NEXT_PUBLIC_API_URL`: The Backend URL from Phase 2 (e.g., `https://my-backend-production.up.railway.app/api`).
        *   *Note: Ensure you add `/api` at the end if your backend expects it.*
6.  Deploy!

---

## 🛠 Option 2: Everything on Vercel (Advanced / Refactor Required)
If you MUST use *only* Vercel, you have to refactor the entire `backend/` folder into Next.js API Routes (`src/app/api/...`).
1.  Move logic from `backend/controllers` to `src/app/api/[route]/route.ts`.
2.  This is a significant amount of work given the size of your backend.
3.  You **STILL** need a Cloud Database (Phase 1 above), as Vercel does not host databases.

## ✅ Checklist Before Deployment
- [ ] Codes are pushed to GitHub.
- [ ] Cloud Database created and `DATABASE_URL` obtained.
- [ ] `prisma.schema` pushed to cloud DB.
- [ ] `NEXT_PUBLIC_API_URL` environment variable set in Vercel.
