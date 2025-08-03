# Hint System Documentation

This directory contains standalone HTML hint files that are dynamically loaded by the application's tooltip system.

## Directory Structure

```
hints/
├── symbols/          # Symbol button hints
│   ├── Airport.html
│   ├── Hospital.html
│   └── Parking.html
├── buttons/          # General UI button hints
├── templates/        # Template-related hints
├── tools/           # Tool-specific hints
└── README.md        # This file
```

## Creating New Hints

### For Symbol Buttons

1. Create a new HTML file in `hints/symbols/` with the exact symbol name (e.g., `Bridge.html`)
2. Include only the HTML content (no `<html>`, `<head>`, or `<body>` tags)
3. The tooltip system will automatically load and display the hint

Example symbol hint file (`symbols/Restaurant.html`):
```html
<h4>Restaurant Symbol</h4>
<p>Add a restaurant symbol to indicate dining facilities on your directional sign.</p>
<ul>
    <li>Click to place the symbol</li>
    <li>Use vertex controls for positioning</li>
    <li>Customize size and color</li>
</ul>
<p><strong>Note:</strong> Standard dining facility indicator for highway signs.</p>
```

### For Other UI Elements

Follow the same pattern but use appropriate subdirectories:
- `buttons/draw.html` - Hint for the draw button
- `tools/measure.html` - Hint for the measure tool
- `templates/gantry.html` - Hint for gantry template

## HTML Guidelines

1. **Keep it lightweight**: Only include necessary HTML content
2. **Use semantic markup**: `<h4>` for titles, `<p>` for paragraphs, `<ul>/<li>` for lists
3. **Include styling elements**: Use `<strong>`, `<em>` for emphasis
4. **No external dependencies**: Don't reference external CSS or JS files
5. **Mobile-friendly**: Keep content concise for mobile tooltips

## Supported HTML Tags

The tooltip system supports most standard HTML tags:
- Headers: `<h4>`, `<h5>`, `<h6>`
- Text: `<p>`, `<span>`, `<strong>`, `<em>`
- Lists: `<ul>`, `<ol>`, `<li>`
- Links: `<a>` (though use sparingly in tooltips)
- Code: `<code>`, `<pre>`

## Loading Behavior

- Hints are loaded dynamically when first needed
- Successfully loaded hints are cached for performance
- Missing hint files fail gracefully (show fallback message)
- Network errors are handled gracefully

## Development Tips

1. **Test locally**: Ensure your hint files load correctly in the browser
2. **Check console**: Look for loading errors during development
3. **Cache clearing**: The HintLoader includes cache management for development
4. **File naming**: Use exact symbol/button names for automatic matching

## Performance Considerations

- Hints are loaded on-demand (not on page load)
- Successful loads are cached to avoid repeated requests
- Failed loads are not retried to prevent network spam
- Small file sizes recommended for better user experience
