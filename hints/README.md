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
├── hints.css        # Shared CSS for consistent styling
├── hintLoader-examples.js # Example usage and testing
└── README.md        # This file
```

## Creating New Hints

### For Symbol Buttons

1. Create a new HTML file in `hints/symbols/` with the exact symbol name (e.g., `Bridge.html`)
2. Include only the HTML content (no `<html>`, `<head>`, or `<body>` tags)
3. The tooltip system will automatically load and display the hint

Example symbol hint file (`symbols/Restaurant.html`):
```html
<link rel="stylesheet" href="../hints.css">

<div class="hint-container">
  <h4>Restaurant Symbol</h4>
  <p>Add a restaurant symbol to indicate dining facilities on your directional sign.</p>
  
  <div class="hint-section">
    <h5>Symbol Features:</h5>
    <div class="hint-features">
      <ul>
        <li>Click to place the symbol</li>
        <li>Use vertex controls for positioning</li>
        <li>Customize size and color</li>
      </ul>
    </div>
  </div>
  
  <p><strong>Note:</strong> Standard dining facility indicator for highway signs.</p>
</div>
```

### For Other UI Elements

Follow the same pattern but use appropriate subdirectories:
- `buttons/draw.html` - Hint for the draw button
- `tools/measure.html` - Hint for the measure tool
- `templates/gantry.html` - Hint for gantry template

## HTML Guidelines

1. **Include CSS reference**: Start each hint file with `<link rel="stylesheet" href="../hints.css">` (or appropriate relative path)
2. **Keep it lightweight**: Only include necessary HTML content
3. **Use semantic markup**: `<h4>` for titles, `<p>` for paragraphs, `<ul>/<li>` for lists
4. **Leverage CSS classes**: Use `.reference` for TPDM references, `.placement-section` for sections
5. **Include styling elements**: Use `<strong>`, `<em>` for emphasis
6. **Mobile-friendly**: Keep content concise for mobile tooltips

## Supported HTML Tags

The tooltip system supports most standard HTML tags:
- Headers: `<h4>`, `<h5>`, `<h6>`
- Text: `<p>`, `<span>`, `<strong>`, `<em>`
- Lists: `<ul>`, `<ol>`, `<li>`
- Links: `<a>` (though use sparingly in tooltips)
- Code: `<code>`, `<pre>`

## Loading Behavior

- Hints are loaded dynamically when first needed using the `HintLoader` utility
- **CSS is automatically loaded**: The first time any hint is requested, `hints.css` is loaded
- Successfully loaded hints are cached for performance
- Missing hint files fail gracefully (show fallback message)
- Network errors are handled gracefully
- CSS links in HTML files are automatically stripped (since CSS is loaded separately)

## Development Tips

1. **Test locally**: Ensure your hint files load correctly in the browser
2. **Check console**: Look for loading errors during development  
3. **Use the test function**: Run `HintLoader.runTests()` to verify functionality
4. **Try the examples**: Load `hintLoader-examples.js` for interactive testing
5. **Cache clearing**: The HintLoader includes cache management for development
6. **File naming**: Use exact symbol/button names for automatic matching

### Testing HintLoader

```javascript
// Run built-in tests
const results = await HintLoader.runTests();

// Or load the examples file for interactive testing
// <script src="hints/hintLoader-examples.js"></script>
// Then use: HintLoaderExamples.createInteractiveExample()
```

## CSS Classes Available

The `hints.css` file provides these useful classes:
- `.reference` - For TPDM/standards references (italic, smaller text)
- `.placement-section` - For content sections with proper spacing
- `.placement-example` - Container for example images
- `.height-constrained` - For images that should use fixed height instead of width
- `.feature-list` - For styled feature lists

## HintLoader API

The `HintLoader` class provides several methods for managing hint loading:

```javascript
import { HintLoader } from '../utils/hintLoader.js';

// Load a single hint
const content = await HintLoader.loadHint('symbols/Airport');

// Preload multiple hints
await HintLoader.preloadHints(['symbols/Airport', 'symbols/Hospital']);

// Ensure CSS is loaded (called automatically by loadHint)
await HintLoader.ensureCSSLoaded();

// Get cache statistics
const stats = HintLoader.getCacheStats();
console.log(stats); // { cached: 3, loading: 0, cssLoaded: true, entries: [...] }

// Clear cache for development
HintLoader.clearCache();

// Force reload CSS for development
HintLoader.reloadCSS();
```

### Key Features:
- **Automatic CSS loading**: CSS is loaded once when first hint is requested
- **Intelligent caching**: Hints and CSS are cached to avoid duplicate requests
- **Promise-based**: All methods return promises for async handling
- **Development helpers**: Cache clearing and CSS reloading for development
- **Error handling**: Graceful handling of missing files or network errors

Use these classes instead of inline styles for consistent appearance.

## Performance Considerations

- Hints are loaded on-demand (not on page load)
- Successful loads are cached to avoid repeated requests
- Failed loads are not retried to prevent network spam
- Small file sizes recommended for better user experience
