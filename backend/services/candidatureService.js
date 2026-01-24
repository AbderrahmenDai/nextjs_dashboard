const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

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
            proposedSalary, noticePeriod, hrOpinion, managerOpinion, recruitmentMode, workSite
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Ensure dates/numbers are handled correctly
    const values = [
        id, data.firstName, data.lastName, data.email, data.phone, data.birthDate ? new Date(data.birthDate) : null, data.gender, data.address,
        data.positionAppliedFor, data.department, data.specialty, data.level, data.yearsOfExperience || 0, data.language,
        data.source, data.hiringRequestId || null, data.recruiterComments,
        data.educationLevel, data.familySituation, data.studySpecialty, data.currentSalary || 0, data.salaryExpectation || 0,
        data.proposedSalary || 0, data.noticePeriod, data.hrOpinion, data.managerOpinion, data.recruitmentMode, data.workSite
    ];

    await db.query(sql, values);
    
    const [newItem] = await db.query('SELECT * FROM Candidature WHERE id = ?', [id]);
    return newItem[0];
};

const updateCandidature = async (id, data) => {
    // Basic dynamic update helper could be better, but explicit for now or simple
    // Providing a full update for simplicity in this turn
    await db.query(`
        UPDATE Candidature SET 
        firstName=?, lastName=?, email=?, phone=?, address=?, 
        positionAppliedFor=?, department=?, specialty=?, level=?, status=?,
        recruiterComments=?, hrOpinion=?, managerOpinion=?, proposedSalary=?
        WHERE id=?
    `, [
        data.firstName, data.lastName, data.email, data.phone, data.address,
        data.positionAppliedFor, data.department, data.specialty, data.level, data.status,
        data.recruiterComments, data.hrOpinion, data.managerOpinion, data.proposedSalary,
        id
    ]);
    
    const [updated] = await db.query('SELECT * FROM Candidature WHERE id = ?', [id]);
    return updated[0];
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
