# Import Structure

This note records the object/module import shape in the design editor and the cycle that was removed.

## Object Graph

- `build.js` creates objects from serialized data.
- `symbols.js` defines `SymbolObject` and depends on `BaseGroup`, `draw.js`, `template.js`, and `path.js`.
- `draw.js` depends on object helpers such as `anchor.js`, `vertex.js`, `lock.js`, `dimension.js`, and `property.js`.
- `anchor.js` depends on `promptBox.js` and the keyboard layer for shared sidebar toggle handling.
- `keyboardEvents.js` now owns keyboard registration and lazily imports `build.js` only inside paste handling.

## Cycle Removed

Before the refactor, the import chain was:

`build.js -> symbols.js -> draw.js -> anchor.js -> keyboardEvents.js -> build.js`

That caused `SymbolObject` to be accessed before initialization while `build.js` was still evaluating.

## Current Rule

- The keyboard layer must not statically import the object builder.
- Object reconstruction should be loaded lazily from user actions that actually need it.
- Shared editor listeners should be mounted from the React canvas lifecycle, not at module import time.
