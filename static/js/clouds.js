document.addEventListener('DOMContentLoaded', function() {
    // Create clouds container
    const cloudsContainer = document.createElement('div');
    cloudsContainer.className = 'clouds-container';
    document.body.appendChild(cloudsContainer);
    
    // Create clouds
    const cloudCount = 6;
    for (let i = 0; i < cloudCount; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloudsContainer.appendChild(cloud);
    }
    
    // Additional cloud creation for more variety
    function createExtraCloud() {
        if (cloudsContainer.children.length > 12) return; // Limit to 12 clouds max
        
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        // Randomize cloud position and size
        const top = Math.random() * 85; // Random position between 0-85% from top
        const scale = 0.7 + Math.random() * 0.6; // Random scale between 0.7 and 1.3
        const delay = Math.random() * 20; // Random delay
        const duration = 80 + Math.random() * 60; // Random duration between 80s and 140s
        
        cloud.style.top = `${top}%`;
        cloud.style.transform = `scale(${scale})`;
        cloud.style.animationDelay = `${delay}s`;
        cloud.style.animationDuration = `${duration}s`;
        
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
    
    // Create extra clouds occasionally
    setInterval(createExtraCloud, 20000); // Create a new cloud every 20 seconds
    
    // Create a few extra clouds immediately
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            createExtraCloud();
        }, i * 5000); // Stagger the creation
    }
});