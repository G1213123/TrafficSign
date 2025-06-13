# Testing Guide for Traffic Sign Application

This project uses **Jest** as the testing framework for JavaScript unit and integration tests.

## Setup

The testing framework has been configured with the following components:

### Dependencies
- `jest` - Core testing framework
- `jest-environment-jsdom` - DOM environment for browser-like testing
- `jest-canvas-mock` - Mock canvas API for testing canvas operations
- `babel-jest` - Transform ES6 modules for Jest
- `@babel/core` & `@babel/preset-env` - Babel transpilation

### Configuration Files
- `jest.config.js` - Main Jest configuration
- `jest.setup.js` - Test setup and global mocks
- `babel.config.json` - Babel configuration for ES6 modules

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (automatically rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Test Files Location
- Main test directory: `/tests/`
- Individual module tests can also be placed alongside source files with `.test.js` extension

### Current Tests
- `tests/canvas.test.js` - Comprehensive tests for canvas.js module
- `tests/examples.test.js` - Example patterns for testing other modules
- `tests/testUtils.js` - Helper utilities for testing
- `tests/keyboardEvents.test.js` - Tests for keyboard event handling

## Current Test Coverage

### Canvas Module (`tests/canvas.test.js`)
- ✅ Canvas initialization and configuration
- ✅ CanvasGlobals exposure and structure  
- ✅ CenterCoord coordinate calculation
- ✅ Grid drawing system with zoom levels
- ✅ Grid visibility and customization
- ✅ Fabric.js integration and custom properties
- ✅ Edge cases and error handling

### Keyboard Events Module (`tests/keyboardEvents.test.js`)
- ✅ ESC key sidebar toggle functionality
- ✅ Arrow key object movement (up, down, left, right)
- ✅ Movement restrictions (lockMovementX/Y)
- ✅ Multiple object handling
- ✅ Delete key functionality with input field awareness
- ✅ Ctrl+S save shortcut
- ✅ Integration with CanvasGlobals
- ✅ Edge cases and error handling

### Test Statistics
- **Total Test Suites**: 3
- **Total Tests**: 50
- **All Passing**: ✅

## Canvas Testing

The canvas.js module tests cover:

### Core Functionality
- Canvas initialization and configuration
- CanvasGlobals exposure and structure
- CenterCoord coordinate calculation function

### Grid System
- Grid drawing with different zoom levels
- Grid visibility based on settings
- Grid color and size customization
- Origin line rendering
- Grid label display at appropriate zoom levels

### Edge Cases
- Undefined or missing GeneralSettings
- Extreme zoom values
- Canvas resize handling

### Fabric.js Integration
- Custom object property extensions
- Mock fabric.js for testing environment

## Writing New Tests

### Basic Test Structure
```javascript
import { YourModule } from '../js/path/to/module.js';

describe('Your Module', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  test('should do something specific', () => {
    // Arrange
    const input = 'test data';
    
    // Act
    const result = YourModule.someFunction(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

### Testing Canvas-Related Modules
```javascript
import { createMockCanvas } from './testUtils.js';

test('should interact with canvas correctly', () => {
  const mockCanvas = createMockCanvas();
  
  // Your test logic here
  expect(mockCanvas.add).toHaveBeenCalled();
});
```

### Mocking Fabric.js Objects
```javascript
test('should create fabric objects', () => {
  const mockRect = new global.fabric.Rect({
    width: 100,
    height: 50
  });
  
  expect(mockRect).toBeDefined();
});
```

## Testing Best Practices

### 1. Test Organization
- Group related tests using `describe()` blocks
- Use descriptive test names that explain what is being tested
- Test one specific behavior per test case

### 2. Mocking
- Mock external dependencies (DOM, fabric.js, etc.)
- Use `jest.clearAllMocks()` in `beforeEach()` to reset mock state
- Mock only what you need for the specific test

### 3. Assertions
- Test both happy path and edge cases
- Verify function calls with `toHaveBeenCalledWith()`
- Check object properties and return values
- Test error conditions when applicable

### 4. Coverage
- Aim for high test coverage but focus on critical functionality
- Use `npm run test:coverage` to see coverage reports
- Pay attention to branch coverage, not just line coverage

## Common Testing Patterns

### Testing Modules with Side Effects
```javascript
// For modules that execute code on import
describe('Module with side effects', () => {
  test('should handle module initialization', () => {
    // Import inside test if needed to control timing
    const { ModuleExport } = require('../js/module.js');
    expect(ModuleExport).toBeDefined();
  });
});
```

### Testing DOM Interactions
```javascript
test('should interact with DOM elements', () => {
  const mockElement = {
    clientWidth: 1000,
    clientHeight: 800
  };
  
  document.getElementById = jest.fn(() => mockElement);
  
  // Your test logic
  expect(document.getElementById).toHaveBeenCalledWith('canvas-container');
});
```

### Testing Event Handlers
```javascript
test('should handle events correctly', () => {
  const mockEvent = {
    preventDefault: jest.fn(),
    target: { value: 'test' }
  };
  
  // Call your event handler
  yourEventHandler(mockEvent);
  
  expect(mockEvent.preventDefault).toHaveBeenCalled();
});
```

## Troubleshooting

### Common Issues

1. **ES6 Import/Export Issues**
   - Ensure babel configuration is correct
   - Check that files use proper import/export syntax

2. **Canvas/DOM Related Errors**
   - Verify jest-canvas-mock is properly setup
   - Check that DOM elements are mocked in jest.setup.js

3. **Fabric.js Mock Issues**
   - Ensure all used fabric.js objects are mocked in jest.setup.js
   - Add new mocks as needed for additional fabric objects

4. **Module Not Found Errors**
   - Check file paths in imports
   - Verify moduleNameMapper in jest.config.js

### Adding New Module Tests

1. Create test file in `/tests/` directory with `.test.js` extension
2. Import the module you want to test
3. Add any necessary mocks to `jest.setup.js`
4. Write tests following the patterns shown in existing test files
5. Run tests to verify they work correctly

## Future Enhancements

- Add integration tests for complete user workflows
- Implement visual regression testing for canvas output
- Add performance testing for complex operations
- Consider adding E2E tests with tools like Playwright or Cypress
