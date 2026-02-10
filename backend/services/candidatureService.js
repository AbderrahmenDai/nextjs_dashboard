const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const emailService = require('./emailService');

const getAllCandidatures = async ({ page, limit, department, search, status } = {}) => {
    let sql = `
        SELECT c.*, h.title as hiringRequestTitle 
        FROM Candidature c
        LEFT JOIN HiringRequest h ON c.hiringRequestId = h.id
    `;
    const params = [];
    const conditions = [];

    if (department) {
        conditions.push("c.department = ?");
        params.push(department);
    }

    if (status) {
        conditions.push("c.status = ?");
        params.push(status);
    }

    if (search) {
        conditions.push("(c.firstName LIKE ? OR c.lastName LIKE ? OR c.email LIKE ? OR c.positionAppliedFor LIKE ?)");
        const term = `%${search}%`;
        params.push(term, term, term, term);
    }

    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY c.createdAt DESC";

    if (page && limit) {
        const countSql = `SELECT COUNT(*) as total FROM Candidature c ${conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : ""}`;
        const [countParam] = await db.query(countSql, params); // Use same params as filter
        const total = countParam[0].total;

        sql += " LIMIT ? OFFSET ?";
        params.push(Number(limit), (Number(page) - 1) * Number(limit));

        const [rows] = await db.query(sql, params);
        
        return {
            data: rows,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        };
    }

    const [rows] = await db.query(sql, params);
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

    // Fetch current state to compare changes
    const [currentRows] = await db.query('SELECT * FROM Candidature WHERE id = ?', [id]);
    if (currentRows.length === 0) return null;
    const currentCandidate = currentRows[0];

    // Auto-update status logic based on workflow progression
    // 1. Recruiter Validation
    if (data.recruiterComments && data.recruiterComments !== currentCandidate.recruiterComments) {
        if (['Favorable', 'Prioritaire'].includes(data.recruiterComments)) {
            data.status = 'Validation RH';
        } else if (data.recruiterComments === 'Defavorable') {
            data.status = 'Refus du candidat';
        }
    }

    // 2. RH Validation
    if (data.hrOpinion && data.hrOpinion !== currentCandidate.hrOpinion) {
        if (['Favorable', 'Prioritaire'].includes(data.hrOpinion)) {
             data.status = 'Avis Manager';
        } else if (data.hrOpinion === 'Defavorable') {
             data.status = 'Refus du candidat';
        }
    }

    // 3. Manager Opinion
    if (data.managerOpinion && data.managerOpinion !== currentCandidate.managerOpinion) {
        if (['Favorable', 'Prioritaire'].includes(data.managerOpinion)) {
             data.status = 'Embauché';
        } else if (data.managerOpinion === 'Defavorable') {
             data.status = 'Refus du candidat';
        }
    }

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
