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
                    
                    // No automatic response - this is a direct chat with Louise
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
                    // Display existing chat history without adding a welcome message
                    data.messages.forEach(item => {
                        const type = item.sender === 'You' ? 'sent' : 'received';
                        addMessageToChat(item.sender, item.content, type);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading chat history:', error);
            });
    }
});
