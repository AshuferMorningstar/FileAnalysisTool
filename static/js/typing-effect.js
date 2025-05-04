document.addEventListener('DOMContentLoaded', function() {
    // Add typing effect to message, compliment, and birthday message elements
    const typingElements = document.querySelectorAll('.message, .compliment, .birthday-message');
    
    typingElements.forEach(element => {
        // Skip if we already processed this element 
        if (element.getAttribute('data-typed') === 'true') return;
        
        // Store the original text
        const originalText = element.textContent;
        
        // Clear the element text
        element.textContent = '';
        
        // Set a flag to avoid reprocessing
        element.setAttribute('data-typed', 'true');
        
        // Create a blinking cursor element
        const cursor = document.createElement('span');
        cursor.classList.add('typing-cursor');
        cursor.textContent = '|';
        cursor.style.animation = 'blink 1s infinite';
        element.appendChild(cursor);
        
        // Add typing animation style if not already added
        if (!document.getElementById('typing-style')) {
            const style = document.createElement('style');
            style.id = 'typing-style';
            style.textContent = `
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                
                .typing-cursor {
                    display: inline-block;
                    margin-left: 2px;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Define typing function
        let index = 0;
        const speed = 40; // Typing speed (milliseconds)
        
        function typeNextCharacter() {
            if (index < originalText.length) {
                // Add the next character
                const char = originalText.charAt(index);
                const textNode = document.createTextNode(char);
                element.insertBefore(textNode, cursor);
                index++;
                
                // Random speed variation for natural typing feel
                const randomDelay = speed + Math.random() * 50;
                setTimeout(typeNextCharacter, randomDelay);
            } else {
                // Typing complete, remove cursor after a delay
                setTimeout(() => {
                    cursor.remove();
                }, 1500);
            }
        }
        
        // Start typing with a small delay
        setTimeout(typeNextCharacter, 800);
    });
});