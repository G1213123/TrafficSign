# Current Structure Spec

## 1. Purpose

This project is a Fabric.js-based road-sign designer built around a Next.js + React design shell. The active designer UI is served from the `/design` route, and the root route redirects there.

The application is designed to let a user:

- create and edit traffic-sign objects on a canvas,
- manipulate objects with keyboard, mouse, and touch input,
- configure borders, text, route layouts, dimensions, and templates,
- persist settings and canvas state,
- import and export sign layouts.

---

## 2. App shape

### 2.1 Entry points

- `app/page.tsx`
  - root route
  - redirects to `/design`

- `app/design/page.js`
  - main design screen
  - loads fonts,
  - suppresses the browser context menu,
  - mounts the canvas editor and design panels,
  - renders the full design shell

- `app/design/layout.js`
  - wraps the design route in the i18n provider
  - provides the route-level application shell

### 2.2 Design shell composition

The main design page composes the following runtime blocks:

- `CanvasEditor`
- `Sidebar`
- `Objects List`
- `ContextMenu`
- `PromptBox`
- `PropertyPanel`
- `ToastBox`

These components work together to provide the editor shell and interaction layer.

---

## 3. Runtime boot flow

### 3.1 Canvas bootstrap

`app/design/components/canvas/CanvasEditor.js` owns the Fabric canvas lifecycle.

Responsibilities:

- creates the Fabric canvas instance via `new Canvas('canvas', { ... })`
- initializes the shared canvas registry through `initCanvasGlobals(canvas)`
- binds keyboard, mouse, touch, and context-menu handlers
- initializes the property panel
- loads saved settings and canvas state
- draws the grid and resizes the canvas when the viewport changes
- disposes the canvas cleanly on unmount

### 3.2 Shared canvas state

`app/design/components/canvas/canvas.js` defines `CanvasGlobals`, which acts as the central runtime registry for canvas operations.

Key fields include:

- `canvas`
- `ctx`
- `activeObject`
- `activeVertex`
- `canvasObject`
- `canvasInteractionLocked`
- `CenterCoord`
- `scheduleRender`

This registry is used by object logic, panels, and interaction handlers to coordinate editing behavior.

---

## 4. Settings and persistence model

The settings system is centralized in `app/design/lib/utils/settings.js`.

### 4.1 Storage keys

- `appSettings` for application settings
- `canvasState` for compact canvas state snapshots
- `canvasObjects` for serialized scene objects

### 4.2 Default settings

The default configuration includes:

- `showTextBorders`
- `showObjectBorders`
- `showGrid`
- `snapToGrid`
- `backgroundColor`
- `gridColor`
- `gridSize`
- `showAllVertices`
- `autoSave`
- `autoSaveInterval`
- `defaultExportScale`
- `runTestsOnStart`
- `xHeight`
- `messageColor`
- `dimensionUnit`
- `locale`

### 4.3 Live state updates

`GeneralSettings` provides the app-wide configuration API:

- `addListener()` / `notifyListeners()`
- `updateSetting()`
- `resetSetting()`
- `saveSettings()`
- `loadSettings()`
- `saveCanvasState()` / `clearSavedCanvas()` / `loadCanvasState()`
- `applyTextBorderSettings()`
- `applyGridSettings()`
- `applyVertexDisplaySettings()`
- `refreshDimensionDisplays()`

This singleton is the main source of persistence, rehydration, and UI synchronization.

---

## 5. Sidebar architecture

### 5.1 Structural model

`app/design/components/sidebars/Sidebar.js` defines the main slide-out sidebar and tab system.

Current tabs include:

- Draw Symbol
- Add Text
- Add Border
- Add Route Map
- Measure Tool
- Template Signs
- Import/Export
- History Tracker
- Information
- Settings

### 5.2 Panel modules

The current app organizes panel logic into component files under `app/design/components/sidebars/`:

- `BorderPanel.js`
- `CanvasObjectList.js`
- `ExportPanel.js`
- `InfoPanel.js`
- `MeasurePanel.js`
- `RouteMapPanel.js`
- `SettingsPanel.js`
- `Sidebar.js`
- `SymbolPanel.js`
- `TemplatePanel.js`
- `TextPanel.js`
- `TrackerPanel.js`

These panels manage the UI controls and invoke the shared canvas/object logic when the user edits or creates sign elements.

---

## 6. Object model and drawing pipeline

### 6.1 Core object logic

The sign-building system is centered on Fabric-based object modules under `app/design/lib/objects/`.

Key modules include:

- `anchor.js`
- `BaseGroup.js`
- `border.js`
- `build.js`
- `divider.js`
- `draw.js`
- `mainRoute.js`
- `path.js`
- `sideRoute.js`
- `symbols.js`
- `text.js`
- `vertex.js`

These modules define how sign geometry is created, edited, aggregated, and serialized.

### 6.2 Template generation

Templates are split across two layers:

- `app/design/components/sidebars/TemplatePanel.js` for the UI gallery
- `app/design/lib/templates/signTemplate.js` for actual sign construction logic

The template system creates full sign arrangements based on the selected template and canvas center point.

### 6.3 Rehydration and import pipeline

The current import/export flow is implemented in:

- `app/design/lib/utils/settings.js`
- `app/design/lib/objects/build.js`

It supports:

- serializing canvas objects to JSON,
- clearing the active scene safely,
- importing saved scenes or external JSON payloads,
- processing versioned upgrades when metadata is present.

---

## 7. Presentation layer

The current UI includes the following presentation modules:

- `app/design/components/presentations/contexMenu.js`
- `app/design/components/presentations/property.js`
- `app/design/components/presentations/promptBox.js`
- `app/design/components/presentations/ToastBox.js`
- `app/design/components/presentations/inspector.js`

These components handle:

- context menu behavior,
- object selection and property inspection,
- prompt/modals for user input,
- toast notifications,
- refresh behavior after object changes.

---

## 8. Export and file generation

The export logic is in `app/design/lib/exportUtils/`.

The current build includes support for:

- DXF generation,
- PDF generation,
- Fabric-based scene export,
- serialization of canvas objects for save/load workflows.

Dependencies used for this layer include:

- `dxf-writer`
- `jspdf`
- `fabric`

---

## 9. Current architecture contract

The current application should be understood as a layered system with four primary responsibilities:

- React shell for UI orchestration
- Fabric canvas runtime for rendering and interaction
- shared object model for sign geometry and editing logic
- settings/persistence layer for app state and saved designs

This is the stable architecture boundary for active development.

---

## 10. Maintainability guidance

The current build is most maintainable when the following boundaries are preserved:

- React components remain UI wrappers and panel controllers,
- canvas mutation stays inside Fabric/object helper modules,
- configuration and persistence remain in `GeneralSettings`,
- scene import/export remains centralized and version-aware,
- shared runtime state stays in `CanvasGlobals` rather than ad hoc component-local state.

---

## 11. Summary

The current build is a React-based editor shell around a Fabric sign-construction engine. It is structured around a central canvas runtime, object model, settings singleton, and sidebar-driven editing flows, with the active application logic residing in `app/design` and the root-level app simply redirecting to the design route.
