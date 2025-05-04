document.addEventListener('DOMContentLoaded', function() {
    // Add page entrance animations
    const pageElements = document.querySelectorAll('.main-container > *');
    pageElements.forEach((element, index) => {
        // Skip elements that already have animation classes
        if (!element.classList.contains('fade-in-delay') && 
            !element.classList.contains('fade-in-delay-2')) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 + (index * 200));
        }
    });
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.03)';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Add ripple effect to buttons
    function createRipple(event) {
        const button = event.currentTarget;
        
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.querySelector('.ripple');
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
    }
    
    const rippleButtons = document.querySelectorAll('.btn:not(.btn-feeling)');
    rippleButtons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // Add sparkle cursor effect
    createSparkleContainer();
    
    function createSparkleContainer() {
        const sparkleStyle = document.createElement('style');
        sparkleStyle.textContent = `
            .sparkle-cursor {
                pointer-events: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
            }
            .sparkle {
                position: absolute;
                pointer-events: none;
                width: 6px;
                height: 6px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                filter: blur(1px);
                animation: sparkle-fade 1s ease forwards;
            }
            @keyframes sparkle-fade {
                0% {
                    opacity: 1;
                    transform: scale(0) rotate(0deg);
                }
                100% {
                    opacity: 0;
                    transform: scale(1.5) rotate(45deg);
                }
            }
        `;
        document.head.appendChild(sparkleStyle);
        
        // Create sparkle container
        const sparkleContainer = document.createElement('div');
        sparkleContainer.classList.add('sparkle-cursor');
        document.body.appendChild(sparkleContainer);
        
        // Track mouse movement and create sparkles
        document.addEventListener('mousemove', function(e) {
            // Only create sparkle for some mouse movements to avoid too many elements
            if (Math.random() > 0.85) {
                createSparkle(e.clientX, e.clientY, sparkleContainer);
            }
        });
    }
    
    function createSparkle(x, y, container) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        
        // Randomize sparkle properties
        const size = Math.random() * 5 + 4;
        const colorHue = Math.random() * 360;
        
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        sparkle.style.background = `hsla(${colorHue}, 100%, 70%, 0.8)`;
        
        container.appendChild(sparkle);
        
        // Remove sparkle after animation completes
        setTimeout(() => {
            if (sparkle.parentElement) {
                sparkle.remove();
            }
        }, 1000);
    }
    
    // Add pulse effect on click for interactive elements
    const interactiveElements = document.querySelectorAll('a, .btn, .nav-link');
    interactiveElements.forEach(element => {
        element.addEventListener('click', function(e) {
            // Create pulse effect
            const pulse = document.createElement('div');
            pulse.style.position = 'fixed';
            pulse.style.left = `${e.clientX}px`;
            pulse.style.top = `${e.clientY}px`;
            pulse.style.width = '10px';
            pulse.style.height = '10px';
            pulse.style.borderRadius = '50%';
            pulse.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
            pulse.style.zIndex = '9999';
            pulse.style.transform = 'translate(-50%, -50%)';
            pulse.style.animation = 'pulse-click 0.5s ease-out';
            
            document.body.appendChild(pulse);
            
            setTimeout(() => {
                pulse.remove();
            }, 500);
        });
    });
    
    // Add CSS for ripple and pulse effects
    const style = document.createElement('style');
    style.textContent = `
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            background-color: rgba(255, 255, 255, 0.7);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes pulse-click {
            0% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(15);
            }
        }
        
        .highlight-pulse {
            animation: highlight-pulse 1.5s infinite;
        }
        
        @keyframes highlight-pulse {
            0% {
                text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
            }
            50% {
                text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
            }
            100% {
                text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add subtle float animation to various elements
    const floatElements = document.querySelectorAll('.message-box, .compliment-box, .birthday-message-box');
    floatElements.forEach(element => {
        // Add a slight floating animation
        element.style.animation = `floating ${3 + Math.random() * 2}s ease-in-out infinite`;
    });
    
    // Add floating animation style
    const floatStyle = document.createElement('style');
    floatStyle.textContent = `
        @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
        }
    `;
    document.head.appendChild(floatStyle);
});
