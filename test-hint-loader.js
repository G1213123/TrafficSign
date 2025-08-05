// Test HintLoader button mapping functionality
import { HintLoader } from './js/utils/hintLoader.js';

console.log('Testing HintLoader button mapping...');

// Test 1: Add a button mapping
HintLoader.setButtonHintMappings({
  'Main Road Shape-container': 'symbols/MainRoadShape',
  'button-Airport': 'symbols/Airport'
});

console.log('Mappings set:', HintLoader.getButtonHintMappings());

// Test 2: Check if mapping exists
console.log('Has Main Road Shape mapping:', HintLoader.hasButtonHintMapping('Main Road Shape-container'));
console.log('Has Airport mapping:', HintLoader.hasButtonHintMapping('button-Airport'));

// Test 3: Get cache stats
console.log('Cache stats:', HintLoader.getCacheStats());

console.log('All tests completed successfully!');
