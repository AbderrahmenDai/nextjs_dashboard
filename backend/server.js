const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/errorMiddleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/sites', require('./routes/siteRoutes'));
app.use('/api/candidatures', require('./routes/candidatureRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/hiring-requests', require('./routes/hiringRequestRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Error Handler
app.use(errorHandler);

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
