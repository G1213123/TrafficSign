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
        if (this.id === 'show_hide') { // Check if the element is the #show_hide button
            return; // Do not show tooltip for this button
        }
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
        tooltip.className = 'tooltip'; // Keep the base class

        const rect = this.getBoundingClientRect();
        const tooltipHeight = tooltip.offsetHeight;
        const tooltipWidth = tooltip.offsetWidth;
        const mobileBreakpoint = 768; // Define a breakpoint for mobile
        const viewportWidth = window.innerWidth;
        const viewportPadding = 5; // Small padding from viewport edges

        if (window.innerWidth <= mobileBreakpoint) {
            // Mobile: Position tooltip above the element, arrow pointing down
            let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            let top = rect.top - tooltipHeight - 10; // 10px spacing above

            // Adjust for viewport overflow
            if (left < viewportPadding) {
                left = viewportPadding;
            }
            if (left + tooltipWidth > viewportWidth - viewportPadding) {
                left = viewportWidth - tooltipWidth - viewportPadding;
            }

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
            tooltip.classList.add('tooltip-arrow-bottom');
        } else {
            // Desktop: Attempt to position to the right first
            let left = rect.right + 10;
            let top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            let arrowClass = 'tooltip-arrow-left'; // Arrow points left when tooltip is on the right

            // Check if positioning to the right causes overflow
            if (left + tooltipWidth > viewportWidth - viewportPadding) {
                // If overflows right, try positioning to the left
                left = rect.left - tooltipWidth - 10;
                arrowClass = 'tooltip-arrow-right'; // Arrow points right when tooltip is on the left
            }

            // Adjust for left viewport overflow if positioned to the left
            if (left < viewportPadding) {
                left = viewportPadding;
                // If we had to adjust and it was meant to be on the left, 
                // it might be better to switch back to right if possible, 
                // but that adds complexity. For now, just ensure it's not off-screen.
                // If it was originally trying to be on the right and got pushed here, 
                // it might mean the element itself is too close to the left for left-side tooltip.
            }
            
            // Ensure top position is within viewport (simple check)
            if (top < viewportPadding) {
                top = viewportPadding;
            }
            if (top + tooltipHeight > window.innerHeight - viewportPadding) {
                top = window.innerHeight - tooltipHeight - viewportPadding;
            }

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
            tooltip.classList.add(arrowClass);
        }
    }
});
