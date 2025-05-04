document.addEventListener('DOMContentLoaded', function() {
    // Create clouds container
    const cloudsContainer = document.createElement('div');
    cloudsContainer.className = 'clouds-container';
    document.body.appendChild(cloudsContainer);
    
    // Create clouds
    const cloudCount = 10; // Increased from 6 to 10 for more visibility
    for (let i = 0; i < cloudCount; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        // Set initial positions and speeds
        const top = i * 10; // Space them out evenly
        const width = 180 + Math.random() * 100; // Vary the sizes
        const delay = i * 2; // Stagger the animations
        
        cloud.style.top = `${top}%`;
        cloud.style.width = `${width}px`;
        cloud.style.animationDelay = `${delay}s`;
        
        cloudsContainer.appendChild(cloud);
    }
    
    // Additional cloud creation for more variety
    function createExtraCloud() {
        if (cloudsContainer.children.length > 18) return; // Increased limit to 18 clouds max
        
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        // Randomize cloud position and size
        const top = Math.random() * 85; // Random position between 0-85% from top
        const scale = 0.7 + Math.random() * 0.6; // Random scale between 0.7 and 1.3
        const delay = Math.random() * 5; // Reduced random delay for faster initial appearance
        const duration = 60 + Math.random() * 40; // Faster animation (60-100s)
        
        cloud.style.top = `${top}%`;
        cloud.style.transform = `scale(${scale})`;
        cloud.style.animationDelay = `${delay}s`;
        cloud.style.animationDuration = `${duration}s`;
        
        // Adjust opacity for better visibility
        cloud.style.opacity = '0.8';
        
        cloudsContainer.appendChild(cloud);
        
        // Remove the cloud after animation completes
        setTimeout(() => {
            if (cloud && cloud.parentNode) {
                cloud.parentNode.removeChild(cloud);
            }
            // Create a new cloud to replace this one
            createExtraCloud();
        }, duration * 1000 + delay * 1000);
    }
    
    // Create extra clouds more frequently
    setInterval(createExtraCloud, 10000); // Create a new cloud every 10 seconds (was 20)
    
    // Create more extra clouds immediately
    for (let i = 0; i < 8; i++) { // Increased from 3 to 8
        setTimeout(() => {
            createExtraCloud();
        }, i * 1000); // Reduced delay between creation (was 5000)
    }
});