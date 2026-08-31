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

2025-08-10 20:00:50
