document.addEventListener('DOMContentLoaded', function() {
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

    // Add event listeners to all elements with data-tooltip attribute
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('mousemove', moveTooltip);
    });

    function showTooltip(e) {
        const tooltipText = this.getAttribute('data-tooltip');
        tooltip.textContent = tooltipText;
        tooltip.style.opacity = '1';
        moveTooltip.call(this, e);
    }

    function hideTooltip() {
        tooltip.style.opacity = '0';
    }

    function moveTooltip(e) {
        // Reset classes first
        tooltip.className = 'tooltip';
        
        // Position the tooltip to the right of the element
        const rect = this.getBoundingClientRect();
        const tooltipHeight = tooltip.offsetHeight;
        
        // Right side positioning
        const left = rect.right + 10; // 10px spacing from the element
        const top = rect.top + (rect.height / 2) - (tooltipHeight / 2); // Center vertically
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        
        // Add class to show arrow on left side
        tooltip.classList.add('tooltip-right');
    }
});
