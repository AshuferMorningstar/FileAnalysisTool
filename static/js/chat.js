document.addEventListener('DOMContentLoaded', function() {
    // Chat elements
    const chatButton = document.getElementById('chat-button');
    const chatContainer = document.getElementById('chat-container');
    const closeChat = document.getElementById('close-chat');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChat = document.getElementById('send-chat');
    
    // Toggle chat visibility
    chatButton.addEventListener('click', function() {
        chatContainer.classList.toggle('d-none');
        if (!chatContainer.classList.contains('d-none')) {
            chatInput.focus();
            // Load chat history
            loadChatHistory();
        }
    });
    
    closeChat.addEventListener('click', function() {
        chatContainer.classList.add('d-none');
    });
    
    // Send message on button click
    sendChat.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Function to send message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // Add message to chat
            addMessageToChat('You', message, 'sent');
            
            // Clear input
            chatInput.value = '';
            
            // Automatic response after a delay
            setTimeout(() => {
                const responses = [
                    "I'm here for you, Louise! 💕",
                    "Thanks for sharing that with me.",
                    "You're so special to me, Louise.",
                    "I appreciate you so much!",
                    "You're doing great, Louise!",
                    "Keep being amazing, Louise!",
                    "I'm always here to listen.",
                    "You matter so much! ❤️",
                    "Your feelings are valid, Louise.",
                    "Take all the time you need."
                ];
                const response = responses[Math.floor(Math.random() * responses.length)];
                addMessageToChat('Louise', response, 'received');
            }, 1000);
            
            // Save chat history
            saveChatHistory();
        }
    }
    
    // Function to add message to chat
    function addMessageToChat(sender, message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', type);
        
        const bubbleElement = document.createElement('div');
        bubbleElement.classList.add('chat-bubble');
        bubbleElement.textContent = message;
        
        const senderElement = document.createElement('div');
        senderElement.classList.add('chat-sender');
        senderElement.textContent = sender;
        
        messageElement.appendChild(bubbleElement);
        messageElement.appendChild(senderElement);
        
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Save to local storage
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        chatHistory.push({
            sender: sender,
            message: message,
            type: type,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
    
    // Function to load chat history
    function loadChatHistory() {
        chatMessages.innerHTML = '';
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        
        chatHistory.forEach(item => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message', item.type);
            
            const bubbleElement = document.createElement('div');
            bubbleElement.classList.add('chat-bubble');
            bubbleElement.textContent = item.message;
            
            const senderElement = document.createElement('div');
            senderElement.classList.add('chat-sender');
            senderElement.textContent = item.sender;
            
            messageElement.appendChild(bubbleElement);
            messageElement.appendChild(senderElement);
            
            chatMessages.appendChild(messageElement);
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to save chat history (redundant but kept for clarity)
    function saveChatHistory() {
        // This is already done in addMessageToChat but could be expanded later
    }
    
    // Welcome message if first time
    if (!localStorage.getItem('chatHistory')) {
        setTimeout(() => {
            addMessageToChat('Louise', "Welcome to our special chat! I'm here whenever you need me. How are you feeling today?", 'received');
        }, 1500);
    }
});
