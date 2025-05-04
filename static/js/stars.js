document.addEventListener('DOMContentLoaded', function() {
    // Create stars container
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-container';
    document.body.appendChild(starsContainer);
    
    // Create initial stars
    const starCount = 50;
    
    for (let i = 0; i < starCount; i++) {
        createStar();
    }
    
    function createStar() {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size
        const size = 2 + Math.random() * 4;
        
        // Random animation delay
        const delay = Math.random() * 5;
        
        // Random animation duration
        const duration = 2 + Math.random() * 4;
        
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDelay = `${delay}s`;
        star.style.animationDuration = `${duration}s`;
        
        starsContainer.appendChild(star);
        
        // Remove stars occasionally to prevent performance issues
        if (starsContainer.children.length > 100) {
            const oldestStar = starsContainer.firstChild;
            if (oldestStar) {
                starsContainer.removeChild(oldestStar);
            }
        }
    }
    
    // Create new stars occasionally
    setInterval(() => {
        if (starsContainer.children.length < 100) {
            createStar();
        }
    }, 1000);
    
    // Create shooting star container
    const shootingStarsContainer = document.createElement('div');
    shootingStarsContainer.className = 'stars-container';
    document.body.appendChild(shootingStarsContainer);
    
    // Create occasional "shooting star" effect
    function createShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        
        // Random starting position at top of screen
        const startX = Math.random() * 30;
        const startY = Math.random() * 30;
        
        // Random size (slightly larger)
        const size = 4 + Math.random() * 3;
        
        // Set initial position
        shootingStar.style.left = `${startX}%`;
        shootingStar.style.top = `${startY}%`;
        shootingStar.style.width = `${size}px`;
        shootingStar.style.height = `${size}px`;
        
        // Set animation with random duration
        const duration = 2 + Math.random() * 3;
        shootingStar.style.animation = `shooting ${duration}s linear forwards`;
        
        // Add glow effect appropriate to the current page theme
        const pageTheme = document.body.className;
        let glowColor = 'rgba(255, 255, 255, 0.8)';
        
        if (pageTheme.includes('welcome-page')) {
            glowColor = 'rgba(138, 43, 226, 0.8)'; // Purple
        } else if (pageTheme.includes('feelings-page')) {
            glowColor = 'rgba(218, 112, 214, 0.8)'; // Orchid
        } else if (pageTheme.includes('happy-theme')) {
            glowColor = 'rgba(76, 175, 80, 0.8)'; // Green
        } else if (pageTheme.includes('sad-theme')) {
            glowColor = 'rgba(94, 129, 172, 0.8)'; // Blue
        } else if (pageTheme.includes('lonely-theme')) {
            glowColor = 'rgba(147, 112, 219, 0.8)'; // Purple
        } else if (pageTheme.includes('overwhelmed-theme')) {
            glowColor = 'rgba(229, 115, 115, 0.8)'; // Red
        } else if (pageTheme.includes('birthday-page')) {
            glowColor = 'rgba(255, 105, 180, 0.8)'; // Hot Pink
        }
        
        shootingStar.style.boxShadow = `0 0 20px 10px ${glowColor}`;
        
        shootingStarsContainer.appendChild(shootingStar);
        
        // Remove after animation completes
        setTimeout(() => {
            if (shootingStar.parentNode) {
                shootingStarsContainer.removeChild(shootingStar);
            }
        }, duration * 1000);
    }
    
    // Create occasional shooting stars (more frequently)
    setInterval(createShootingStar, 3000); // Every 3 seconds
    
    // Create a few shooting stars immediately
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            createShootingStar();
        }, 1000 + i * 1500);
    }
});