Add-Type -AssemblyName System.Drawing

$iconPath = Join-Path $PSScriptRoot '..\build\icon.ico'
$resolvedIconPath = (Resolve-Path $iconPath).Path

$sourceBytes = [System.IO.File]::ReadAllBytes($resolvedIconPath)
$iconCount = [BitConverter]::ToUInt16($sourceBytes, 4)
$entries = @()

for ($index = 0; $index -lt $iconCount; $index++) {
    $entryOffset = 6 + ($index * 16)
    $width = $sourceBytes[$entryOffset]
    if ($width -eq 0) {
        $width = 256
    }

    $height = $sourceBytes[$entryOffset + 1]
    if ($height -eq 0) {
        $height = 256
    }

    $byteCount = [BitConverter]::ToUInt32($sourceBytes, $entryOffset + 8)
    $dataOffset = [BitConverter]::ToUInt32($sourceBytes, $entryOffset + 12)

    $entries += [PSCustomObject]@{
        Width = $width
        Height = $height
        ByteCount = $byteCount
        DataOffset = $dataOffset
    }
}

$bestEntry = $entries |
    Sort-Object -Property @{ Expression = { $_.Width * $_.Height } }, @{ Expression = { $_.ByteCount } } -Descending |
    Select-Object -First 1

$bestFrameBytes = New-Object byte[] $bestEntry.ByteCount
[Array]::Copy($sourceBytes, $bestEntry.DataOffset, $bestFrameBytes, 0, $bestEntry.ByteCount)

$sourceStream = New-Object System.IO.MemoryStream -ArgumentList (, $bestFrameBytes)
try {
    $sourceImage = [System.Drawing.Image]::FromStream($sourceStream)
    $sourceBitmap = New-Object System.Drawing.Bitmap $sourceImage
}
finally {
    $sourceStream.Dispose()
}

$sizes = @(16, 24, 32, 48, 64, 128, 256)
$frames = @()

try {
    foreach ($size in $sizes) {
        $bitmap = New-Object System.Drawing.Bitmap $size, $size
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

        try {
            $graphics.Clear([System.Drawing.Color]::Transparent)
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graphics.DrawImage($sourceBitmap, 0, 0, $size, $size)

            $memoryStream = New-Object System.IO.MemoryStream
            try {
                $bitmap.Save($memoryStream, [System.Drawing.Imaging.ImageFormat]::Png)
                $frames += [PSCustomObject]@{
                    Size = $size
                    Bytes = $memoryStream.ToArray()
                }
            }
            finally {
                $memoryStream.Dispose()
            }
        }
        finally {
            $graphics.Dispose()
            $bitmap.Dispose()
        }
    }
}
finally {
    $sourceBitmap.Dispose()
    $sourceImage.Dispose()
}

$tempIconPath = "$resolvedIconPath.tmp"
$outputStream = [System.IO.File]::Open($tempIconPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
try {
    $writer = [System.IO.BinaryWriter]::new($outputStream)
    try {
        $writer.Write([UInt16]0)
        $writer.Write([UInt16]1)
        $writer.Write([UInt16]$frames.Count)

        $offset = 6 + (16 * $frames.Count)
        foreach ($frame in $frames) {
            $dimension = if ($frame.Size -ge 256) { 0 } else { [byte]$frame.Size }

            $writer.Write([byte]$dimension)
            $writer.Write([byte]$dimension)
            $writer.Write([byte]0)
            $writer.Write([byte]0)
            $writer.Write([UInt16]1)
            $writer.Write([UInt16]32)
            $writer.Write([UInt32]$frame.Bytes.Length)
            $writer.Write([UInt32]$offset)

            $offset += $frame.Bytes.Length
        }

        foreach ($frame in $frames) {
            $writer.Write($frame.Bytes)
        }
    }
    finally {
        $writer.Dispose()
    }
}
finally {
    $outputStream.Dispose()
}

Move-Item -Path $tempIconPath -Destination $resolvedIconPath -Force

Write-Host "Regenerated $resolvedIconPath with sizes: $($sizes -join ', ')"