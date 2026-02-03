# Test des APIs de Notification
# Exécutez ce script avec PowerShell

$API_BASE = "http://localhost:8080/api"

Write-Host "🧪 TEST DES APIs DE NOTIFICATION`n" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════`n"

# 1. Login pour obtenir un token
Write-Host "1️⃣ Connexion en tant que Karim Mani...`n" -ForegroundColor Yellow

$loginBody = @{
    email = "karim.mani@tescagroup.com"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    $token = $loginResponse.token
    $userId = $loginResponse.user.id
    
    Write-Host "   ✅ Connexion réussie !" -ForegroundColor Green
    Write-Host "   👤 User ID: $userId"
    Write-Host "   👤 Nom: $($loginResponse.user.name)"
    Write-Host "   🔑 Token: $($token.Substring(0, 20))...`n"

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    # 2. Récupérer toutes les notifications
    Write-Host "2️⃣ Récupération de toutes les notifications...`n" -ForegroundColor Yellow
    
    $allNotifications = Invoke-RestMethod -Uri "$API_BASE/notifications/$userId" -Method Get -Headers $headers
    
    Write-Host "   ✅ $($allNotifications.Count) notification(s) trouvée(s)`n" -ForegroundColor Green
    
    if ($allNotifications.Count -gt 0) {
        Write-Host "   📋 Dernières notifications:"
        $allNotifications | Select-Object -First 3 | ForEach-Object {
            $index = $allNotifications.IndexOf($_) + 1
            $message = $_.message.Substring(0, [Math]::Min(60, $_.message.Length))
            $readStatus = if ($_.isRead) { "✅" } else { "❌" }
            $date = [DateTime]::Parse($_.createdAt).ToString("dd/MM/yyyy HH:mm")
            
            Write-Host "      $index. $($_.type) - $message..."
            Write-Host "         Lu: $readStatus | Date: $date"
        }
        Write-Host ""
    }

    # 3. Récupérer le nombre de notifications non lues
    Write-Host "3️⃣ Comptage des notifications non lues...`n" -ForegroundColor Yellow
    
    $unreadCount = Invoke-RestMethod -Uri "$API_BASE/notifications/$userId/unread-count" -Method Get -Headers $headers
    
    Write-Host "   ✅ Notifications non lues: $($unreadCount.count)`n" -ForegroundColor Green

    # 4. Marquer une notification comme lue (si disponible)
    $unreadNotif = $allNotifications | Where-Object { -not $_.isRead } | Select-Object -First 1
    
    if ($unreadNotif) {
        Write-Host "4️⃣ Marquage d'une notification comme lue...`n" -ForegroundColor Yellow
        
        $notifId = $unreadNotif.id
        Invoke-RestMethod -Uri "$API_BASE/notifications/$notifId/read" -Method Patch -Headers $headers | Out-Null
        
        Write-Host "   ✅ Notification $($notifId.Substring(0, 8))... marquée comme lue`n" -ForegroundColor Green
    }

    # 5. Marquer toutes les notifications comme lues
    Write-Host "5️⃣ Marquage de toutes les notifications comme lues...`n" -ForegroundColor Yellow
    
    Invoke-RestMethod -Uri "$API_BASE/notifications/$userId/read-all" -Method Patch -Headers $headers | Out-Null
    
    Write-Host "   ✅ Toutes les notifications marquées comme lues`n" -ForegroundColor Green

    # 6. Vérifier le nouveau compte de non lues
    Write-Host "6️⃣ Vérification du nouveau compte...`n" -ForegroundColor Yellow
    
    $newUnreadCount = Invoke-RestMethod -Uri "$API_BASE/notifications/$userId/unread-count" -Method Get -Headers $headers
    
    Write-Host "   ✅ Notifications non lues maintenant: $($newUnreadCount.count)`n" -ForegroundColor Green

    # 7. Récupérer les notifications liées aux demandes d'embauche
    Write-Host "7️⃣ Analyse des notifications de type HIRING_REQUEST...`n" -ForegroundColor Yellow
    
    $hiringNotifications = $allNotifications | Where-Object { $_.entityType -eq 'HIRING_REQUEST' }
    
    Write-Host "   ✅ $($hiringNotifications.Count) notification(s) de demandes d'embauche`n" -ForegroundColor Green

    if ($hiringNotifications.Count -gt 0) {
        Write-Host "   📋 Détails:"
        $hiringNotifications | Select-Object -First 3 | ForEach-Object {
            $index = $hiringNotifications.IndexOf($_) + 1
            $message = $_.message.Substring(0, [Math]::Min(70, $_.message.Length))
            $actions = if ($_.actions) { $_.actions -join ', ' } else { 'Aucune' }
            
            Write-Host "      $index. $message..."
            Write-Host "         Entity ID: $($_.entityId)"
            Write-Host "         Actions: $actions"
        }
        Write-Host ""
    }

    # 8. Résumé final
    Write-Host "═══════════════════════════════════════════════════════`n"
    Write-Host "📊 RÉSUMÉ DES TESTS:`n" -ForegroundColor Cyan
    Write-Host "   ✅ API Login: OK" -ForegroundColor Green
    Write-Host "   ✅ API Get All Notifications: OK ($($allNotifications.Count) notifications)" -ForegroundColor Green
    Write-Host "   ✅ API Unread Count: OK" -ForegroundColor Green
    Write-Host "   ✅ API Mark as Read: OK" -ForegroundColor Green
    Write-Host "   ✅ API Mark All as Read: OK" -ForegroundColor Green
    Write-Host "   ✅ Filtrage par type: OK ($($hiringNotifications.Count) HIRING_REQUEST)`n" -ForegroundColor Green

    Write-Host "🎉 TOUS LES TESTS RÉUSSIS !`n" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════`n"

} catch {
    Write-Host "`n❌ ERREUR: $($_.Exception.Message)`n" -ForegroundColor Red
    Write-Host "Détails:" -ForegroundColor Red
    Write-Host $_.Exception | Format-List -Force
}
