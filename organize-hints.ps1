# PowerShell Script to Organize Hint Files
# This script moves hint files from the symbols folder to their appropriate category folders

Write-Host "Starting hint folder organization..." -ForegroundColor Green

# Set the base hints directory
$hintsDir = "c:\Users\tedbe\.vscode\scripts\TrafficSign\hints"
$symbolsDir = "$hintsDir\symbols"

# Ensure we're in the correct directory
Set-Location $hintsDir

# Create directories if they don't exist
$directories = @("divider", "border", "text", "route")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "Created directory: $dir" -ForegroundColor Yellow
    }
}

# Define file mappings - files to move from symbols to their proper folders
$fileMappings = @{
    "divider" = @(
        "GantryDivider.html", "GantryDivider.svg",
        "StackDivider.html", "StackDivider.svg", 
        "LaneLine.html", "LaneLine.svg"
    )
    "border" = @(
        "ExitBorder1.svg", "ExitBorder2.svg",
        "FlagBorder.svg", "StackBorder.svg",
        "Panel.svg", "GreenPanel.svg"
    )
    "text" = @(
        "Text.html", "TextFont.html",
        "Text0A.svg", "Text0B.svg", "Text1.svg", "Text2.svg", 
        "Text3.svg", "Text4.svg", "Text5.svg", "Text6.svg", 
        "Text7.svg", "Text8.svg"
    )
    "route" = @(
        "Route.html", "Route1.svg", "Route2.svg", "Route3.svg", 
        "Route4.svg", "Route5.svg",
        "MainRoadShape.html", "MinorRoadShape1.svg", 
        "MinorRoadShape2.svg", "MinorRoadShape3.svg"
    )
}

# Move files to their proper folders
foreach ($category in $fileMappings.Keys) {
    Write-Host "`nMoving files to $category folder..." -ForegroundColor Cyan
    
    foreach ($file in $fileMappings[$category]) {
        $sourcePath = "$symbolsDir\$file"
        $destPath = "$hintsDir\$category\$file"
        
        if (Test-Path $sourcePath) {
            try {
                Move-Item -Path $sourcePath -Destination $destPath -Force
                Write-Host "  Moved: $file" -ForegroundColor Green
            }
            catch {
                Write-Host "  Error moving $file`: $_" -ForegroundColor Red
            }
        }
        else {
            Write-Host "  File not found: $file" -ForegroundColor Yellow
        }
    }
}

# Create README files for each new folder
$readmeContent = @{
    "divider" = @"
# Divider Hints

This folder contains hint files for divider-related components:
- GantryDivider: Horizontal dividers for gantry signs
- StackDivider: Dividers for stacked sign layouts  
- LaneLine: Lane line dividers

## File Structure
- .html files contain the hint content
- .svg files contain visual examples and diagrams
"@

    "border" = @"
# Border Hints

This folder contains hint files for border and panel components:
- ExitBorder: Exit sign border styles
- FlagBorder: Flag-style borders
- StackBorder: Borders for stacked layouts
- Panel: Basic panel borders
- GreenPanel: Green background panels

## File Structure
- .html files contain the hint content
- .svg files contain visual examples and diagrams
"@

    "text" = @"
# Text Hints

This folder contains hint files for text-related components:
- Text: General text placement and styling
- TextFont: Font selection and formatting guidelines

## File Structure
- .html files contain the hint content
- .svg files contain visual examples of text layouts
"@

    "route" = @"
# Route Hints

This folder contains hint files for route and road shape components:
- Route: Route numbering and placement
- MainRoadShape: Main road shape indicators
- MinorRoadShape: Minor road and junction shapes

## File Structure
- .html files contain the hint content
- .svg files contain visual examples and diagrams
"@
}

# Create README files
foreach ($category in $readmeContent.Keys) {
    $readmePath = "$hintsDir\$category\README.md"
    Set-Content -Path $readmePath -Value $readmeContent[$category] -Encoding UTF8
    Write-Host "Created README.md in $category folder" -ForegroundColor Green
}

# Update the main hints README.md
$mainReadmeContent = @"
# Hints Folder Structure

This folder contains hint files organized by component type:

## Folder Structure

- **symbols/** - Symbol components (Airport, Hospital, Parking, etc.)
- **divider/** - Divider and line components (GantryDivider, StackDivider, LaneLine)
- **border/** - Border and panel components (ExitBorder, Panel, etc.)
- **text/** - Text-related components (Text formatting, fonts)
- **route/** - Route and road shape components (Route numbers, road shapes)
- **buttons/** - UI button hints (currently empty)
- **templates/** - Template hints (currently empty)
- **tools/** - Tool-specific hints (currently empty)

## File Types

- **.html** files contain the hint content displayed in tooltips
- **.svg** files contain visual examples and diagrams
- **.css** files contain styling for hint displays

## Usage

Hints are automatically loaded by the HintLoader utility when users hover over UI elements. The path structure should match the component organization in the application.

## Adding New Hints

1. Create the .html file in the appropriate category folder
2. Include any supporting .svg files in the same folder
3. Follow the existing HTML structure and styling conventions
4. Test the hint display in the application

## Last Updated

$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

Set-Content -Path "$hintsDir\README.md" -Value $mainReadmeContent -Encoding UTF8
Write-Host "`nUpdated main README.md" -ForegroundColor Green

# Display final status
Write-Host "`n" + "="*50 -ForegroundColor Magenta
Write-Host "ORGANIZATION COMPLETE!" -ForegroundColor Green
Write-Host "="*50 -ForegroundColor Magenta

# Show what's left in symbols folder (should be actual symbols only)
Write-Host "`nRemaining files in symbols folder:" -ForegroundColor Cyan
Get-ChildItem "$symbolsDir\*" -Name | Sort-Object

Write-Host "`nFolder structure created:" -ForegroundColor Cyan
Get-ChildItem "$hintsDir" -Directory | ForEach-Object {
    $fileCount = (Get-ChildItem $_.FullName -File).Count
    Write-Host "  $($_.Name)/ ($fileCount files)" -ForegroundColor White
}

Write-Host "`nHint folder organization completed successfully!" -ForegroundColor Green
