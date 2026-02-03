# 📋 Workflow d'Approbation des Demandes d'Embauche

## Vue d'ensemble

Ce document décrit le processus séquentiel d'approbation des demandes d'embauche dans le système.

## Acteurs

| Rôle | Nom | Email | Responsabilité |
|------|-----|-------|----------------|
| **DEMANDEUR** | Divers utilisateurs | - | Crée les demandes d'embauche |
| **HR_MANAGER** | Zoubaier Berrebeh | zoubaier.berrebeh@tescagroup.com | Première validation (RH) |
| **PLANT_MANAGER** | Karim Mani | karim.mani@tescagroup.com | Validation finale (Direction) |
| **RECRUITMENT_MANAGER** | Hiba Saadani | hiba.saadani@tescagroup.com | Gestion du recrutement |

## Flux de Travail Séquentiel

```
┌─────────────────┐
│   DEMANDEUR     │
│  Crée demande   │
└────────┬────────┘
         │
         ▼
    Status: "Pending HR"
         │
         ▼
┌─────────────────┐
│   HR_MANAGER    │◄─── Notification envoyée
│  (Zoubaier)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
APPROVE    REJECT
    │         │
    │         └──► Status: "Rejected"
    │              └──► Notification au DEMANDEUR
    │                   avec motif obligatoire
    ▼
Status: "Pending Director"
    │
    ▼
┌─────────────────┐
│ PLANT_MANAGER   │◄─── Notification envoyée
│   (Karim)       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
APPROVE    REJECT
    │         │
    │         └──► Status: "Rejected"
    │              └──► Notification au DEMANDEUR
    │                   avec motif obligatoire
    ▼
Status: "Approved"
    │
    ├──► Notification au DEMANDEUR
    │     (demande approuvée)
    │
    └──► Notification au RECRUITMENT_MANAGER
          (Hiba - peut procéder au recrutement)
```

## Statuts Disponibles

| Statut | Description | Couleur | Prochaine Étape |
|--------|-------------|---------|-----------------|
| **Pending HR** | En attente de validation RH | 🔵 Bleu | HR_MANAGER doit approuver/rejeter |
| **Pending Director** | En attente de validation Direction | 🟠 Orange | PLANT_MANAGER doit approuver/rejeter |
| **Approved** | Demande approuvée | 🟢 Vert | RECRUITMENT_MANAGER peut recruter |
| **Rejected** | Demande rejetée | 🔴 Rouge | Fin du processus |

## Règles de Gestion

### 1. Création de Demande
- **Qui** : Utilisateurs avec le rôle `DEMANDEUR`
- **Statut initial** : `Pending HR`
- **Notification** : Envoyée uniquement au `HR_MANAGER`

### 2. Validation RH
- **Qui** : `HR_MANAGER` (Zoubaier)
- **Actions possibles** :
  - ✅ **Approuver** → Statut devient `Pending Director`
    - Notification envoyée au `PLANT_MANAGER`
    - Résolution des notifications RH
  - ❌ **Rejeter** → Statut devient `Rejected`
    - **Motif obligatoire** (champ `rejectionReason`)
    - Notification au `DEMANDEUR` avec le motif
    - Résolution de toutes les notifications

### 3. Validation Direction
- **Qui** : `PLANT_MANAGER` (Karim)
- **Actions possibles** :
  - ✅ **Approuver** → Statut devient `Approved`
    - Notification au `DEMANDEUR` (demande approuvée)
    - Notification au `RECRUITMENT_MANAGER` (peut recruter)
    - Résolution de toutes les notifications
  - ❌ **Rejeter** → Statut devient `Rejected`
    - **Motif obligatoire** (champ `rejectionReason`)
    - Notification au `DEMANDEUR` avec le motif
    - Résolution de toutes les notifications

### 4. Motif de Rejet
- **Obligatoire** pour tout rejet (HR ou Direction)
- **Validation backend** : Erreur 400 si le motif est absent
- **Affichage frontend** : Champ textarea visible uniquement si statut = "Rejected"

## Notifications

### Types de Notifications

| Type | Quand | Destinataire | Actions |
|------|-------|--------------|---------|
| `ACTION_REQUIRED` | Nouvelle demande | HR_MANAGER | APPROVE, REJECT |
| `ACTION_REQUIRED` | HR approuve | PLANT_MANAGER | APPROVE, REJECT |
| `INFO` | Direction approuve | RECRUITMENT_MANAGER | - |
| `INFO` | Approbation finale | DEMANDEUR | - |
| `INFO` | Rejet | DEMANDEUR | - |

### Messages de Notification

```javascript
// Nouvelle demande → HR
`📋 Nouvelle demande d'embauche de ${demandeur}: "${titre}" - En attente de votre validation`

// HR approuve → Direction
`✅ Demande d'embauche "${titre}" validée par RH (${nom_rh}). En attente de votre validation.`

// Direction approuve → Recruitment Manager
`✅ Demande d'embauche "${titre}" validée par la Direction (${nom_direction}). Vous pouvez maintenant procéder au recrutement.`

