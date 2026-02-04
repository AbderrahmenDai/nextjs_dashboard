const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function seedTimeToFillData() {
  console.log('🌱 Début du seed des données Time to Fill (SQL Mode)...\n');

  try {
    // 1. Récupérer les départements
    const [departments] = await db.query('SELECT id, name FROM Department');
    const [sites] = await db.query('SELECT id FROM Site LIMIT 1');
    const siteId = sites[0]?.id;

    if (departments.length === 0 || !siteId) {
      console.log('❌ Aucun département ou site trouvé.');
      return;
    }

    console.log(`✅ Trouvé ${departments.length} départements\n`);

    // 2. Récupérer un utilisateur RH
    const [roles] = await db.query("SELECT id FROM Role WHERE name IN ('HR_MANAGER', 'RESPONSABLE_RH', 'ADMIN') LIMIT 1");
    let rhUserId = null;

    if (roles.length > 0) {
      const [users] = await db.query('SELECT id FROM User WHERE roleId = ? LIMIT 1', [roles[0].id]);
      if (users.length > 0) rhUserId = users[0].id;
    }

    // Créer un user par défaut si nécessaire
    if (!rhUserId) {
        // Fallback: create RH user logic here or just use a dummy ID if allowing DB constraints to pass (rarely a good idea)
        // For simplicity, let's look for ANY user
        const [anyUser] = await db.query('SELECT id FROM User LIMIT 1');
        rhUserId = anyUser[0]?.id; 
    }

    if (!rhUserId) {
        console.log('❌ Aucun utilisateur trouvé pour le seed.');
        return;
    }

    // 3. Données à insérer
    const hiringRequestsData = [
       // IT
      { dept: 'IT', position: 'Développeur Full Stack', daysToFill: 18, month: 0 },
      { dept: 'IT', position: 'DevOps Engineer', daysToFill: 22, month: 1 },
      { dept: 'IT', position: 'Data Scientist', daysToFill: 28, month: 2 },
      { dept: 'IT', position: 'Frontend Developer', daysToFill: 15, month: 3 },
      { dept: 'IT', position: 'Backend Developer', daysToFill: 25, month: 4 },
      
      // RH
      { dept: 'RH', position: 'Chargé de Recrutement', daysToFill: 30, month: 0 },
      { dept: 'RH', position: 'Gestionnaire Paie', daysToFill: 35, month: 1 },
      
      // Finance
      { dept: 'Finance', position: 'Contrôleur de Gestion', daysToFill: 42, month: 1 },
      { dept: 'Finance', position: 'Comptable Senior', daysToFill: 45, month: 2 },
      
      // Commercial
      { dept: 'Commercial', position: 'Commercial B2B', daysToFill: 25, month: 0 },
      { dept: 'Commercial', position: 'Business Developer', daysToFill: 32, month: 2 },
      
      // Marketing
      { dept: 'Marketing', position: 'Chef de Produit', daysToFill: 35, month: 1 },
      { dept: 'Marketing', position: 'Community Manager', daysToFill: 28, month: 2 },
    ];

    let createdCount = 0;
    const currentYear = new Date().getFullYear();

    for (const reqData of hiringRequestsData) {
      // Trouver département (match partiel insensible à la casse)
      const department = departments.find(d => d.name.toLowerCase().includes(reqData.dept.toLowerCase())) || departments[0];

      // Dates
      const approvalDate = new Date(currentYear, reqData.month, 5);
      const hireDate = new Date(approvalDate);
      hireDate.setDate(hireDate.getDate() + reqData.daysToFill); // Ajout du délai

      const hiringRequestId = uuidv4();

      try {
        // Insérer HiringRequest
        await db.query(`
            INSERT INTO HiringRequest (
                id, title, departmentId, requesterId, status, 
                priority, budget, contractType, category, reason, description, 
                approvedAt, approvedById, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            hiringRequestId,
            reqData.position,
            department.id,
            rhUserId,
            'Approved', // Status
            'High',
            50000,
            Math.random() > 0.3 ? 'CDI' : 'CDD',
            'Cadre',
            'Renforcement',
            'Nouveau poste',
            approvalDate,
            rhUserId,
            new Date(approvalDate.getTime() - 7 * 86400000), // Created 7 days before approval
            approvalDate
        ]);

        // Insérer Candidature
        const candidatureId = uuidv4();
        const firstName = `Candidat${createdCount}`;
        const lastName = `Test${createdCount}`;
        
        await db.query(`
            INSERT INTO Candidature (
                id, firstName, lastName, email, gender, 
                positionAppliedFor, department,
                source, status, hrOpinion, managerOpinion, 
                recruitmentMode, hireDate, hiringRequestId, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            candidatureId,
            firstName,
            lastName,
            `${firstName}.${lastName}@example.com`,
            'MALE',
            reqData.position,
            department.name, // department string
            'LINKEDIN',
            'HIRED',
            'Favorable',
            'Favorable',
            'EXTERNAL',
            hireDate,
            hiringRequestId,
            new Date(approvalDate.getTime() + 2 * 86400000),
            hireDate
        ]);

        createdCount++;
        console.log(`✅ Créé: ${reqData.position} (${department.name}) - Délai: ${reqData.daysToFill} jours`);

      } catch (err) {
        // Ignorer si la colonne departmentId n'existe pas dans Candidature et que ça plante, 
        // ou adapter la requête. On log l'erreur pour info.
        console.error(`❌ Erreur pour ${reqData.position}:`, err.message);
      }
    }

    console.log(`\n🎉 Seed terminé ! ${createdCount} entrées créées.`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur globale:', error);
    process.exit(1);
  }
}

seedTimeToFillData();
