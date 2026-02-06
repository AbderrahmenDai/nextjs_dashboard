const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const emailService = require('./emailService');

const getAllCandidatures = async () => {
    const [rows] = await db.query('SELECT * FROM Candidature ORDER BY createdAt DESC');
    return rows;
};

const createCandidature = async (data) => {
    const id = uuidv4();
    const sql = `
        INSERT INTO Candidature (
            id, firstName, lastName, email, phone, birthDate, gender, address,
            positionAppliedFor, department, specialty, level, yearsOfExperience, language,
            source, hiringRequestId, recruiterComments,
            educationLevel, familySituation, studySpecialty, currentSalary, salaryExpectation,
            proposedSalary, noticePeriod, hrOpinion, managerOpinion, recruitmentMode, workSite, cvPath
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Ensure dates/numbers are handled correctly
    const values = [
        id, data.firstName, data.lastName, data.email, data.phone, data.birthDate ? new Date(data.birthDate) : null, data.gender, data.address,
        data.positionAppliedFor, data.department, data.specialty, data.level, data.yearsOfExperience || 0, data.language,
        data.source, data.hiringRequestId || null, data.recruiterComments,
        data.educationLevel, data.familySituation, data.studySpecialty, data.currentSalary || 0, data.salaryExpectation || 0,
        data.proposedSalary || 0, data.noticePeriod, data.hrOpinion, data.managerOpinion, data.recruitmentMode, data.workSite,
        data.cvPath || null
    ];

    await db.query(sql, values);
    
    const [newItem] = await db.query('SELECT * FROM Candidature WHERE id = ?', [id]);
    return newItem[0];
};

const updateCandidature = async (id, data) => {
    const fields = [];
    const values = [];
    
    // Whitelist columns to prevent SQL injection or invalid updates
    const updateableColumns = [
        'firstName', 'lastName', 'email', 'phone', 'birthDate', 'gender', 'address',
        'positionAppliedFor', 'department', 'specialty', 'level', 'yearsOfExperience', 'language',
        'source', 'hiringRequestId', 'recruiterComments',
        'educationLevel', 'familySituation', 'studySpecialty', 'currentSalary', 'salaryExpectation',
        'proposedSalary', 'noticePeriod', 'hrOpinion', 'managerOpinion', 'recruitmentMode', 'workSite',
        'status', 'cvPath'
    ];

    for (const key of Object.keys(data)) {
        if (updateableColumns.includes(key)) {
            fields.push(`${key} = ?`);
            if ((key === 'birthDate') && data[key]) {
                values.push(new Date(data[key]));
            } else {
                values.push(data[key]);
            }
        }
    }

    console.log(`Updating Candidature ${id} with data:`, data);
    console.log(`Fields to update:`, fields);

    if (fields.length === 0) {
        // Just return existing
        const [existing] = await db.query('SELECT * FROM Candidature WHERE id = ?', [id]);
        return existing[0];
    }

    values.push(id);
    const sql = `UPDATE Candidature SET ${fields.join(', ')} WHERE id = ?`;
    
    await db.query(sql, values);
    
    const [updated] = await db.query('SELECT * FROM Candidature WHERE id = ?', [id]);
    const updatedCandidate = updated[0];

    // Check if status changed to Rejected
    if ((data.status === 'Refus du candidat' || data.status === 'Rejected') && updatedCandidate.email) {
        const candidateName = `${updatedCandidate.firstName} ${updatedCandidate.lastName}`;
        await emailService.sendRejectionEmail(updatedCandidate.email, candidateName, updatedCandidate.positionAppliedFor || 'Poste');
    }

    return updatedCandidate;
};

const deleteCandidature = async (id) => {
    await db.query('DELETE FROM Candidature WHERE id = ?', [id]);
    return { message: 'Deleted' };
};

module.exports = {
    getAllCandidatures,
    createCandidature,
    updateCandidature,
    deleteCandidature
};
