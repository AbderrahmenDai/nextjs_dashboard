
# Backend Setup Instructions (Node.js + MySQL - NO Prisma)

The backend now uses **pure Node.js + MySQL (mysql2)**. There is no Prisma ORM.

## Prerequisites
1.  **MySQL Database**: You need a running MySQL instance.
2.  **MySQL Workbench** (Optional but recommended): To view/edit your database tables.

## Setup Steps

### 1. Configure the Backend
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a `.env` file in the `backend/` directory (if it doesn't exist).
3.  Add your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=recruitment_db
PORT=3001
```

*Note: You must create the database `recruitment_db` (or whatever you name it) in MySQL first.*
```sql
CREATE DATABASE recruitment_db;
```

### 2. Install Dependencies
Run the following command inside the `backend` directory:
```bash
npm install
```

### 3. Initialize the Database Schema
Since we are not using Prisma migrations, you must run the SQL script manually to create tables.

1.  Open **MySQL Workbench**.
2.  Connect to your database.
3.  Open the file `backend/schema.sql`.
4.  Run the script (Lightning bolt icon) to create the `Site`, `Department`, and `User` tables.

### 4. Start the Server
Start the backend server:
```bash
node server.js
```
*Or for development (auto-restart):*
```bash
npx nodemon server.js
```

The server will start on **http://localhost:3001**.
