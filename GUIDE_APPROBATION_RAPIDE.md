# ✅ Boutons d'Approbation Rapide - Guide d'Utilisation

## 🎯 Nouvelle Fonctionnalité

Des **boutons d'action rapide** ont été ajoutés dans la liste des demandes d'embauche pour permettre à Zoubaier (HR_MANAGER) et Karim (PLANT_MANAGER) d'approuver ou rejeter les demandes **directement depuis la table**, sans ouvrir le modal.

## 🔘 Boutons Disponibles

### Pour Zoubaier (HR_MANAGER)
Lorsqu'une demande a le statut **"Pending HR"**, Zoubaier voit :

| Bouton | Icône | Action | Résultat |
|--------|-------|--------|----------|
| **Approuver** | ✅ (vert) | Approuve la demande | Statut → "Pending Director"<br>Notification → Karim |
| **Rejeter** | ❌ (rouge) | Rejette la demande | Demande motif<br>Statut → "Rejected"<br>Notification → Demandeur |

### Pour Karim (PLANT_MANAGER)
Lorsqu'une demande a le statut **"Pending Director"**, Karim voit :

| Bouton | Icône | Action | Résultat |
|--------|-------|--------|----------|
| **Approuver** | ✅ (vert) | Approuve la demande | Statut → "Approved"<br>Notifications → Demandeur + Hiba |
| **Rejeter** | ❌ (rouge) | Rejette la demande | Demande motif<br>Statut → "Rejected"<br>Notification → Demandeur |

## 📋 Comment Utiliser

### Scénario 1 : Zoubaier Approuve une Demande

1. **Connectez-vous** en tant que Zoubaier
   ```
   Email: zoubaier.berrebeh@tescagroup.com
   Password: 123
   ```

2. Allez sur **Demandes d'Embauche**

3. Trouvez une demande avec statut **"Pending HR"** (🔵 bleu)

4. Survolez la ligne → Les boutons apparaissent :
   - ✅ **Bouton vert** (Approuver)
   - ❌ **Bouton rouge** (Rejeter)
   - 👁️ Voir
   - 🖨️ Imprimer
   - ✏️ Modifier
   - 🗑️ Supprimer

5. **Cliquez sur ✅** pour approuver
   - ✅ Confirmation : "Demande approuvée avec succès !"
   - 📊 Statut change automatiquement : "Pending HR" → "Pending Director"
   - 📬 Notification envoyée automatiquement à Karim

### Scénario 2 : Zoubaier Rejette une Demande

1. Trouvez une demande avec statut **"Pending HR"**

2. **Cliquez sur ❌** (bouton rouge)

3. Une fenêtre popup apparaît :
   ```
   📝 Veuillez indiquer le motif du refus (obligatoire):
   [_____________________________________]
   ```

4. **Entrez le motif** (ex: "Budget insuffisant")

5. Cliquez sur **OK**
   - ✅ Confirmation : "Demande rejetée"
   - 📊 Statut change : "Rejected"
   - 📬 Notification envoyée au demandeur avec le motif

### Scénario 3 : Karim Approuve une Demande

1. **Connectez-vous** en tant que Karim
   ```
   Email: karim.mani@tescagroup.com
   Password: 123456
   ```

2. Allez sur **Demandes d'Embauche**

3. Trouvez une demande avec statut **"Pending Director"** (🟠 orange)

4. **Cliquez sur ✅** pour approuver
   - ✅ Confirmation : "Demande approuvée avec succès !"
   - 📊 Statut change : "Approved" (🟢 vert)
   - 📬 Notifications envoyées :
     - Au demandeur : "Votre demande a été approuvée"
     - À Hiba (Recrutement) : "Vous pouvez procéder au recrutement"

### Scénario 4 : Karim Rejette une Demande

1. Trouvez une demande avec statut **"Pending Director"**

2. **Cliquez sur ❌** (bouton rouge)

3. Entrez le motif du refus (obligatoire)

4. Cliquez sur **OK**
   - ✅ Demande rejetée
   - 📬 Notification au demandeur avec le motif

## 🎨 Apparence des Boutons

