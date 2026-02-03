# 🔐 AUTHENTIFICATION - LISTE DES UTILISATEURS

## 📋 Utilisateurs Clés pour le Workflow d'Approbation

### 1️⃣ HR_MANAGER (Responsable RH)

```
👤 Nom: Zoubaier Berrebeh
📧 Email: zoubaier.berrebeh@tescagroup.com
🔑 Password: 123
🏷️ Rôle: HR_MANAGER
📝 Responsabilité: Première validation des demandes d'embauche
```

**Actions possibles :**
- ✅ Approuver les demandes avec statut "Pending HR"
- ❌ Rejeter les demandes avec motif obligatoire
- 📬 Reçoit les notifications des nouvelles demandes

---

### 2️⃣ PLANT_MANAGER (Direction)

```
👤 Nom: Karim Mani
📧 Email: karim.mani@tescagroup.com
🔑 Password: 123456
🏷️ Rôle: PLANT_MANAGER
📝 Responsabilité: Validation finale des demandes d'embauche
```

**Actions possibles :**
- ✅ Approuver les demandes avec statut "Pending Director"
- ❌ Rejeter les demandes avec motif obligatoire
- 📬 Reçoit les notifications après validation RH

---

### 3️⃣ RECRUITMENT_MANAGER (Responsable Recrutement)

```
👤 Nom: Hiba Saadani
📧 Email: hiba.saadani@tescagroup.com
🔑 Password: 123
🏷️ Rôle: RECRUITMENT_MANAGER
📝 Responsabilité: Gestion du recrutement après approbation
```

**Actions possibles :**
- 📬 Reçoit les notifications des demandes approuvées
- 🎯 Peut procéder au recrutement

---

## 👥 Autres Utilisateurs

### DEMANDEUR (Créateurs de Demandes)

Tous les utilisateurs suivants ont le mot de passe : **123**

| Nom | Email | Département |
|-----|-------|-------------|
| Maher Farhani | maher.farhani@tescagroup.com | Production |
| Kais Fakhet | kais.fakhet@tescagroup.com | Production |
| Kais Riahi | kais.riahi@tescagroup.com | Production |
| Khaled Dridi | khaled.dridi@tescagroup.com | Industrialisation |
| Mohamed Amine Mani | mohamedamine.mani@tescagroup.com | Production |
| Nizar Mani | nizar.mani@tescagroup.com | Production |
| Oussama Mani | oussama.mani@tescagroup.com | Production |
| Yassine Mani | yassine.mani@tescagroup.com | Production |

**Actions possibles :**
- ➕ Créer des demandes d'embauche
- 👁️ Voir leurs propres demandes
- 📬 Recevoir les notifications d'approbation/rejet

---

### ADMIN (Administrateurs)

```
👤 Nom: Admin User
📧 Email: admin@tescagroup.com
🔑 Password: admin123
🏷️ Rôle: ADMIN
```

**Actions possibles :**
- 🔧 Accès complet à toutes les fonctionnalités
- 👥 Gestion des utilisateurs
- 🏢 Gestion des départements
- 📊 Accès à toutes les statistiques

---

## 🔄 Workflow de Connexion

### Étape 1 : Accéder à l'Application

```
URL: http://localhost:3001
```

### Étape 2 : Se Connecter

1. Entrez l'**email** de l'utilisateur
2. Entrez le **mot de passe**
3. Cliquez sur **"Se connecter"**

### Étape 3 : Vérifier le Rôle

Après connexion, vérifiez que vous êtes connecté avec le bon compte en regardant :
- Le nom affiché en haut à droite
- Les menus disponibles (selon le rôle)

---

## 🎯 Scénarios de Test

### Test du Workflow Complet

#### 1. Créer une Demande (DEMANDEUR)

```
Email: maher.farhani@tescagroup.com
Password: 123
```

**Actions :**
1. Aller sur "Demandes d'Embauche"
2. Cliquer sur "+ Nouvelle Demande"
3. Remplir le formulaire
4. Sauvegarder

**Résultat :** Notification envoyée à Zoubaier

---

#### 2. Valider en tant que RH (HR_MANAGER)

```
Email: zoubaier.berrebeh@tescagroup.com
Password: 123
```

**Actions :**
1. Cliquer sur 🔔 (voir la notification)
2. Aller sur "Demandes d'Embauche"
3. Trouver la demande (statut 🔵 "Pending HR")
4. Cliquer sur ✅ (Approuver)

**Résultat :** Notification envoyée à Karim

---

#### 3. Valider en tant que Direction (PLANT_MANAGER)

```
Email: karim.mani@tescagroup.com
Password: 123456
```

**Actions :**
1. Cliquer sur 🔔 (voir la notification)
2. Aller sur "Demandes d'Embauche"
3. Trouver la demande (statut 🟠 "Pending Director")
4. Cliquer sur ✅ (Approuver)

**Résultat :** 
- Notification au Demandeur (approbation)
- Notification à Hiba (peut recruter)

---

#### 4. Vérifier en tant que Recrutement (RECRUITMENT_MANAGER)

```
Email: hiba.saadani@tescagroup.com
Password: 123
```

**Actions :**
1. Cliquer sur 🔔 (voir la notification)
2. Voir que la demande est approuvée
3. Procéder au recrutement

---

## 🔒 Sécurité

### Mots de Passe par Défaut

⚠️ **Important** : Les mots de passe listés ici sont des mots de passe de **développement/test**.

En production, vous devriez :
1. ✅ Changer tous les mots de passe
2. ✅ Utiliser des mots de passe forts
3. ✅ Activer l'authentification à deux facteurs
4. ✅ Implémenter une politique de rotation des mots de passe

### Hashage des Mots de Passe

Les mots de passe sont stockés de manière sécurisée dans la base de données :
- ✅ Hashés avec bcrypt
- ✅ Jamais stockés en clair
- ✅ Salt automatique

---

## 📝 Notes

### Réinitialisation de Mot de Passe

Pour réinitialiser le mot de passe d'un utilisateur :

```bash
cd backend
node reset-password.js <email> <nouveau-mot-de-passe>
```

### Création d'un Nouvel Utilisateur

Pour créer un nouvel utilisateur :

```bash
cd backend
node create-user.js
```

Ou utilisez l'interface d'administration (connecté en tant qu'ADMIN).

---

## 🆘 Dépannage

### Impossible de se connecter

1. ✅ Vérifiez que l'email est correct
2. ✅ Vérifiez que le mot de passe est correct
3. ✅ Vérifiez que le serveur backend est démarré (port 8080)
4. ✅ Vérifiez que le serveur frontend est démarré (port 3001)
5. ✅ Videz le cache du navigateur

### Mot de passe oublié

Utilisez le script de réinitialisation ou contactez un administrateur.

---

## 📊 Résumé Rapide

| Rôle | Email | Password | Fonction |
|------|-------|----------|----------|
| **HR_MANAGER** | zoubaier.berrebeh@tescagroup.com | 123 | 1ère validation |
| **PLANT_MANAGER** | karim.mani@tescagroup.com | 123456 | Validation finale |
| **RECRUITMENT_MANAGER** | hiba.saadani@tescagroup.com | 123 | Recrutement |
| **DEMANDEUR** | maher.farhani@tescagroup.com | 123 | Créer demandes |
| **ADMIN** | admin@tescagroup.com | admin123 | Administration |

---

**Dernière mise à jour** : 2026-02-03  
**Version** : 1.0
