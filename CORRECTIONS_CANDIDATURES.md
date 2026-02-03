# ✅ CORRECTIONS - Erreur 500 Candidatures

## 📝 Résumé

Date : 2026-02-03  
Problème : Erreur 500 lors de la création de candidatures

---

## 🐛 Problèmes Identifiés

### 1. Traduction Manquante ✅ CORRIGÉ

**Erreur :**
```
Translation missing for key: candidature.noResults in language: en
```

**Cause :** Clé de traduction `noResults` manquante dans `translations.ts`

**Solution :**
- ✅ Ajout de `noResults: "No results found."` (EN)
- ✅ Ajout de `noResults: "Aucun résultat trouvé."` (FR)

**Fichier modifié :** `src/lib/translations.ts`

---

### 2. Erreur 500 Backend ✅ CORRIGÉ

**Erreur :**
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to save candidature: Error: Failed to create candidature
```

**Causes :**

#### A. Colonne `cvPath` Manquante

**Erreur SQL :**
```
Unknown column 'cvPath' in 'field list'
```

**Solution :**
```sql
ALTER TABLE Candidature
ADD COLUMN cvPath VARCHAR(500) NULL
```

**Script créé :** `backend/add-cvpath-column.js`

---

#### B. Type ENUM pour `gender`

**Erreur SQL :**
```
Data truncated for column 'gender' at row 1
```

**Problème :** La colonne `gender` était de type `ENUM('MALE','FEMALE','OTHER')` mais le frontend envoyait des valeurs comme `'M'`, `'F'`, etc.

**Solution :**
```sql
ALTER TABLE Candidature
MODIFY COLUMN gender VARCHAR(10) NULL
```

**Script créé :** `backend/fix-gender-column.js`

---

## 🔧 Scripts de Migration Créés

### 1. `add-cvpath-column.js`
```bash
node backend/add-cvpath-column.js
```
- Ajoute la colonne `cvPath` à la table `Candidature`
- Type : `VARCHAR(500) NULL`

### 2. `fix-gender-column.js`
```bash
node backend/fix-gender-column.js
```
- Modifie la colonne `gender` de `ENUM` à `VARCHAR(10)`
- Permet des valeurs flexibles comme 'M', 'F', 'Homme', 'Femme', etc.

### 3. `test-candidature-creation.js`
```bash
node backend/test-candidature-creation.js
```
- Teste la création d'une candidature
- Affiche la structure de la table
- Crée une candidature de test
- Vérifie l'insertion
- Nettoie automatiquement

---

## ✅ Résultats des Tests

### Test de Création de Candidature

```
✅ TEST RÉUSSI !
💡 La création de candidatures fonctionne correctement.
```

**Détails :**
- ✅ Colonne `cvPath` ajoutée
- ✅ Colonne `gender` modifiée
- ✅ Insertion réussie
- ✅ Vérification réussie
- ✅ Suppression réussie

---

## 📊 Structure de la Table Candidature (Mise à Jour)

### Colonnes Modifiées/Ajoutées

| Colonne | Type | NULL | Default | Commentaire |
|---------|------|------|---------|-------------|
| `cvPath` | VARCHAR(500) | YES | NULL | **NOUVEAU** - Chemin du CV |
| `gender` | VARCHAR(10) | YES | NULL | **MODIFIÉ** - Était ENUM |

### Colonnes Existantes

- `id` - VARCHAR(36) PRIMARY KEY
- `firstName` - VARCHAR(255) NOT NULL
- `lastName` - VARCHAR(255) NOT NULL
- `email` - VARCHAR(255) NOT NULL
- `phone` - VARCHAR(20)
- `birthDate` - DATE
- `address` - TEXT
- `positionAppliedFor` - VARCHAR(255)
- `department` - VARCHAR(255)
- `specialty` - VARCHAR(255)
- `level` - VARCHAR(100)
- `yearsOfExperience` - INT
- `language` - VARCHAR(100)
- `source` - VARCHAR(100)
- `hiringRequestId` - VARCHAR(36)
- `recruiterComments` - TEXT
- `educationLevel` - VARCHAR(100)
- `familySituation` - VARCHAR(100)
- `studySpecialty` - VARCHAR(255)
- `currentSalary` - DECIMAL(10,2)
- `salaryExpectation` - DECIMAL(10,2)
- `proposedSalary` - DECIMAL(10,2)
- `noticePeriod` - VARCHAR(100)
- `hrOpinion` - TEXT
- `managerOpinion` - TEXT
- `recruitmentMode` - VARCHAR(100)
- `workSite` - VARCHAR(255)
- `status` - VARCHAR(50)
- `createdAt` - TIMESTAMP

---

## 🎯 Workflow de Création de Candidature

### Frontend → Backend

1. **Frontend** (`src/app/candidatures/page.tsx`)
   ```typescript
   const handleSave = async (data) => {
       await api.createCandidature(data);
   }
   ```

2. **API** (`src/lib/api.ts`)
   ```typescript
   createCandidature: async (data) => {
       const response = await fetch('/api/candidatures', {
           method: 'POST',
           body: JSON.stringify(data)
       });
       return response.json();
   }
   ```

3. **Backend Controller** (`backend/controllers/candidatureController.js`)
   ```javascript
   const createCandidature = asyncHandler(async (req, res) => {
       if (req.file) {
           req.body.cvPath = req.file.path.replace(/\\/g, '/');
       }
       const newItem = await candidatureService.createCandidature(req.body);
       res.status(201).json(newItem);
   });
   ```

4. **Service** (`backend/services/candidatureService.js`)
   ```javascript
   const createCandidature = async (data) => {
       const id = uuidv4();
       const sql = `INSERT INTO Candidature (...) VALUES (...)`;
       await db.query(sql, values);
       return newItem;
   };
   ```

---

## 🧪 Tests Recommandés

### 1. Test de Création Simple

1. Ouvrez http://localhost:3001
2. Allez sur "Candidatures"
3. Cliquez sur "+ Nouvelle Candidature"
4. Remplissez les champs obligatoires :
   - Prénom
   - Nom
   - Email
   - Téléphone
   - Poste
   - Département
5. Cliquez sur "Enregistrer"

**Résultat attendu :** ✅ Candidature créée avec succès

---

### 2. Test avec Upload de CV

1. Créez une nouvelle candidature
2. Uploadez un fichier CV (PDF, DOC, etc.)
3. Sauvegardez

**Résultat attendu :** 
- ✅ Candidature créée
- ✅ Chemin du CV enregistré dans `cvPath`

---

### 3. Test avec Différentes Valeurs de Genre

Testez avec :
- `M` ou `Homme` ou `Male`
- `F` ou `Femme` ou `Female`
- `Autre` ou `Other`

**Résultat attendu :** ✅ Toutes les valeurs acceptées

---

## 📚 Documentation Associée

- `WORKFLOW_HIRING_REQUESTS.md` - Workflow des demandes
- `AUTHENTIFICATION.md` - Informations de connexion
- `MODIFICATIONS_FORMULAIRE.md` - Modifications du formulaire

---

## 🔍 Diagnostic en Cas de Problème

### Erreur : "Unknown column 'cvPath'"

```bash
node backend/add-cvpath-column.js
```

### Erreur : "Data truncated for column 'gender'"

```bash
node backend/fix-gender-column.js
```

### Tester la Création

```bash
node backend/test-candidature-creation.js
```

### Vérifier la Structure de la Table

```sql
SHOW COLUMNS FROM Candidature;
```

---

## ✅ Checklist de Validation

- [x] Traduction `noResults` ajoutée (EN)
- [x] Traduction `noResults` ajoutée (FR)
- [x] Colonne `cvPath` ajoutée
- [x] Colonne `gender` modifiée
- [x] Test de création réussi
- [x] Scripts de migration créés
- [x] Documentation créée

---

## 🚀 Prochaines Étapes

1. ✅ Tester la création de candidatures dans l'interface
2. ✅ Tester l'upload de CV
3. ✅ Vérifier que les données sont correctement enregistrées
4. ✅ Valider avec l'équipe

---

**Dernière mise à jour** : 2026-02-03  
**Version** : 1.0  
**Auteur** : Antigravity AI
