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
            // Load chat history from server
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
                    // Add message to chat UI
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
                        
                        // Save Louise's response to the server
                        fetch('/save_chat', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                sender: 'Louise',
                                message: response
                            }),
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 'success') {
                                // Add response to chat UI
                                addMessageToChat('Louise', response, 'received');
                            }
                        })
                        .catch(error => {
                            console.error('Error saving response:', error);
                        });
                    }, 1000);
                }
            })
            .catch(error => {
                console.error('Error saving message:', error);
            });
        }
    }
    
    // Function to add message to chat UI
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
    }
    
    // Function to load chat history from server
    function loadChatHistory() {
        chatMessages.innerHTML = '';
        
        fetch('/get_chat_history')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Check if we need to add a welcome message
                    if (data.messages.length === 0) {
                        // Send welcome message to server
                        fetch('/save_chat', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                sender: 'Louise',
                                message: "Welcome to our special chat! I'm here whenever you need me. How are you feeling today?"
                            }),
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 'success') {
                                // Add welcome message to UI
                                addMessageToChat('Louise', "Welcome to our special chat! I'm here whenever you need me. How are you feeling today?", 'received');
                            }
                        })
                        .catch(error => {
                            console.error('Error saving welcome message:', error);
                        });
                    } else {
                        // Display existing chat history
                        data.messages.forEach(item => {
                            const type = item.sender === 'You' ? 'sent' : 'received';
                            addMessageToChat(item.sender, item.content, type);
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error loading chat history:', error);
            });
    }
});
