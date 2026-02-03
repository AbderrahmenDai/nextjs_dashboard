# 📬 APIs de Notification - Documentation Complète

## 🎯 Vue d'Ensemble

Toutes les APIs de notification sont accessibles via le endpoint de base : `http://localhost:8080/api/notifications`

**Authentification requise** : Toutes les requêtes nécessitent un token JWT dans le header `Authorization: Bearer <token>`

## 📋 Liste des APIs

### 1. **Récupérer toutes les notifications d'un utilisateur**

```http
GET /api/notifications/:receiverId
```

**Paramètres :**
- `receiverId` (path) : ID de l'utilisateur

**Headers :**
```
Authorization: Bearer <token>
```

**Réponse (200 OK) :**
```json
[
  {
    "id": "uuid",
    "senderId": "uuid",
    "receiverId": "uuid",
    "message": "📋 Nouvelle demande d'embauche...",
    "type": "ACTION_REQUIRED",
    "entityType": "HIRING_REQUEST",
    "entityId": "uuid",
    "actions": ["APPROVE", "REJECT"],
    "isRead": false,
    "createdAt": "2026-02-03T06:00:00.000Z"
  }
]
```

**Exemple avec curl :**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/notifications/USER_ID
```

---

### 2. **Compter les notifications non lues**

```http
GET /api/notifications/:receiverId/unread-count
```

**Paramètres :**
- `receiverId` (path) : ID de l'utilisateur

**Réponse (200 OK) :**
```json
{
  "count": 5
}
```

**Exemple avec curl :**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/notifications/USER_ID/unread-count
```

---

### 3. **Marquer une notification comme lue**

```http
PATCH /api/notifications/:id/read
```

**Paramètres :**
- `id` (path) : ID de la notification

**Réponse (200 OK) :**
```json
{
  "message": "Notification marked as read"
}
```

**Exemple avec curl :**
```bash
curl -X PATCH \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/notifications/NOTIFICATION_ID/read
```

---

### 4. **Marquer toutes les notifications comme lues**

```http
PATCH /api/notifications/:receiverId/read-all
```

**Paramètres :**
- `receiverId` (path) : ID de l'utilisateur

**Réponse (200 OK) :**
```json
{
  "message": "All notifications marked as read",
  "count": 10
}
```

**Exemple avec curl :**
```bash
curl -X PATCH \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/notifications/USER_ID/read-all
```

---

### 5. **Supprimer une notification**

```http
DELETE /api/notifications/:id
```

**Paramètres :**
- `id` (path) : ID de la notification

**Réponse (200 OK) :**
```json
{
  "message": "Notification deleted successfully"
}
```

**Exemple avec curl :**
```bash
curl -X DELETE \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/notifications/NOTIFICATION_ID
```

---

## 🔐 Authentification

### Obtenir un token

```http
POST /api/auth/login
```

**Body :**
```json
{
  "email": "karim.mani@tescagroup.com",
  "password": "123456"
}
```

**Réponse (200 OK) :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Karim Mani",
    "email": "karim.mani@tescagroup.com",
    "role": "PLANT_MANAGER"
  }
}
```

**Exemple avec curl :**
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"karim.mani@tescagroup.com","password":"123456"}' \
     http://localhost:8080/api/auth/login
```

---

## 🧪 Tests Manuels

### Test Complet avec curl

```bash
# 1. Login
TOKEN=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"karim.mani@tescagroup.com","password":"123456"}' \
  http://localhost:8080/api/auth/login | jq -r '.token')

USER_ID=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"karim.mani@tescagroup.com","password":"123456"}' \
  http://localhost:8080/api/auth/login | jq -r '.user.id')

echo "Token: $TOKEN"
echo "User ID: $USER_ID"

# 2. Get all notifications
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8080/api/notifications/$USER_ID

# 3. Get unread count
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8080/api/notifications/$USER_ID/unread-count

# 4. Mark all as read
curl -X PATCH \
     -H "Authorization: Bearer $TOKEN" \
     http://localhost:8080/api/notifications/$USER_ID/read-all

# 5. Verify unread count
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8080/api/notifications/$USER_ID/unread-count
```

---

## 📊 Types de Notifications

### Types (`type`)

| Type | Description | Utilisation |
|------|-------------|-------------|
| `ACTION_REQUIRED` | Action requise de l'utilisateur | Approbation/Rejet de demandes |
| `INFO` | Information simple | Notifications d'approbation finale |
| `WARNING` | Avertissement | Alertes système |
| `ERROR` | Erreur | Erreurs critiques |

### Types d'Entités (`entityType`)

| Type | Description |
|------|-------------|
| `HIRING_REQUEST` | Demande d'embauche |
| `CANDIDATURE` | Candidature |
| `INTERVIEW` | Entretien |
| `USER` | Utilisateur |

### Actions Disponibles (`actions`)

| Action | Description |
|--------|-------------|
| `APPROVE` | Approuver |
| `REJECT` | Rejeter |
| `VIEW` | Voir les détails |
| `EDIT` | Modifier |

---

## 🔄 Workflow de Notification

### Création de Demande d'Embauche

```
1. Demandeur crée une demande
   ↓
2. Backend crée notification pour HR_MANAGER
   {
     type: "ACTION_REQUIRED",
     entityType: "HIRING_REQUEST",
     actions: ["APPROVE", "REJECT"],
     message: "📋 Nouvelle demande d'embauche..."
   }
   ↓
3. Socket.IO envoie en temps réel
   ↓
4. Frontend affiche badge 🔔
```

### Approbation par HR_MANAGER

```
1. HR_MANAGER approuve
   ↓
2. Backend met à jour le statut
   ↓
3. Backend résout les notifications HR
   ↓
4. Backend crée notification pour PLANT_MANAGER
   {
     type: "ACTION_REQUIRED",
     entityType: "HIRING_REQUEST",
     actions: ["APPROVE", "REJECT"],
     message: "✅ Demande validée par RH..."
   }
   ↓
5. Socket.IO envoie à PLANT_MANAGER
```

---

## 🐛 Codes d'Erreur

| Code | Message | Solution |
|------|---------|----------|
| 401 | Unauthorized | Vérifier le token d'authentification |
| 403 | Forbidden | Vérifier les permissions de l'utilisateur |
| 404 | Not Found | Vérifier l'ID de la notification/utilisateur |
| 500 | Internal Server Error | Vérifier les logs du serveur |

---

## 📱 Intégration Frontend

### Récupérer les notifications

```typescript
import { api } from '@/lib/api';

// Get all notifications
const notifications = await api.notifications.getAll(userId);

// Get unread count
const { count } = await api.notifications.getUnreadCount(userId);

// Mark as read
await api.notifications.markAsRead(notificationId);

// Mark all as read
await api.notifications.markAllAsRead(userId);
```

### Socket.IO

```typescript
import { useSocket } from '@/contexts/SocketContext';

const { socket } = useSocket();

// Listen for new notifications
socket?.on('notification', (notification) => {
  console.log('New notification:', notification);
  // Update UI
});
```

---

## ✅ Checklist de Test

- [ ] Login réussi avec token valide
- [ ] Récupération de toutes les notifications
- [ ] Comptage des notifications non lues
- [ ] Marquage d'une notification comme lue
- [ ] Marquage de toutes les notifications comme lues
- [ ] Suppression d'une notification
- [ ] Réception en temps réel via Socket.IO
- [ ] Affichage du badge de notification
- [ ] Filtrage par type d'entité
- [ ] Actions disponibles sur les notifications

---

**Dernière mise à jour** : 2026-02-03  
**Version API** : 1.0  
**Base URL** : http://localhost:8080/api
