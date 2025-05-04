document.addEventListener('DOMContentLoaded', function() {
    // Create the rabbit elements
    function createRabbit() {
        // Create container
        const rabbitContainer = document.createElement('div');
        rabbitContainer.classList.add('rabbit-container');
        rabbitContainer.id = 'rabbit-helper';
        
        // Create the SVG rabbit
        const rabbitSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        rabbitSVG.classList.add('rabbit-svg');
        rabbitSVG.setAttribute('viewBox', '0 0 100 100');
        rabbitSVG.setAttribute('fill', 'none');
        rabbitSVG.innerHTML = `
            <!-- Rabbit body -->
            <ellipse cx="50" cy="70" rx="25" ry="20" fill="#F5F5F5" />
            <!-- Rabbit head -->
            <circle cx="50" cy="45" r="20" fill="white" />
            <!-- Left ear -->
            <path d="M35 30C30 15 25 5 20 5C15 5 20 25 25 30" fill="#F5F5F5" class="rabbit-ear left-ear" />
            <!-- Right ear -->
            <path d="M65 30C70 15 75 5 80 5C85 5 80 25 75 30" fill="#F5F5F5" class="rabbit-ear right-ear" />
            <!-- Eyes -->
            <circle cx="40" cy="40" r="3" fill="#333" />
            <circle cx="60" cy="40" r="3" fill="#333" />
            <!-- Nose -->
            <circle cx="50" cy="50" r="4" fill="#FFCECE" />
            <!-- Whiskers -->
            <line x1="35" y1="50" x2="25" y2="48" stroke="#999" stroke-width="1" />
            <line x1="35" y1="52" x2="25" y2="52" stroke="#999" stroke-width="1" />
            <line x1="35" y1="54" x2="25" y2="56" stroke="#999" stroke-width="1" />
            <line x1="65" y1="50" x2="75" y2="48" stroke="#999" stroke-width="1" />
            <line x1="65" y1="52" x2="75" y2="52" stroke="#999" stroke-width="1" />
            <line x1="65" y1="54" x2="75" y2="56" stroke="#999" stroke-width="1" />
            <!-- Mouth -->
            <path d="M45 55 Q50 60 55 55" stroke="#333" stroke-width="1.5" fill="none" />
        `;
        
        // Create speech bubble
        const speechBubble = document.createElement('div');
        speechBubble.classList.add('rabbit-speech');
        speechBubble.id = 'rabbit-speech';
        
        // Add elements to the container
        rabbitContainer.appendChild(rabbitSVG);
        rabbitContainer.appendChild(speechBubble);
        
        // Add container to the body
        document.body.appendChild(rabbitContainer);
        
        // Add event listener to rabbit for interaction
        rabbitContainer.addEventListener('click', function() {
            if (rabbitContainer.classList.contains('interactive')) {
                // Hide the rabbit when clicked
                hideRabbit();
                
                // Play a pop sound if available
                if (window.SoundManager && typeof window.SoundManager.play === 'function') {
                    window.SoundManager.play('pop');
                }
            }
        });
        
        return {
            container: rabbitContainer,
            speech: speechBubble,
            svg: rabbitSVG
        };
    }
    
    // Function to make the rabbit peek
    function showRabbit(message) {
        const rabbit = document.getElementById('rabbit-helper') || createRabbit().container;
        const speech = document.getElementById('rabbit-speech');
        
        // Set the speech bubble text if provided
        if (message && speech) {
            speech.textContent = message;
            setTimeout(() => {
                speech.classList.add('show');
            }, 500);
        }
        
        // Make the rabbit peek
        rabbit.classList.add('rabbit-peek');
        rabbit.classList.add('interactive');
        
        // Animate the ears
        const ears = document.querySelectorAll('.rabbit-ear');
        ears.forEach(ear => {
            ear.style.animation = 'ear-twitch 0.5s ease-in-out';
            ear.style.transformOrigin = 'bottom center';
            
            // Remove the animation after it completes so it can be triggered again
            setTimeout(() => {
                ear.style.animation = '';
            }, 500);
        });
        
        // Hide the rabbit after a delay
        setTimeout(hideRabbit, message ? 5000 : 3000);
        
        return rabbit;
    }
    
    // Function to hide the rabbit
    function hideRabbit() {
        const rabbit = document.getElementById('rabbit-helper');
        const speech = document.getElementById('rabbit-speech');
        
        if (rabbit) {
            // Hide speech bubble first
            if (speech) {
                speech.classList.remove('show');
            }
            
            // Then hide the rabbit
            setTimeout(() => {
                rabbit.classList.remove('rabbit-peek');
                rabbit.classList.remove('interactive');
            }, 300);
        }
    }
    
    // Function to have the rabbit say something
    function rabbitSays(message) {
        const rabbit = showRabbit(message);
        return rabbit;
    }
    
    // Array of cute rabbit messages
    const rabbitMessages = [
        "Hi there! 🐰",
        "How are you today?",
        "Hope you're having a good day!",
        "Need any help?",
        "I'm all ears! 🐰",
        "Just hopping by!",
        "Carrots are the best!",
        "You're doing great!",
        "That's a cute message!",
        "Keep going!",
        "I believe in you!",
        "You're amazing!"
    ];
    
    // Function to get a random rabbit message
    function getRandomRabbitMessage() {
        return rabbitMessages[Math.floor(Math.random() * rabbitMessages.length)];
    }
    
    // Global rabbit functions
    window.Rabbit = {
        show: showRabbit,
        hide: hideRabbit,
        say: rabbitSays,
        getRandomMessage: getRandomRabbitMessage
    };
    
    // Don't automatically show the rabbit on all pages
    // We'll control the welcome message from each specific page instead
    
    // Hook into the chat interface to show rabbit on new messages
    function hookIntoChatInterface() {
        // Check if we're on a page with chat
        const chatInput = document.getElementById('chat-input');
        const sendChat = document.getElementById('send-chat');
        
        if (chatInput && sendChat) {
            // Observe changes to the chat messages area
            const chatMessages = document.getElementById('chat-messages');
            
            if (chatMessages) {
                // Create a MutationObserver to watch for new messages
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                            // Check if the added node is a message (not a typing indicator or notification)
                            const addedNode = mutation.addedNodes[0];
                            if (addedNode.classList && 
                                addedNode.classList.contains('chat-message') && 
                                !addedNode.classList.contains('typing-indicator-container')) {
                                
                                // Show the rabbit with a random message
                                setTimeout(() => {
                                    rabbitSays(getRandomRabbitMessage());
                                }, 500);
                            }
                        }
                    });
                });
                
                // Configure and start the observer
                observer.observe(chatMessages, { childList: true });
            }
        }
    }
    
    // Also hook into feelings buttons to show rabbit when feelings are selected
    function hookIntoFeelingsButtons() {
        const feelingButtons = document.querySelectorAll('.btn-feeling');
        
        if (feelingButtons.length > 0) {
            feelingButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Get the feeling from the button text or class
                    let feeling = '';
                    if (this.classList.contains('happy-btn')) feeling = 'happy';
                    else if (this.classList.contains('sad-btn')) feeling = 'sad';
                    else if (this.classList.contains('lonely-btn')) feeling = 'lonely';
                    else if (this.classList.contains('overwhelmed-btn')) feeling = 'overwhelmed';
                    else feeling = 'unique';
                    
                    // Custom messages based on feeling
                    let message = '';
                    switch (feeling) {
                        case 'happy':
                            message = "Yay! I'm happy you're happy! 🐰";
                            break;
                        case 'sad':
                            message = "I'm here for you! 🐰 It'll get better.";
                            break;
                        case 'lonely':
                            message = "You're not alone! I'm here! 🐰";
                            break;
                        case 'overwhelmed':
                            message = "Take a deep breath. You got this! 🐰";
                            break;
                        default:
                            message = "I'm listening! 🐰";
                    }
                    
                    // Show rabbit with appropriate message after a short delay
                    setTimeout(() => {
                        rabbitSays(message);
                    }, 300);
                });
            });
        }
    }
    
    // Hook rabbit into various interface elements
    hookIntoChatInterface();
    hookIntoFeelingsButtons();
    
    // Create rabbit on page load
    createRabbit();
});