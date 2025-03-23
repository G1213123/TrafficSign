// CanvasTracker utility for tracking canvas operations
(function(window) {
    class CanvasTracker {
        constructor() {
            this.history = [];
        }

        track(action, params) {
            this.history.push({
                timestamp: new Date().toISOString(),
                action,
                params
            });
        }

        replay(canvas) {
            this.history.forEach(entry => {
                const { action, params } = entry;
                if (typeof canvas[action] === 'function') {
                    canvas[action](...params);
                } else {
                    console.warn(`Action ${action} is not a function on the canvas object.`);
                }
            });
        }

        clearHistory() {
            this.history = [];
        }
    }

    // Add to the global scope
    window.CanvasTracker = CanvasTracker;
})(window);