### Bouton Approuver (✅)
- **Couleur** : Vert
- **Icône** : Check (✓)
- **Hover** : Fond vert clair
- **Position** : Premier bouton à gauche

### Bouton Rejeter (❌)
- **Couleur** : Rouge
- **Icône** : XCircle (⊗)
- **Hover** : Fond rouge clair
- **Position** : Deuxième bouton

### Visibilité
- Les boutons apparaissent **uniquement** pour les utilisateurs autorisés
- Ils sont visibles au survol de la ligne (sur desktop)
- Toujours visibles sur mobile

## 🔒 Permissions

| Rôle | Peut Approuver | Peut Rejeter | Statuts Concernés |
|------|----------------|--------------|-------------------|
| **HR_MANAGER** (Zoubaier) | ✅ Oui | ✅ Oui | "Pending HR" uniquement |
| **PLANT_MANAGER** (Karim) | ✅ Oui | ✅ Oui | "Pending Director" uniquement |
| **Autres rôles** | ❌ Non | ❌ Non | Aucun |

## 🔄 Workflow Complet

```
1️⃣ DEMANDEUR crée demande
        ↓
   Statut: "Pending HR" 🔵
        ↓
   📬 Notification → Zoubaier
        ↓
2️⃣ ZOUBAIER voit les boutons ✅ ❌
        ↓
   Clique sur ✅ (Approuver)
        ↓
   Statut: "Pending Director" 🟠
        ↓
   📬 Notification → Karim
        ↓
3️⃣ KARIM voit les boutons ✅ ❌
        ↓
   Clique sur ✅ (Approuver)
        ↓
   Statut: "Approved" 🟢
        ↓
   📬 Notifications → Demandeur + Hiba
```

## ⚡ Avantages

✅ **Rapidité** : Approuver/rejeter en 1 clic  
✅ **Simplicité** : Pas besoin d'ouvrir le modal  
✅ **Sécurité** : Permissions basées sur le rôle  
✅ **Traçabilité** : Motif obligatoire pour les rejets  
✅ **Notifications** : Envoyées automatiquement  

## 🆚 Comparaison : Avant vs Après

### ❌ Avant (Méthode Longue)
1. Cliquer sur ✏️ **Modifier**
2. Ouvrir le modal
3. Chercher le sélecteur de statut
4. Changer le statut manuellement
5. Sauvegarder
6. Fermer le modal

**Total : 6 étapes**

### ✅ Après (Méthode Rapide)
1. Cliquer sur ✅ **Approuver**

**Total : 1 étape** 🎉

## 🐛 Dépannage

### Les boutons ne s'affichent pas
- ✅ Vérifiez que vous êtes connecté avec le bon compte
- ✅ Vérifiez le statut de la demande
- ✅ Survolez la ligne (sur desktop)

### Erreur "Vous n'avez pas la permission"
- ✅ Vérifiez votre rôle (doit être HR_MANAGER ou PLANT_MANAGER)
- ✅ Vérifiez le statut de la demande

### Le motif de rejet n'est pas demandé
- ✅ Rafraîchissez la page
- ✅ Vérifiez la console pour les erreurs

## 📝 Notes Techniques

### Code Frontend
```typescript
// Fonction d'approbation rapide
const handleQuickApprove = async (request: HiringRequest) => {
    // Détermine le nouveau statut selon le rôle
    if (request.status === 'Pending HR' && user.role === 'HR_MANAGER') {
        newStatus = 'Pending Director';
    } else if (request.status === 'Pending Director' && user.role === 'PLANT_MANAGER') {
        newStatus = 'Approved';
    }
    
    // Envoie la mise à jour au backend
    await api.updateHiringRequest(request.id, {
        status: newStatus,
        approverId: user.id
    });
};
```

### Code Backend
Le backend détecte automatiquement le changement de statut et :
1. Envoie les notifications appropriées
2. Résout les anciennes notifications
3. Met à jour la base de données

---

**Dernière mise à jour** : 2026-02-03  
**Version** : 2.0 (Approbation Rapide)  
**Auteur** : Système de Gestion RH
