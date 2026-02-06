const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const emailService = require('./emailService');

const getAllInterviews = async () => {
    // Join with User (Interviewer), Role, and Candidature (Candidate)
    const sql = `
        SELECT i.*, 
               u.name as interviewerName, 
               r.name as interviewerRole,
               c.firstName as candidateFirstName,
               c.lastName as candidateLastName,
               c.positionAppliedFor as appliedPosition
        FROM Interview i
        LEFT JOIN User u ON i.interviewerId = u.id
        LEFT JOIN Role r ON u.roleId = r.id
        LEFT JOIN Candidature c ON i.candidatureId = c.id
        ORDER BY i.date ASC
    `;
    const [rows] = await db.query(sql);
    return rows;
};

const getInterviewsByCandidature = async (candidatureId) => {
    const sql = `
        SELECT i.*, u.name as interviewerName, r.name as interviewerRole
        FROM Interview i
        LEFT JOIN User u ON i.interviewerId = u.id
        LEFT JOIN Role r ON u.roleId = r.id
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

    // Fetch Interviewer Email and Name FIRST to include in Candidate Email
    let interviewerName = "Un membre de l'équipe RH"; // Default if not found
    
    if (data.interviewerId) {
        const [interviewers] = await db.query('SELECT name, email FROM User WHERE id = ?', [data.interviewerId]);
        if (interviewers.length > 0) {
            const interviewer = interviewers[0];
            interviewerName = interviewer.name;
            
            // We will send the interviewer email later, but we have the data now.
            // Let's store it to use after candidate email.
            data.interviewerData = interviewer; 
        }
    }

    // Fetch Candidate Email and Name
    const [candidates] = await db.query('SELECT firstName, lastName, email FROM Candidature WHERE id = ?', [data.candidatureId]);
    let candidateName = "Candidate";

    if (candidates.length > 0) {
        const candidate = candidates[0];
        candidateName = `${candidate.firstName} ${candidate.lastName}`;
        if (candidate.email) {
            await emailService.sendInterviewEmail(
                candidate.email, 
                candidateName, 
                interviewerName, // Pass Interviewer Name
                data.date, 
                data.mode || 'Face-to-Face', 
                data.type || 'RH', 
                data.notes
            );
        } else {
            console.warn(`Candidate ${candidateName} (ID: ${data.candidatureId}) has no email. Interview email not sent.`);
        }
    } else {
        console.warn(`Candidature ID ${data.candidatureId} not found when sending email.`);
    }

    // Send Email to Interviewer (if exists)
    if (data.interviewerData && data.interviewerData.email) {
        await emailService.sendInterviewerEmail(
            data.interviewerData.email,
            data.interviewerData.name,
            candidateName,
            data.date,
            data.mode || 'Face-to-Face',
            data.type || 'RH',
            data.notes
        );
    } else if (data.interviewerData) {
        console.warn(`Interviewer ${data.interviewerData.name} (ID: ${data.interviewerId}) has no email. Email not sent.`);
    }

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
               r.name as interviewerRole,
               c.firstName as candidateFirstName,
               c.lastName as candidateLastName,
               c.positionAppliedFor as appliedPosition
        FROM Interview i
        LEFT JOIN User u ON i.interviewerId = u.id
        LEFT JOIN Role r ON u.roleId = r.id
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
