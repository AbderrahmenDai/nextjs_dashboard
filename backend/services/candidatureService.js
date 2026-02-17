const { Candidature, HiringRequest } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const emailService = require('./emailService');

const getAllCandidatures = async ({ page, limit, department, search, status } = {}) => {
    const where = {};
    const include = [{
        model: HiringRequest,
        attributes: ['title'],
        as: 'hiringRequest' // Ensure model association has this alias or default
    }];

    if (department) {
        where.department = department; // Field in Candidature is 'department' name
    }

    if (status) {
        where.status = status;
    }

    if (search) {
        where[Op.or] = [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { positionAppliedFor: { [Op.like]: `%${search}%` } }
        ];
    }

    const order = [['createdAt', 'DESC']];

    if (page && limit) {
        const offset = (Number(page) - 1) * Number(limit);
        const { count, rows } = await Candidature.findAndCountAll({
            where,
            include, // To return hiringRequestTitle
            limit: Number(limit),
            offset: Number(offset),
            order
        });

        const data = rows.map(r => {
            const plain = r.get({ plain: true });
            return {
                ...plain,
                hiringRequestTitle: plain.hiringRequest ? plain.hiringRequest.title : null
            };
        });

        return {
            data,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / Number(limit))
            }
        };
    } else {
        const rows = await Candidature.findAll({
            where,
            include,
            order
        });
        return rows.map(r => {
             const plain = r.get({ plain: true });
             return {
                 ...plain,
                 hiringRequestTitle: plain.hiringRequest ? plain.hiringRequest.title : null
             };
         });
    }
};

const createCandidature = async (data) => {
    // Sanitize and Prepare Data
    const candidatureData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        gender: data.gender,
        address: data.address,
        positionAppliedFor: data.positionAppliedFor,
        department: data.department,
        specialty: data.specialty,
        level: data.level,
        yearsOfExperience: data.yearsOfExperience || 0,
        language: data.language,
        source: data.source,
        hiringRequestId: data.hiringRequestId || null,
        recruiterComments: data.recruiterComments,
        educationLevel: data.educationLevel,
        familySituation: data.familySituation,
        studySpecialty: data.studySpecialty,
        currentSalary: data.currentSalary || 0,
        salaryExpectation: data.salaryExpectation || 0,
        proposedSalary: data.proposedSalary || 0,
        noticePeriod: data.noticePeriod,
        hrOpinion: data.hrOpinion,
        managerOpinion: data.managerOpinion,
        recruitmentMode: data.recruitmentMode,
        workSite: data.workSite,
        cvPath: data.cvPath
    };

    const newCandidature = await Candidature.create(candidatureData);
    return newCandidature;
};

const updateCandidature = async (id, data) => {
    const candidature = await Candidature.findByPk(id);
    if (!candidature) return null;

    // Status Update Logic
    let newStatus = data.status || candidature.status;

    // 1. Recruiter Validation
    if (data.recruiterComments && data.recruiterComments !== candidature.recruiterComments) {
        if (['Favorable', 'Prioritaire'].includes(data.recruiterComments)) {
            newStatus = 'Validation RH';
        } else if (data.recruiterComments === 'Defavorable') {
            newStatus = 'Refus du candidat';
        }
    }

    // 2. RH Validation
    if (data.hrOpinion && data.hrOpinion !== candidature.hrOpinion) {
        if (['Favorable', 'Prioritaire'].includes(data.hrOpinion)) {
             newStatus = 'Avis Manager';
        } else if (data.hrOpinion === 'Defavorable') {
             newStatus = 'Refus du candidat';
        }
    }

    // 3. Manager Opinion
    if (data.managerOpinion && data.managerOpinion !== candidature.managerOpinion) {
        if (['Favorable', 'Prioritaire'].includes(data.managerOpinion)) {
             newStatus = 'Embauché';
        } else if (data.managerOpinion === 'Defavorable') {
             newStatus = 'Refus du candidat';
        }
    }

    data.status = newStatus;

    // Filter updates to allowed columns (Simpler to just spread distinct values in Sequelize, it ignores others if not in model, but safer to be explicit)
    // We'll trust the model definition to strip extra fields usually, but explicitly mapping is safer.
    // For brevity in migration, passing data (assuming controller filtered) + status.
    
    // Explicitly handle date conversion
    if (data.birthDate) data.birthDate = new Date(data.birthDate);

    await Candidature.update(data, { where: { id } });

    const updatedCandidature = await Candidature.findByPk(id);

    // Rejection Email Logic
    if ((updatedCandidature.status === 'Refus du candidat' || updatedCandidature.status === 'Rejected') && updatedCandidature.email) {
        try {
            const candidateName = `${updatedCandidature.firstName} ${updatedCandidature.lastName}`;
            await emailService.sendRejectionEmail(updatedCandidature.email, candidateName, updatedCandidature.positionAppliedFor || 'Poste');
        } catch (error) {
            console.error('Failed to send rejection email:', error);
        }
    }

    return updatedCandidature;
};

const deleteCandidature = async (id) => {
    await Candidature.destroy({ where: { id } });
    return { message: 'Deleted' };
};

module.exports = {
    getAllCandidatures,
    createCandidature,
    updateCandidature,
    deleteCandidature
};
