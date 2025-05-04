document.addEventListener('DOMContentLoaded', function() {
    // Add a page transition overlay
    const overlay = document.createElement('div');
    overlay.classList.add('page-transition-overlay');
    document.body.appendChild(overlay);
    
    // Create style for the overlay
    const style = document.createElement('style');
    style.textContent = `
        .page-transition-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #8a2be2;
            z-index: 10000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.5s ease;
        }
        
        .page-transition-overlay.active {
            opacity: 1;
            pointer-events: all;
        }
    `;
    document.head.appendChild(style);
    
    // Apply the transition to all internal links
    const internalLinks = document.querySelectorAll('a[href^="/"]:not([target="_blank"])');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Ignore links with # (hash) that are likely in-page anchors
            if (this.getAttribute('href').includes('#')) {
                return;
            }
            
            e.preventDefault();
            const targetHref = this.getAttribute('href');
            
            // Show the overlay
            overlay.classList.add('active');
            
            // Navigate to the new page after the overlay transition
            setTimeout(() => {
                window.location.href = targetHref;
            }, 500);
        });
    });
    
    // Handle browser back button
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            // Page was restored from the bfcache
            overlay.classList.remove('active');
        }
    });
    
    // Hide the overlay when the page loads
    setTimeout(() => {
        overlay.classList.remove('active');
    }, 100);
});