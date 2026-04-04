$files = Get-ChildItem -Path . -Filter *.html -Recurse
foreach ($f in $files) {
    if ($f.FullName -match "\\node_modules\\") { continue }
    $c = Get-Content $f.FullName -Raw
    $orig = $c

    # Index page
    if ($f.Name -eq "index.html") {
        $c = [regex]::Replace($c, '(?s)<div class="service-icon">\s*<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 4H4.*?z"/></svg>\s*</div>', '<div class="service-icon"><i class="fa-solid fa-server"></i></div>')
        $c = [regex]::Replace($c, '(?s)<div class="service-icon">\s*<svg class="icon-svg" viewBox="0 0 24 24"><path d="M10\s*20v-6.*?z"/></svg>\s*</div>', '<div class="service-icon"><i class="fa-solid fa-house-laptop"></i></div>')
        $c = [regex]::Replace($c, '(?s)<div class="service-icon">\s*<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.*?z"/></svg>\s*</div>', '<div class="service-icon"><i class="fa-solid fa-network-wired"></i></div>')
    }
    
    # 2. Footers regex
    $c = [regex]::Replace($c, '<a class="footer-link"([^>]*)data-icon="[^"]*">([^<]+)</a>', {
        param($match)
        $text = $match.Groups[2].Value.Trim()
        $map = @{
            "Home" = "fa-house"
            "About Us" = "fa-address-card"
            "Contact Us" = "fa-envelope"
            "Request a Quote" = "fa-file-invoice"
            "Services Overview" = "fa-layer-group"
            "Web Development" = "fa-code"
            "Infrastructure Hosting" = "fa-server"
            "Server Configuration" = "fa-cogs"
            "PC Planning &amp; Building" = "fa-desktop"
            "Hardware Support &amp; Repair" = "fa-wrench"
            "Software Support" = "fa-compact-disc"
            "Enterprise Networking" = "fa-network-wired"
            "Home Networking" = "fa-wifi"
            "VoIP Setup" = "fa-phone"
            "Support Portal" = "fa-headset"
        }
        $icon = $map[$text]
        if (-not $icon) { $icon = "fa-circle-dot" }
        return "<a class="footer-link"$($match.Groups[1].Value)><i class="fa-solid $icon"></i> $text</a>"
    })

    # Socials
    $c = [regex]::Replace($c, '<img\s+src="[^"]*logo-instagram.svg"[^>]*>Instagram', '<i class="fa-brands fa-instagram"></i>Instagram')
    $c = [regex]::Replace($c, '<img\s+src="[^"]*logo-x.svg"[^>]*>X', '<i class="fa-brands fa-x-twitter"></i>X')
    $c = [regex]::Replace($c, '<img\s+src="[^"]*logo-tiktok.svg"[^>]*>TikTok', '<i class="fa-brands fa-tiktok"></i>TikTok')
    $c = [regex]::Replace($c, '<img\s+src="[^"]*logo-bluesky.svg"[^>]*>BlueSky', '<i class="fa-brands fa-bluesky"></i>BlueSky')

    if ($c -ne $orig) {
        Set-Content $f.FullName -Value $c -Encoding UTF8
        Write-Host "Updated icons for $($f.Name)"
    }
}
