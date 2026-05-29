$apiLog = "$env:TEMP\elitutor-api.log"
$webLog = "$env:TEMP\elitutor-web.log"

Start-Process -FilePath "powershell.exe" `
  -ArgumentList "-NoProfile -Command `"Set-Location 'C:\Users\razan\OneDrive\שולחן העבודה\elitutor-master\apps\api'; pnpm run start:dev 2>&1 | Tee-Object -FilePath '$apiLog'`"" `
  -WindowStyle Minimized

Start-Process -FilePath "powershell.exe" `
  -ArgumentList "-NoProfile -Command `"Set-Location 'C:\Users\razan\OneDrive\שולחן העבודה\elitutor-master\apps\web'; pnpm run dev 2>&1 | Tee-Object -FilePath '$webLog'`"" `
  -WindowStyle Minimized

Write-Host "Servers starting... logs at:"
Write-Host "  API: $apiLog"
Write-Host "  Web: $webLog"
