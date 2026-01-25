const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getAllInterviews = async () => {
    // Join with User (Interviewer) and Candidature (Candidate)
    const sql = `
        SELECT i.*, 
               u.name as interviewerName, 
               u.role as interviewerRole,
               c.firstName as candidateFirstName,
               c.lastName as candidateLastName,
               c.positionAppliedFor as appliedPosition
        FROM Interview i
        LEFT JOIN User u ON i.interviewerId = u.id
        LEFT JOIN Candidature c ON i.candidatureId = c.id
        ORDER BY i.date ASC
    `;
    const [rows] = await db.query(sql);
    return rows;
};

const getInterviewsByCandidature = async (candidatureId) => {
    const sql = `
        SELECT i.*, u.name as interviewerName, u.role as interviewerRole
        FROM Interview i
        LEFT JOIN User u ON i.interviewerId = u.id
        WHERE i.candidatureId = ?
        ORDER BY i.date ASC
    `;
    const [rows] = await db.query(sql, [candidatureId]);
    return rows;
};

const createInterview = async (data) => {
    const id = uuidv4();
    await db.query(
        `INSERT INTO Interview (id, candidatureId, interviewerId, date, mode, type, status, result, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id, 
            data.candidatureId, 
            data.interviewerId, 
            new Date(data.date), 
            data.mode || 'Face-to-Face', 
            data.type || 'RH',
            'Scheduled',
            'Pending',
            data.notes
        ]
    );
    
    // Auto-update candidature status if it's 'New'
    await db.query(`UPDATE Candidature SET status = 'In Progress' WHERE id = ? AND status = 'New'`, [data.candidatureId]);

    return getInterviewById(id);
};

const updateInterview = async (id, data) => {
    const fields = [];
    const values = [];

    if (data.date) { fields.push('date = ?'); values.push(new Date(data.date)); }
    if (data.mode) { fields.push('mode = ?'); values.push(data.mode); }
    if (data.type) { fields.push('type = ?'); values.push(data.type); }
    if (data.status) { fields.push('status = ?'); values.push(data.status); }
    if (data.result) { fields.push('result = ?'); values.push(data.result); }
    if (data.notes) { fields.push('notes = ?'); values.push(data.notes); }
    if (data.interviewerId) { fields.push('interviewerId = ?'); values.push(data.interviewerId); }

    if (fields.length === 0) return getInterviewById(id);

    values.push(id);
    await db.query(`UPDATE Interview SET ${fields.join(', ')} WHERE id = ?`, values);

    return getInterviewById(id);
};

const deleteInterview = async (id) => {
    await db.query('DELETE FROM Interview WHERE id = ?', [id]);
    return { id };
};

const getInterviewById = async (id) => {
    const sql = `
        SELECT i.*, 
               u.name as interviewerName, 
               u.role as interviewerRole,
               c.firstName as candidateFirstName,
               c.lastName as candidateLastName,
               c.positionAppliedFor as appliedPosition
        FROM Interview i
        LEFT JOIN User u ON i.interviewerId = u.id
        LEFT JOIN Candidature c ON i.candidatureId = c.id
        WHERE i.id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
}

module.exports = {
    getAllInterviews,
    getInterviewsByCandidature,
    createInterview,
    updateInterview,
    deleteInterview
};