// Direction approuve → Demandeur
`🎉 Votre demande d'embauche "${titre}" a été APPROUVÉE par la Direction (${nom_direction}).`

// Rejet → Demandeur
`❌ Votre demande d'embauche "${titre}" a été REFUSÉE par ${nom_approbateur}.

📝 Motif: ${motif_rejet}`
```

## Implémentation Technique

### Backend (`hiringRequestController.js`)

#### Création de Demande
```javascript
// Status initial
const requestData = { ...req.body, status: 'Pending HR' };

// Notification uniquement au HR_MANAGER
const [hrManagers] = await db.query(`
    SELECT User.id, User.name FROM User 
    JOIN Role ON User.roleId = Role.id 
    WHERE Role.name = 'HR_MANAGER'
`);
```

#### Mise à Jour (Approbation/Rejet)
```javascript
// Validation du motif de rejet
if (status === 'Rejected' && !rejectionReason) {
    res.status(400);
    throw new Error('Un motif de rejet est obligatoire');
}

// Workflow séquentiel
if (status === 'Pending Director' && actorRole === 'HR_MANAGER') {
    // Notifier PLANT_MANAGER
}

if (status === 'Approved' && actorRole === 'PLANT_MANAGER') {
    // Notifier RECRUITMENT_MANAGER et DEMANDEUR
}

if (status === 'Rejected') {
    // Notifier DEMANDEUR avec motif
}
```

### Frontend (`page.tsx`)

#### Statuts et Couleurs
```typescript
const getStatusColor = (status: string) => {
    switch (status) {
        case "Pending HR": 
            return "bg-blue-500/10 text-blue-600 border-blue-500/20";
        case "Pending Director": 
            return "bg-orange-500/10 text-orange-600 border-orange-500/20";
        case "Approved": 
            return "bg-green-500/10 text-green-600 border-green-500/20";
        case "Rejected": 
            return "bg-red-500/10 text-red-600 border-red-500/20";
    }
};
```

#### Champ Motif de Rejet
```tsx
{formData.status === 'Rejected' && (
    <textarea
        required
        placeholder="Veuillez indiquer le motif du refus..."
        value={formData.rejectionReason || ""}
        onChange={(e) => setFormData({ 
            ...formData, 
            rejectionReason: e.target.value 
        })}
    />
)}
```

## Scénarios de Test

### Scénario 1 : Approbation Complète
1. **DEMANDEUR** crée une demande
   - ✅ Statut = "Pending HR"
   - ✅ HR_MANAGER reçoit notification
2. **HR_MANAGER** approuve
   - ✅ Statut = "Pending Director"
   - ✅ PLANT_MANAGER reçoit notification
3. **PLANT_MANAGER** approuve
   - ✅ Statut = "Approved"
   - ✅ DEMANDEUR reçoit notification d'approbation
   - ✅ RECRUITMENT_MANAGER reçoit notification

### Scénario 2 : Rejet par HR
1. **DEMANDEUR** crée une demande
   - ✅ Statut = "Pending HR"
2. **HR_MANAGER** rejette **sans motif**
   - ❌ Erreur 400 : "Un motif de rejet est obligatoire"
3. **HR_MANAGER** rejette **avec motif**
   - ✅ Statut = "Rejected"
   - ✅ DEMANDEUR reçoit notification avec motif

### Scénario 3 : Rejet par Direction
1. **DEMANDEUR** crée une demande
2. **HR_MANAGER** approuve
   - ✅ Statut = "Pending Director"
3. **PLANT_MANAGER** rejette **avec motif**
   - ✅ Statut = "Rejected"
   - ✅ DEMANDEUR reçoit notification avec motif

## Mots de Passe de Test

Pour tester le workflow :

```
HR Manager (Zoubaier):
Email: zoubaier.berrebeh@tescagroup.com
Password: 123

Direction (Karim):
Email: karim.mani@tescagroup.com
Password: 123456

Recruitment Manager (Hiba):
Email: hiba.saadani@tescagroup.com
Password: 123
```

## Notes Importantes

1. ⚠️ **Séquentialité** : Les approbations doivent être séquentielles. Le PLANT_MANAGER ne reçoit de notification qu'après l'approbation du HR_MANAGER.

2. ⚠️ **Motif Obligatoire** : Tout rejet nécessite un motif. Le backend valide cette exigence.

3. ⚠️ **Résolution des Notifications** : Lorsqu'une demande change de statut, les notifications précédentes sont automatiquement résolues.

4. ⚠️ **Permissions** : Seuls les utilisateurs avec les rôles appropriés peuvent approuver/rejeter à chaque étape.

## Maintenance

Pour ajouter un nouvel approbateur dans le workflow :

1. Créer le rôle dans la base de données
2. Créer l'utilisateur avec ce rôle
3. Mettre à jour `hiringRequestController.js` pour ajouter l'étape
4. Ajouter le nouveau statut dans `getStatusColor()`
5. Mettre à jour cette documentation

---

**Dernière mise à jour** : 2026-02-02
**Version** : 1.0
**Auteur** : Système de Gestion RH
