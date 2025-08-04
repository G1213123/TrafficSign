/**
 * Example usage of the enhanced HintLoader
 * This file demonstrates how to use the HintLoader with automatic CSS loading
 */

import { HintLoader } from './js/utils/hintLoader.js';

// Example 1: Basic hint loading
async function loadBasicHint() {
  try {
    console.log('Loading Airport hint...');
    const content = await HintLoader.loadHint('symbols/Airport');
    
    if (content) {
      console.log('✅ Hint loaded successfully!');
      console.log('📄 Content length:', content.length, 'characters');
      
      // Display the hint in a container
      const container = document.getElementById('hint-container');
      if (container) {
        container.innerHTML = content;
      }
    } else {
      console.log('❌ Hint not found');
    }
  } catch (error) {
    console.error('❌ Error loading hint:', error);
  }
}

// Example 2: Preload multiple hints
async function preloadHints() {
  try {
    console.log('Preloading hints...');
    await HintLoader.preloadHints([
      'symbols/Airport',
      'symbols/Hospital',
      'symbols/Parking',
      'symbols/StackArrow'
    ]);
    
    console.log('✅ All hints preloaded!');
    console.log('📊 Cache stats:', HintLoader.getCacheStats());
  } catch (error) {
    console.error('❌ Error preloading hints:', error);
  }
}

// Example 3: Development testing
async function runDevelopmentTests() {
  console.log('🧪 Running development tests...');
  
  // Clear cache first
  HintLoader.clearCache();
  
  // Run tests
  const results = await HintLoader.runTests();
  
  console.log(`✅ Tests passed: ${results.passed}`);
  console.log(`❌ Tests failed: ${results.failed}`);
  
  // Log detailed results
  results.tests.forEach((test, index) => {
    const status = test.passed ? '✅' : '❌';
    console.log(`${status} Test ${index + 1} (${test.name}): ${test.message}`);
  });
  
  return results;
}

// Example 4: Manual CSS loading (usually not needed)
async function ensureCSS() {
  try {
    console.log('Ensuring CSS is loaded...');
    await HintLoader.ensureCSSLoaded();
    console.log('✅ CSS is ready!');
    
    const stats = HintLoader.getCacheStats();
    console.log('📊 CSS loaded:', stats.cssLoaded);
  } catch (error) {
    console.error('❌ Error loading CSS:', error);
  }
}

// Example 5: Interactive hint display
function createInteractiveExample() {
  const container = document.createElement('div');
  container.innerHTML = `
    <h3>HintLoader Interactive Example</h3>
    <div style="margin: 10px 0;">
      <button id="load-airport">Load Airport Hint</button>
      <button id="load-hospital">Load Hospital Hint</button>
      <button id="preload-all">Preload All Hints</button>
      <button id="run-tests">Run Tests</button>
      <button id="show-stats">Show Stats</button>
    </div>
    <div id="hint-display" style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; min-height: 100px; background: #2f2f2f; color: white;">
      Hint content will appear here...
    </div>
    <pre id="stats-display" style="background: #f5f5f5; padding: 10px; margin: 10px 0; font-size: 12px;"></pre>
  `;
  
  // Add event listeners
  container.querySelector('#load-airport').addEventListener('click', async () => {
    const content = await HintLoader.loadHint('symbols/Airport');
    container.querySelector('#hint-display').innerHTML = content || 'Hint not found';
  });
  
  container.querySelector('#load-hospital').addEventListener('click', async () => {
    const content = await HintLoader.loadHint('symbols/Hospital');
    container.querySelector('#hint-display').innerHTML = content || 'Hint not found';
  });
  
  container.querySelector('#preload-all').addEventListener('click', async () => {
    await preloadHints();
    container.querySelector('#hint-display').innerHTML = 'All hints preloaded! Check console for details.';
  });
  
  container.querySelector('#run-tests').addEventListener('click', async () => {
    const results = await runDevelopmentTests();
    container.querySelector('#hint-display').innerHTML = `Tests completed: ${results.passed} passed, ${results.failed} failed`;
  });
  
  container.querySelector('#show-stats').addEventListener('click', () => {
    const stats = HintLoader.getCacheStats();
    container.querySelector('#stats-display').textContent = JSON.stringify(stats, null, 2);
  });
  
  return container;
}

// Export functions for use
window.HintLoaderExamples = {
  loadBasicHint,
  preloadHints,
  runDevelopmentTests,
  ensureCSS,
  createInteractiveExample
};

// Auto-run example if this script is loaded directly
if (typeof window !== 'undefined') {
  console.log('🎯 HintLoader examples loaded!');
  console.log('💡 Try: HintLoaderExamples.runDevelopmentTests()');
  console.log('🎮 Or: document.body.appendChild(HintLoaderExamples.createInteractiveExample())');
}
