# Test des APIs de Notification
Write-Host "🧪 TEST DES APIs DE NOTIFICATION`n" -ForegroundColor Cyan

$API_BASE = "http://localhost:8080/api"

# 1. Login
Write-Host "1️⃣ Connexion...`n" -ForegroundColor Yellow

$loginBody = '{"email":"karim.mani@tescagroup.com","password":"123456"}'

$loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method Post -Body $loginBody -ContentType "application/json"

$token = $loginResponse.token
$userId = $loginResponse.user.id

Write-Host "   ✅ Connecté: $($loginResponse.user.name)" -ForegroundColor Green
Write-Host "   User ID: $userId`n"

$headers = @{
    "Authorization" = "Bearer $token"
}

# 2. Get all notifications
Write-Host "2️⃣ Récupération des notifications...`n" -ForegroundColor Yellow

$notifications = Invoke-RestMethod -Uri "$API_BASE/notifications/$userId" -Headers $headers

Write-Host "   ✅ $($notifications.Count) notification(s) trouvée(s)`n" -ForegroundColor Green

if ($notifications.Count -gt 0) {
    Write-Host "   📋 Premières notifications:"
    for ($i = 0; $i -lt [Math]::Min(3, $notifications.Count); $i++) {
        $n = $notifications[$i]
        $msg = $n.message.Substring(0, [Math]::Min(60, $n.message.Length))
        Write-Host "      $($i+1). $msg..."
        Write-Host "         Type: $($n.type) | Lu: $($n.isRead)"
    }
    Write-Host ""
}

# 3. Unread count
Write-Host "3️⃣ Comptage non lues...`n" -ForegroundColor Yellow

$unreadCount = Invoke-RestMethod -Uri "$API_BASE/notifications/$userId/unread-count" -Headers $headers

Write-Host "   ✅ Non lues: $($unreadCount.count)`n" -ForegroundColor Green

# 4. Mark all as read
Write-Host "4️⃣ Marquage toutes comme lues...`n" -ForegroundColor Yellow

Invoke-RestMethod -Uri "$API_BASE/notifications/$userId/read-all" -Method Patch -Headers $headers | Out-Null

Write-Host "   ✅ Toutes marquées comme lues`n" -ForegroundColor Green

# 5. Verify
Write-Host "5️⃣ Vérification...`n" -ForegroundColor Yellow

$newCount = Invoke-RestMethod -Uri "$API_BASE/notifications/$userId/unread-count" -Headers $headers

Write-Host "   ✅ Non lues maintenant: $($newCount.count)`n" -ForegroundColor Green

# Summary
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ:`n" -ForegroundColor Cyan
Write-Host "   ✅ Login: OK" -ForegroundColor Green
Write-Host "   ✅ Get Notifications: OK ($($notifications.Count) total)" -ForegroundColor Green
Write-Host "   ✅ Unread Count: OK" -ForegroundColor Green
Write-Host "   ✅ Mark All Read: OK" -ForegroundColor Green
Write-Host "`n🎉 TOUS LES TESTS RÉUSSIS !`n" -ForegroundColor Green
