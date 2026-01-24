try {
    const service = require('./services/interviewService');
    console.log('Service loaded:', service);
    if (!service.getAllInterviews) console.error('getAllInterviews MISSING');
} catch (e) {
    console.error('Failed to require service:', e);
}
