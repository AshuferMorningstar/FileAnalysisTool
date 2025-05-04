// Function to format timestamp nicely
function formatTimestamp(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

document.addEventListener('DOMContentLoaded', function() {
    // Chat elements
    const chatButton = document.getElementById('chat-button');
    const chatContainer = document.getElementById('chat-container');
    const closeChat = document.getElementById('close-chat');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChat = document.getElementById('send-chat');
    
    // Toggle chat visibility with animation
    chatButton.addEventListener('click', function() {
        chatContainer.classList.toggle('d-none');
        
        if (!chatContainer.classList.contains('d-none')) {
            // Add entrance animation class
            chatContainer.classList.add('chat-entrance');
            
            // Remove the animation class after it completes
            setTimeout(() => {
                chatContainer.classList.remove('chat-entrance');
            }, 500);
            
            chatInput.focus();
            
            // Show loading indicator before loading history
            showTypingIndicator();
            
            // Load chat history from server
            loadChatHistory();
        }
    });
    
    closeChat.addEventListener('click', function() {
        // Add exit animation
        chatContainer.style.transform = 'scale(0.8)';
        chatContainer.style.opacity = '0';
        
        // Hide after animation completes
        setTimeout(() => {
            chatContainer.classList.add('d-none');
            // Reset styles for next time
            chatContainer.style.transform = '';
            chatContainer.style.opacity = '';
        }, 300);
    });
    
    // Send message on button click with animation
    sendChat.addEventListener('click', function() {
        sendChat.classList.add('animate__animated', 'animate__rubberBand');
        setTimeout(() => {
            sendChat.classList.remove('animate__animated', 'animate__rubberBand');
        }, 500);
        
        sendMessage();
    });
    
    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Input animation - expand on focus
    chatInput.addEventListener('focus', function() {
        this.style.transform = 'scale(1.02)';
        this.style.boxShadow = '0 0 8px rgba(138, 43, 226, 0.4)';
    });
    
    chatInput.addEventListener('blur', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = 'none';
    });
    
    // Create typing indicator
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.classList.add('chat-message', 'received', 'typing-indicator-container');
        
        const typingBubble = document.createElement('div');
        typingBubble.classList.add('chat-bubble', 'typing-indicator');
        
        // Add the three dots
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            typingBubble.appendChild(dot);
        }
        
        typingElement.appendChild(typingBubble);
        chatMessages.appendChild(typingElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return typingElement;
    }
    
    // Function to send message with animations
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // Add sending animation to the button
            sendChat.classList.add('animate__animated', 'animate__pulse');
            
            // Clear input
            chatInput.value = '';
            
            // Add message to chat UI immediately with animation
            const messageElement = addMessageToChat('You', message, 'sent');
            messageElement.style.animation = 'fadeInUp 0.3s ease-out';
            
            // Show rabbit animation with sending message
            if (window.Rabbit && typeof window.Rabbit.say === 'function') {
                window.Rabbit.say(window.Rabbit.getRandomMessage());
                
                // Play rabbit sound
                if (window.SoundManager && typeof window.SoundManager.play === 'function') {
                    window.SoundManager.play('rabbit');
                }
            }
            
            // Show typing indicator
            const typingIndicator = showTypingIndicator();
            
            // Save message to server
            fetch('/save_chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender: 'You',
                    message: message
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Remove typing indicator after a delay to simulate typing time
                    setTimeout(() => {
                        if (typingIndicator && typingIndicator.parentNode) {
                            typingIndicator.remove();
                        }
                        
                        // This is a direct chat with Louise, so we're not adding an automatic response
                        // But we'll add some visual feedback that the message was saved
                        
                        // Create a small notification that fades away
                        const notification = document.createElement('div');
                        notification.textContent = 'Message sent!';
                        notification.style.color = '#28a745';
                        notification.style.fontSize = '0.8rem';
                        notification.style.textAlign = 'center';
                        notification.style.padding = '5px';
                        notification.style.opacity = '0';
                        notification.style.transition = 'opacity 0.5s ease';
                        
                        chatMessages.appendChild(notification);
                        
                        // Show and then hide the notification
                        setTimeout(() => {
                            notification.style.opacity = '1';
                        }, 10);
                        
                        setTimeout(() => {
                            notification.style.opacity = '0';
                            setTimeout(() => {
                                notification.remove();
                            }, 500);
                        }, 2000);
                    }, 1500 + Math.random() * 1000); // Random delay to make it feel more natural
                }
            })
            .catch(error => {
                console.error('Error saving message:', error);
                // Remove typing indicator
                if (typingIndicator && typingIndicator.parentNode) {
                    typingIndicator.remove();
                }
                
                // Show error message
                const errorMsg = document.createElement('div');
                errorMsg.textContent = 'Error sending message. Please try again.';
                errorMsg.style.color = '#dc3545';
                errorMsg.style.fontSize = '0.8rem';
                errorMsg.style.textAlign = 'center';
                errorMsg.style.padding = '5px';
                
                chatMessages.appendChild(errorMsg);
                
                // Remove error message after a delay
                setTimeout(() => {
                    errorMsg.remove();
                }, 3000);
            });
        }
    }
    
    // Function to add message to chat UI with improved animations
    function addMessageToChat(sender, message, type, timestamp = null) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', type);
        
        const bubbleElement = document.createElement('div');
        bubbleElement.classList.add('chat-bubble');
        
        // Apply "typing" effect for received messages
        if (type === 'received') {
            // Start with empty content, then type it out
            bubbleElement.textContent = '';
            
            // Store the message to be typed
            let index = 0;
            let fullMessage = message;
            
            // Type out character by character
            function typeNextCharacter() {
                if (index < fullMessage.length) {
                    bubbleElement.textContent += fullMessage.charAt(index);
                    index++;
                    setTimeout(typeNextCharacter, 25 + Math.random() * 50);
                }
            }
            
            // Start typing after a small delay
            setTimeout(typeNextCharacter, 100);
        } else {
            // For sent messages, just show the full text immediately
            bubbleElement.textContent = message;
        }
        
        // Create sender element with timestamp
        const senderElement = document.createElement('div');
        senderElement.classList.add('chat-sender');
        
        // Add sender name
        const senderName = document.createElement('span');
        senderName.textContent = sender;
        senderElement.appendChild(senderName);
        
        // Add timestamp
        const timeElement = document.createElement('span');
        timeElement.classList.add('chat-time');
        
        // If timestamp is provided (from history), use it
        // Otherwise create a new timestamp for current time
        if (timestamp) {
            timeElement.textContent = formatTimestamp(new Date(timestamp));
        } else {
            timeElement.textContent = formatTimestamp(new Date());
        }
        
        senderElement.appendChild(timeElement);
        
        messageElement.appendChild(bubbleElement);
        messageElement.appendChild(senderElement);
        
        chatMessages.appendChild(messageElement);
        
        // Add entrance animation based on message type
        if (type === 'sent') {
            bubbleElement.style.transform = 'translateX(20px)';
            bubbleElement.style.opacity = '0';
            
            setTimeout(() => {
                bubbleElement.style.transition = 'all 0.3s ease-out';
                bubbleElement.style.transform = 'translateX(0)';
                bubbleElement.style.opacity = '1';
            }, 10);
        } else {
            bubbleElement.style.transform = 'translateX(-20px)';
            bubbleElement.style.opacity = '0';
            
            setTimeout(() => {
                bubbleElement.style.transition = 'all 0.3s ease-out';
                bubbleElement.style.transform = 'translateX(0)';
                bubbleElement.style.opacity = '1';
            }, 10);
        }
        
        // Scroll to bottom with smooth animation
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
        
        return messageElement;
    }
    
    // Function to load chat history from server with loading animation
    function loadChatHistory() {
        chatMessages.innerHTML = '';
        
        // Add loading message
        const loadingElement = document.createElement('div');
        loadingElement.textContent = 'Loading messages...';
        loadingElement.style.textAlign = 'center';
        loadingElement.style.color = '#6c757d';
        loadingElement.style.padding = '10px';
        loadingElement.style.fontStyle = 'italic';
        
        chatMessages.appendChild(loadingElement);
        
        fetch('/get_chat_history')
            .then(response => response.json())
            .then(data => {
                // Remove loading message
                chatMessages.innerHTML = '';
                
                if (data.status === 'success') {
                    // If there are no messages, show a welcome message
                    if (data.messages.length === 0) {
                        const welcomeMsg = document.createElement('div');
                        welcomeMsg.classList.add('chat-message', 'received');
                        
                        const welcomeBubble = document.createElement('div');
                        welcomeBubble.classList.add('chat-bubble');
                        welcomeBubble.textContent = "Hello! I'm Bunny, your friendly chat companion! 🐰 Messages you send here will be received by Louise's creator. Feel free to leave any thoughts or messages!";
                        
                        const welcomeSender = document.createElement('div');
                        welcomeSender.classList.add('chat-sender');
                        
                        // Add sender name
                        const senderName = document.createElement('span');
                        senderName.textContent = 'Bunny';
                        welcomeSender.appendChild(senderName);
                        
                        // Add timestamp
                        const timeElement = document.createElement('span');
                        timeElement.classList.add('chat-time');
                        timeElement.textContent = formatTimestamp(new Date());
                        welcomeSender.appendChild(timeElement);
                        
                        welcomeMsg.appendChild(welcomeBubble);
                        welcomeMsg.appendChild(welcomeSender);
                        
                        chatMessages.appendChild(welcomeMsg);
                    } else {
                        // Display existing chat history with staggered animations
                        data.messages.forEach((item, index) => {
                            const type = item.sender === 'You' ? 'sent' : 'received';
                            
                            // Delay each message slightly for a staggered effect
                            setTimeout(() => {
                                addMessageToChat(item.sender, item.content, type, item.timestamp);
                                
                                // Make rabbit appear occasionally for received messages
                                if (type === 'received' && Math.random() > 0.7) {
                                    setTimeout(() => {
                                        if (window.Rabbit && typeof window.Rabbit.say === 'function') {
                                            window.Rabbit.say(window.Rabbit.getRandomMessage());
                                            
                                            // Play rabbit sound
                                            if (window.SoundManager && typeof window.SoundManager.play === 'function') {
                                                window.SoundManager.play('rabbit');
                                            }
                                        }
                                    }, 500);
                                }
                            }, index * 100);
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error loading chat history:', error);
                
                // Remove loading message
                chatMessages.innerHTML = '';
                
                // Show error message
                const errorMsg = document.createElement('div');
                errorMsg.textContent = 'Error loading messages. Please try again.';
                errorMsg.style.color = '#dc3545';
                errorMsg.style.textAlign = 'center';
                errorMsg.style.padding = '10px';
                
                chatMessages.appendChild(errorMsg);
            });
    }
});
