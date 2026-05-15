$ErrorActionPreference = "Stop"

$registrySource = Get-Content -LiteralPath "lib/registry-data.ts" -Raw
$json = [regex]::Match($registrySource, "export const swissRegistryOffices = ([\s\S]*?) satisfies SwissRegistryOffice\[\];").Groups[1].Value
$offices = $json | ConvertFrom-Json
$results = @()

foreach ($office in $offices) {
  $address = [string]$office.addressLine1
  $address = $address -replace ",?\s*(Case postale|Postfach|c\.p\.).*$", ""
  $searchText = "$address $($office.postalCode) $($office.city)"
  $uri = "https://api3.geo.admin.ch/rest/services/ech/SearchServer?searchText=$([uri]::EscapeDataString($searchText))&type=locations&origins=address&limit=1"

  try {
    $response = Invoke-RestMethod -Uri $uri -TimeoutSec 20
    $first = $response.results | Select-Object -First 1
    if ($first -and $first.attrs.lat -and $first.attrs.lon) {
      $results += [pscustomobject]@{
        slug = $office.slug
        canton = $office.canton
        searchText = $searchText
        label = ($first.attrs.label -replace "<[^>]+>", "")
        latitude = [double]$first.attrs.lat
        longitude = [double]$first.attrs.lon
        precision = "office-address"
      }
      Write-Output "OK $($office.canton) $searchText"
    } else {
      $results += [pscustomobject]@{
        slug = $office.slug
        canton = $office.canton
        searchText = $searchText
        label = ""
        latitude = $null
        longitude = $null
        precision = "unmatched"
      }
      Write-Output "MISS $($office.canton) $searchText"
    }
  } catch {
    $results += [pscustomobject]@{
      slug = $office.slug
      canton = $office.canton
      searchText = $searchText
      label = ""
      latitude = $null
      longitude = $null
      precision = "unmatched"
    }
    Write-Output "ERR $($office.canton) $searchText"
  }

  Start-Sleep -Seconds 3
}

$results | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath "lib/office-address-geocodes.json" -Encoding UTF8
Write-Output "Wrote $($results.Count) address geocodes."
