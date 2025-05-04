// Function to format timestamp nicely
function formatTimestamp(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDate = new Date(date);
    const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    
    const hours = messageDate.getHours().toString().padStart(2, '0');
    const minutes = messageDate.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    
    // Format: Today at 14:30, Yesterday at 09:15, or May 3 at 16:45
    if (messageDay.getTime() === today.getTime()) {
        return `Today at ${time}`;
    } else if (messageDay.getTime() === yesterday.getTime()) {
        return `Yesterday at ${time}`;
    } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[messageDate.getMonth()];
        const day = messageDate.getDate();
        return `${month} ${day} at ${time}`;
    }
}

// Function to generate a device ID and store it in localStorage
function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('chat_device_id');
    if (!deviceId) {
        // Generate a random ID
        deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
        localStorage.setItem('chat_device_id', deviceId);
    }
    return deviceId;
}

// Function to get the user name from localStorage or ask for it
function getUserName() {
    return localStorage.getItem('chat_user_name') || null;
}

// Save the user name to localStorage
function saveUserName(name) {
    localStorage.setItem('chat_user_name', name);
    // When username changes, update the user_identifier as well
    generateUserIdentifier();
}

// Generate a unique identifier that combines device ID and username
function generateUserIdentifier() {
    const deviceId = getOrCreateDeviceId();
    const userName = getUserName() || 'anonymous';
    const identifier = `${userName}_${deviceId}`;
    localStorage.setItem('user_identifier', identifier);
    return identifier;
}

// Get the current user identifier or generate one
function getUserIdentifier() {
    let identifier = localStorage.getItem('user_identifier');
    if (!identifier) {
        identifier = generateUserIdentifier();
    }
    return identifier;
}

// Variables to control real-time updates
let isRealTimeUpdatesActive = false;
let lastMessageId = 0;
let typingTimeout = null;
let isTyping = false;
let lastTypingUpdate = Date.now();
let chatPollingInterval = null;
let hasUnreadMessages = false;
let lastChatVisit = parseInt(localStorage.getItem('lastChatVisit') || '0');

document.addEventListener('DOMContentLoaded', function() {
    // Apply saved background on load
    setTimeout(() => {
        applySavedBackground();
    }, 100);
    // Chat elements
    const chatButton = document.getElementById('chat-button');
    const chatContainer = document.getElementById('chat-container');
    const closeChat = document.getElementById('close-chat');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChat = document.getElementById('send-chat');
    
    // User name modal elements
    const userNameModal = document.getElementById('user-name-modal');
    const userNameInput = document.getElementById('user-name-input');
    const saveUserNameBtn = document.getElementById('save-user-name');
    
    // File upload elements
    const photoUploadBtn = document.getElementById('photo-upload');
    const audioUploadBtn = document.getElementById('audio-upload');
    const fileInput = document.getElementById('file-input');
    
    // Get GIF and sticker buttons
    const gifButton = document.getElementById('gif-button');
    const stickerButton = document.getElementById('sticker-button');
    
    // Toggle chat visibility with animation
    chatButton.addEventListener('click', function() {
        // Check if we have a username first
        if (!getUserName()) {
            // Show the username modal
            userNameModal.classList.add('show');
            setTimeout(() => {
                userNameInput.focus();
            }, 300);
            return;
        }
        
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
    
    // Save user name
    saveUserNameBtn.addEventListener('click', function() {
        const name = userNameInput.value.trim();
        if (name) {
            saveUserName(name);
            userNameModal.classList.remove('show');
            
            // Now open the chat
            setTimeout(() => {
                chatButton.click();
            }, 300);
        } else {
            // Shake the input to indicate error
            userNameInput.style.animation = 'shake 0.5s';
            setTimeout(() => {
                userNameInput.style.animation = '';
            }, 500);
        }
    });
    
    // Settings elements
    const chatSettingsBtn = document.getElementById('chat-settings');
    const chatSettingsModal = document.getElementById('chat-settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const settingsUserName = document.getElementById('settings-user-name');
    const saveSettingsNameBtn = document.getElementById('save-settings-name');
    const bgOptions = document.querySelectorAll('.bg-option');
    
    // Get or create chat background preference
    function getChatBackground() {
        return localStorage.getItem('chat_background') || 'default';
    }
    
    // Save chat background preference
    function saveChatBackground(background) {
        localStorage.setItem('chat_background', background);
    }
    
    // Apply saved background on load
    function applySavedBackground() {
        const savedBg = getChatBackground();
        
        // First remove any theme classes
        chatContainer.classList.remove('theme-purple', 'theme-teal', 'theme-pink', 'theme-blue');
        
        // Then add the saved theme if it's not default
        if (savedBg !== 'default') {
            chatContainer.classList.add('theme-' + savedBg);
        }
        
        // Mark the active background option
        bgOptions.forEach(option => {
            if (option.dataset.background === savedBg) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
    
    // Set up the chat settings button
    chatSettingsBtn.addEventListener('click', function() {
        // Load current settings into the modal
        settingsUserName.value = getUserName() || '';
        
        // Mark the active background option
        const savedBg = getChatBackground();
        bgOptions.forEach(option => {
            if (option.dataset.background === savedBg) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Show the settings modal with animation
        chatSettingsModal.classList.add('show');
        
        // Focus on the name input
        setTimeout(() => {
            settingsUserName.focus();
        }, 300);
    });
    
    // Close settings modal
    closeSettingsBtn.addEventListener('click', function() {
        chatSettingsModal.classList.remove('show');
    });
    
    // Save name from settings
    saveSettingsNameBtn.addEventListener('click', function() {
        const name = settingsUserName.value.trim();
        if (name) {
            saveUserName(name);
            
            // Show success animation
            this.innerHTML = '<i class="fas fa-check"></i>';
            this.style.backgroundColor = 'var(--happy-color)';
            
            setTimeout(() => {
                this.textContent = 'Update';
                this.style.backgroundColor = '';
            }, 1500);
        } else {
            // Shake the input to indicate error
            settingsUserName.style.animation = 'shake 0.5s';
            setTimeout(() => {
                settingsUserName.style.animation = '';
            }, 500);
        }
    });
    
    // Handle pressing enter in settings name input
    settingsUserName.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveSettingsNameBtn.click();
        }
    });
    
    // Handle background color options
    bgOptions.forEach(option => {
        option.addEventListener('click', function() {
            const bg = this.dataset.background;
            
            // Save the preference
            saveChatBackground(bg);
            
            // Update active class on options
            bgOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Apply the background
            chatContainer.classList.remove('theme-purple', 'theme-teal', 'theme-pink', 'theme-blue');
            if (bg !== 'default') {
                chatContainer.classList.add('theme-' + bg);
            }
            
            // Add small animation for feedback
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = '';
            }, 300);
        });
    });
    
    // Let user press Enter to save name
    userNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveUserNameBtn.click();
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
    
    // File upload handlers
    photoUploadBtn.addEventListener('click', function() {
        fileInput.setAttribute('accept', 'image/*');
        fileInput.click();
    });
    
    audioUploadBtn.addEventListener('click', function() {
        fileInput.setAttribute('accept', 'audio/*');
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function(e) {
        if (this.files && this.files.length > 0) {
            const file = this.files[0];
            
            // Create FormData to send file
            const formData = new FormData();
            formData.append('file', file);
            
            // Show loading indicator in chat
            const loadingMsg = addMessageToChat('You', 'Uploading file...', 'sent');
            
            // Upload file to server
            fetch('/upload_file', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Remove loading message
                    loadingMsg.remove();
                    
                    // Determine file type
                    const fileType = data.file.type;
                    const filePath = data.file.path;
                    const fileUrl = data.file.url;
                    
                    // Create content message based on file type
                    let messageContent;
                    let messageType;
                    
                    if (fileType === 'image') {
                        messageContent = `<img src="${fileUrl}" alt="Shared image" class="chat-image">`;
                        messageType = 'image';
                    } else if (fileType === 'audio') {
                        messageContent = `<audio controls src="${fileUrl}" class="chat-audio"></audio>`;
                        messageType = 'audio';
                    } else {
                        messageContent = `File uploaded: <a href="${fileUrl}" target="_blank">${file.name}</a>`;
                        messageType = 'file';
                    }
                    
                    // Add message to chat UI
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('chat-message', 'sent');
                    
                    const bubbleElement = document.createElement('div');
                    bubbleElement.classList.add('chat-bubble');
                    
                    // Set inner HTML instead of text content for HTML elements
                    bubbleElement.innerHTML = messageContent;
                    
                    // Create sender element with timestamp
                    const senderElement = document.createElement('div');
                    senderElement.classList.add('chat-sender');
                    
                    // Add sender name (current user)
                    const senderName = document.createElement('span');
                    senderName.textContent = 'You';
                    senderElement.appendChild(senderName);
                    
                    // Add timestamp
                    const timeElement = document.createElement('span');
                    timeElement.classList.add('chat-time');
                    timeElement.textContent = formatTimestamp(new Date());
                    senderElement.appendChild(timeElement);
                    
                    messageElement.appendChild(bubbleElement);
                    messageElement.appendChild(senderElement);
                    chatMessages.appendChild(messageElement);
                    
                    // Save the message to the database
                    const userName = getUserName();
                    const deviceId = getOrCreateDeviceId();
                    const userIdentifier = getUserIdentifier();
                    
                    fetch('/save_chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sender: 'You',
                            message: messageContent,
                            user_name: userName,
                            device_id: deviceId,
                            user_identifier: userIdentifier,
                            message_type: messageType,
                            file_path: filePath
                        }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success' && data.message && data.message.id) {
                            // Store the message ID
                            messageElement.dataset.messageId = data.message.id;
                            
                            // Add delete button only (can't edit files)
                            const messageActions = document.createElement('div');
                            messageActions.classList.add('message-actions');
                            
                            // Delete button
                            const deleteButton = document.createElement('button');
                            deleteButton.classList.add('message-action-btn', 'delete');
                            deleteButton.textContent = 'Delete';
                            deleteButton.addEventListener('click', function() {
                                if (confirm('Are you sure you want to delete this file?')) {
                                    deleteMessage(data.message.id, messageElement);
                                }
                            });
                            messageActions.appendChild(deleteButton);
                            
                            messageElement.appendChild(messageActions);
                        }
                    })
                    .catch(error => {
                        console.error('Error saving file message:', error);
                    });
                    
                    // Scroll to the bottom
                    chatMessages.scrollTo({
                        top: chatMessages.scrollHeight,
                        behavior: 'smooth'
                    });
                    
                    // Reset file input
                    fileInput.value = '';
                } else {
                    // Show error
                    console.error('File upload failed:', data.message);
                    loadingMsg.remove();
                    
                    // Add error message to chat
                    const errorMsg = document.createElement('div');
                    errorMsg.textContent = 'File upload failed. Please try again.';
                    errorMsg.style.color = '#dc3545';
                    errorMsg.style.fontSize = '0.8rem';
                    errorMsg.style.textAlign = 'center';
                    errorMsg.style.padding = '5px';
                    
                    chatMessages.appendChild(errorMsg);
                    
                    // Remove error message after a delay
                    setTimeout(() => {
                        errorMsg.remove();
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Error uploading file:', error);
                loadingMsg.remove();
                
                // Add error message to chat
                const errorMsg = document.createElement('div');
                errorMsg.textContent = 'Error uploading file. Please try again.';
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
            
            // Add message to chat UI immediately with animation, but without edit/delete buttons yet
            // We'll add those after we get confirmation from the server
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
            
            // Get user information
            const userName = getUserName();
            const deviceId = getOrCreateDeviceId();
            const userIdentifier = getUserIdentifier();
            
            // Save message to server
            fetch('/save_chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender: 'You',
                    message: message,
                    user_name: userName,
                    device_id: deviceId,
                    user_identifier: userIdentifier,
                    message_type: 'text'
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
                        
                        // Add messageId to the element for edit/delete functionality
                        if (data.message && data.message.id) {
                            // Store the message ID
                            messageElement.dataset.messageId = data.message.id;
                            
                            // Add edit and delete buttons
                            const messageActions = document.createElement('div');
                            messageActions.classList.add('message-actions');
                            
                            // Edit button
                            const editButton = document.createElement('button');
                            editButton.classList.add('message-action-btn', 'edit');
                            editButton.textContent = 'Edit';
                            editButton.addEventListener('click', function() {
                                // Find the bubble element
                                const bubbleElement = messageElement.querySelector('.chat-bubble');
                                if (bubbleElement) {
                                    // Create and show edit form
                                    createEditForm(messageElement, bubbleElement, message, data.message.id);
                                }
                            });
                            messageActions.appendChild(editButton);
                            
                            // Delete button
                            const deleteButton = document.createElement('button');
                            deleteButton.classList.add('message-action-btn', 'delete');
                            deleteButton.textContent = 'Delete';
                            deleteButton.addEventListener('click', function() {
                                if (confirm('Are you sure you want to delete this message?')) {
                                    deleteMessage(data.message.id, messageElement);
                                }
                            });
                            messageActions.appendChild(deleteButton);
                            
                            messageElement.appendChild(messageActions);
                        }
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
    function addMessageToChat(sender, message, type, timestamp = null, messageId = null, userName = null, userIdentifier = null) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', type);
        
        // If message ID is provided from database, store it as a data attribute
        if (messageId) {
            messageElement.dataset.messageId = messageId;
        }
        
        // Store the user identifier if provided
        if (userIdentifier) {
            messageElement.dataset.userIdentifier = userIdentifier;
        }
        
        // Determine if the message is from the current user
        const currentUserIdentifier = getUserIdentifier();
        const isCurrentUser = (userIdentifier && userIdentifier === currentUserIdentifier);
        
        // Get display name - use the passed userName if available
        let displayName;
        if (type === 'sent' || isCurrentUser) {
            // For sent messages from this device, show "You"
            displayName = isCurrentUser ? 'You' : (userName || 'User');
            // Store the real username in the message data
            if (getUserName()) {
                messageElement.dataset.userName = getUserName();
            }
        } else {
            // For received messages, show the real username of the other person
            displayName = userName || 'Louise';
        }
        
        // Add username above the message bubble (WhatsApp style)
        const senderNameDisplay = document.createElement('div');
        senderNameDisplay.classList.add('chat-sender-name-display');
        senderNameDisplay.textContent = displayName;
        messageElement.appendChild(senderNameDisplay);
        
        // Create message bubble
        const bubbleElement = document.createElement('div');
        bubbleElement.classList.add('chat-bubble');
        
        // Handle HTML content (images, audio, etc.)
        if (message.includes('<img') || message.includes('<audio') || message.includes('<a')) {
            bubbleElement.innerHTML = message;
        }
        // Apply "typing" effect for received messages
        else if (type === 'received') {
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
        
        // Add bubble to message container
        messageElement.appendChild(bubbleElement);
        
        // Create timestamp element below the bubble
        const timeElement = document.createElement('div');
        timeElement.classList.add('chat-time');
        
        // If timestamp is provided (from history), use it
        // Otherwise create a new timestamp for current time
        if (timestamp) {
            timeElement.textContent = formatTimestamp(new Date(timestamp));
        } else {
            timeElement.textContent = formatTimestamp(new Date());
        }
        
        messageElement.appendChild(timeElement);
        
        // Only add edit and delete buttons to sent messages (from the current user)
        // And only if a message ID is provided (meaning it's a message from the database)
        if (type === 'sent' && messageId) {
            const messageActions = document.createElement('div');
            messageActions.classList.add('message-actions');
            
            // Edit button
            const editButton = document.createElement('button');
            editButton.classList.add('message-action-btn', 'edit');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', function() {
                // Create and show edit form
                createEditForm(messageElement, bubbleElement, message, messageId);
            });
            messageActions.appendChild(editButton);
            
            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('message-action-btn', 'delete');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this message?')) {
                    deleteMessage(messageId, messageElement);
                }
            });
            messageActions.appendChild(deleteButton);
            
            messageElement.appendChild(messageActions);
        }
        
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
                    // Check if this user has seen the welcome message before
                    const hasSeenWelcome = localStorage.getItem('has_seen_welcome') === 'true';
                    
                    // Look for welcome messages
                    const welcomeMessages = data.messages.filter(msg => 
                        msg.sender === 'Bunny' && 
                        msg.content.includes("I'm Bunny, your friendly chat companion")
                    );
                    
                    // Filter out ALL welcome messages from the display for returning users
                    let messagesToDisplay = data.messages;
                    
                    // If user has seen welcome before, remove ALL welcome messages
                    if (hasSeenWelcome) {
                        messagesToDisplay = data.messages.filter(msg => 
                            !(msg.sender === 'Bunny' && 
                              msg.content.includes("I'm Bunny, your friendly chat companion"))
                        );
                        
                        if (welcomeMessages.length > 0) {
                            console.log(`Filtered out ${welcomeMessages.length} welcome messages for returning user`);
                        }
                    } 
                    // For first-time users, only keep one welcome message if multiple exist
                    else if (welcomeMessages.length > 1) {
                        // Keep the first welcome message, filter out the rest
                        const firstWelcomeId = welcomeMessages[0].id;
                        messagesToDisplay = data.messages.filter(msg => 
                            !(msg.sender === 'Bunny' && 
                              msg.content.includes("I'm Bunny, your friendly chat companion") && 
                              msg.id !== firstWelcomeId)
                        );
                        
                        console.log(`Filtered out ${welcomeMessages.length - 1} duplicate welcome messages`);
                    }
                    
                    // Mark that this user has seen the welcome message
                    localStorage.setItem('has_seen_welcome', 'true');
                    
                    // Add welcome message only for completely empty history AND first-time users
                    if (data.messages.length === 0 && !hasSeenWelcome) {
                        // Create the welcome message content
                        const welcomeMessage = "Hello! I'm Bunny, your friendly chat companion! 🐰 Messages you send here will be received by Louise's creator. Feel free to leave any thoughts or messages!";
                        
                        // Show the message locally and save to database
                        addMessageToChat(
                            'Bunny', 
                            welcomeMessage, 
                            'received',
                            new Date(),
                            null,
                            'Bunny',
                            'system_bunny'
                        );
                        
                        // Save welcome message to database
                        fetch('/save_chat', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                sender: 'Bunny',
                                message: welcomeMessage,
                                user_name: 'Bunny',
                                device_id: 'system',
                                user_identifier: 'system_bunny',
                                message_type: 'welcome'
                            }),
                        })
                        .then(response => response.json())
                        .then(result => {
                            if (result.status === 'success') {
                                // Update the message ID after saving
                                const welcomeElements = document.querySelectorAll('.chat-message');
                                if (welcomeElements.length > 0) {
                                    const lastElement = welcomeElements[welcomeElements.length - 1];
                                    lastElement.dataset.messageId = result.message.id;
                                }
                            }
                        });
                    }
                    
                    // Process existing messages
                    if (data.messages.length > 0) {
                        // Get the current user's identifier
                        const currentUserIdentifier = getUserIdentifier();
                        
                        // Get the latest message ID for real-time update tracking
                        if (data.messages.length > 0) {
                            lastMessageId = Math.max(...data.messages.map(msg => msg.id));
                        }
                        
                        // Display existing chat history with staggered animations
                        // Use the filtered messages that don't have duplicates
                        messagesToDisplay.forEach((item, index) => {
                            // Determine if this message is from the current user
                            // by comparing user identifiers
                            const isFromCurrentUser = item.user_identifier === currentUserIdentifier;
                            
                            // Set message type based on the identifier match, not just the sender text
                            const type = isFromCurrentUser ? 'sent' : 'received';
                            
                            // Delay each message slightly for a staggered effect
                            setTimeout(() => {
                                // Pass all relevant info including user_identifier
                                addMessageToChat(
                                    item.sender, 
                                    item.content, 
                                    type, 
                                    item.timestamp, 
                                    item.id, 
                                    item.user_name, 
                                    item.user_identifier
                                );
                                
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
                                
                                // If this is the last message, start real-time updates
                                if (index === messagesToDisplay.length - 1) {
                                    startRealTimeUpdates();
                                }
                            }, index * 100);
                        });
                    }
                    
                    // Start real-time updates even if there are no messages yet
                    if (data.messages.length === 0) {
                        startRealTimeUpdates();
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
    
    // Function to create and show edit form for a message
    function createEditForm(messageElement, bubbleElement, currentMessage, messageId) {
        // Store the original message content
        const originalContent = currentMessage;
        
        // Create the edit form
        const editForm = document.createElement('form');
        editForm.classList.add('edit-message-form');
        
        // Create the input field
        const editInput = document.createElement('input');
        editInput.classList.add('edit-message-input');
        editInput.type = 'text';
        editInput.value = originalContent;
        editForm.appendChild(editInput);
        
        // Create the save button
        const saveButton = document.createElement('button');
        saveButton.classList.add('edit-message-save');
        saveButton.type = 'button';
        saveButton.textContent = 'Save';
        editForm.appendChild(saveButton);
        
        // Create the cancel button
        const cancelButton = document.createElement('button');
        cancelButton.classList.add('edit-message-cancel');
        cancelButton.type = 'button';
        cancelButton.textContent = 'Cancel';
        editForm.appendChild(cancelButton);
        
        // Hide the original bubble temporarily
        bubbleElement.style.display = 'none';
        
        // Insert the edit form after the bubble
        messageElement.insertBefore(editForm, bubbleElement.nextSibling);
        
        // Focus on the input field
        editInput.focus();
        
        // Set up cancel button handler
        cancelButton.addEventListener('click', function() {
            // Remove the edit form
            editForm.remove();
            
            // Show the original bubble again
            bubbleElement.style.display = '';
        });
        
        // Set up submit handler for the edit form
        saveButton.addEventListener('click', function() {
            const newMessage = editInput.value.trim();
            
            if (newMessage && newMessage !== originalContent) {
                // Update the message in the database
                updateMessage(messageId, newMessage, function(success) {
                    if (success) {
                        // Update the bubble content
                        bubbleElement.textContent = newMessage;
                        
                        // Add a subtle animation to indicate the update
                        bubbleElement.style.backgroundColor = '#e8f4ff';
                        setTimeout(() => {
                            bubbleElement.style.transition = 'background-color 1s ease';
                            bubbleElement.style.backgroundColor = '';
                        }, 50);
                    }
                });
            }
            
            // Remove the edit form
            editForm.remove();
            
            // Show the original bubble again
            bubbleElement.style.display = '';
        });
        
        // Handle enter key
        editInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveButton.click();
            }
        });
    }
    
    // Function to update a message in the database
    function updateMessage(messageId, newContent, callback) {
        fetch('/update_chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: messageId,
                content: newContent
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                if (callback) callback(true);
            } else {
                console.error('Error updating message:', data.message);
                alert('Error updating message: ' + data.message);
                if (callback) callback(false);
            }
        })
        .catch(error => {
            console.error('Error updating message:', error);
            alert('Error updating message. Please try again.');
            if (callback) callback(false);
        });
    }
    
    // Function to delete a message from the database
    function deleteMessage(messageId, messageElement) {
        fetch('/delete_chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: messageId
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Add a removal animation
                messageElement.style.transition = 'all 0.3s ease-out';
                messageElement.style.opacity = '0';
                messageElement.style.transform = 'translateX(30px)';
                messageElement.style.height = messageElement.offsetHeight + 'px';
                
                setTimeout(() => {
                    messageElement.style.height = '0';
                    messageElement.style.marginTop = '0';
                    messageElement.style.marginBottom = '0';
                    messageElement.style.padding = '0';
                    
                    setTimeout(() => {
                        messageElement.remove();
                    }, 300);
                }, 300);
            } else {
                console.error('Error deleting message:', data.message);
                alert('Error deleting message: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting message:', error);
            alert('Error deleting message. Please try again.');
        });
    }
    
    // Function to start real-time updates using polling
    function startRealTimeUpdates() {
        if (isRealTimeUpdatesActive) return; // Already running
        
        isRealTimeUpdatesActive = true;
        console.log('Starting real-time updates...');
        
        // Set up polling interval (every 3 seconds)
        chatPollingInterval = setInterval(checkForNewMessages, 3000);
        
        // Set up typing indicator events
        chatInput.addEventListener('input', function() {
            const now = Date.now();
            
            // Only send typing status if enough time has passed
            if (!isTyping || now - lastTypingUpdate > 2000) {
                isTyping = true;
                lastTypingUpdate = now;
                
                // Send typing status to server (for future implementation)
                // For now, just update typing timeout
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    isTyping = false;
                }, 2000);
            }
        });
        
        // Also check for new messages when chat container becomes visible
        const chatObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    if (!chatContainer.classList.contains('d-none')) {
                        // Chat became visible, check for new messages immediately
                        checkForNewMessages();
                    } else {
                        // Chat was hidden, stop real-time updates
                        isRealTimeUpdatesActive = false;
                        clearInterval(chatPollingInterval);
                    }
                }
            });
        });
        
        // Start observing the chat container for class changes
        chatObserver.observe(chatContainer, { attributes: true });
    }
    
    // Function to check for new messages
    function checkForNewMessages() {
        if (!isRealTimeUpdatesActive) return;
        
        fetch('/get_chat_history?since_id=' + lastMessageId)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.messages && data.messages.length > 0) {
                    // Get current user identifier
                    const currentUserIdentifier = getUserIdentifier();
                    
                    // Only show new messages
                    const newMessages = data.messages.filter(msg => !document.querySelector(`[data-message-id="${msg.id}"]`));
                    
                    // Update last message ID
                    if (newMessages.length > 0) {
                        lastMessageId = Math.max(...newMessages.map(msg => msg.id));
                    }
                    
                    // Add new messages
                    newMessages.forEach(item => {
                        // Determine if this message is from the current user
                        const isFromCurrentUser = item.user_identifier === currentUserIdentifier;
                        
                        // Set message type based on the identifier match
                        const type = isFromCurrentUser ? 'sent' : 'received';
                        
                        // Remove typing indicator if present and this is a received message
                        if (type === 'received') {
                            const typingIndicators = document.querySelectorAll('.typing-indicator-container');
                            typingIndicators.forEach(indicator => indicator.remove());
                        }
                        
                        // Add the message with animation
                        addMessageToChat(
                            item.sender,
                            item.content,
                            type,
                            item.timestamp,
                            item.id,
                            item.user_name,
                            item.user_identifier
                        );
                        
                        // Play notification sound for new messages from others
                        if (type === 'received' && window.SoundManager && typeof window.SoundManager.play === 'function') {
                            window.SoundManager.play('message');
                        }
                        
                        // Make rabbit appear occasionally for received messages
                        if (type === 'received' && Math.random() > 0.7) {
                            if (window.Rabbit && typeof window.Rabbit.say === 'function') {
                                window.Rabbit.say(window.Rabbit.getRandomMessage());
                                
                                // Play rabbit sound
                                if (window.SoundManager && typeof window.SoundManager.play === 'function') {
                                    window.SoundManager.play('rabbit');
                                }
                            }
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error checking for new messages:', error);
                // Don't show error to user, just log it
            });
    }
    
    // Function to update settings and add profile picture
    function setupProfilePicture() {
        // Add profile picture section to settings modal
        const settingsContent = document.querySelector('.settings-content');
        
        if (settingsContent) {
            // Create profile picture section
            const profileSection = document.createElement('div');
            profileSection.classList.add('profile-section');
            profileSection.innerHTML = `
                <h4>Profile Picture</h4>
                <div class="profile-picture-container">
                    <div class="profile-picture" id="current-profile-picture">
                        <img src="/static/images/default-avatar.png" alt="Profile Picture" id="profile-image">
                    </div>
                    <div class="profile-picture-actions">
                        <button id="upload-profile-picture" class="btn btn-sm btn-primary">Upload Photo</button>
                        <button id="remove-profile-picture" class="btn btn-sm btn-danger">Remove</button>
                    </div>
                </div>
                <input type="file" id="profile-picture-input" accept="image/*" style="display:none">
            `;
            
            // Add the profile section to settings content
            settingsContent.appendChild(profileSection);
            
            // Set up profile picture upload
            const uploadButton = document.getElementById('upload-profile-picture');
            const fileInput = document.getElementById('profile-picture-input');
            const profileImage = document.getElementById('profile-image');
            
            if (uploadButton && fileInput && profileImage) {
                // Check if we already have a saved profile picture
                const savedProfilePic = localStorage.getItem('profile_picture');
                if (savedProfilePic) {
                    profileImage.src = savedProfilePic;
                }
                
                // Set up upload button click
                uploadButton.addEventListener('click', function() {
                    fileInput.click();
                });
                
                // Handle file selection
                fileInput.addEventListener('change', function() {
                    if (this.files && this.files[0]) {
                        const reader = new FileReader();
                        
                        reader.onload = function(e) {
                            // Save to localStorage (base64 encoded)
                            localStorage.setItem('profile_picture', e.target.result);
                            
                            // Update display
                            profileImage.src = e.target.result;
                            
                            // Show success animation
                            uploadButton.innerHTML = '<i class="fas fa-check"></i>';
                            uploadButton.style.backgroundColor = 'var(--happy-color)';
                            
                            setTimeout(() => {
                                uploadButton.textContent = 'Upload Photo';
                                uploadButton.style.backgroundColor = '';
                            }, 1500);
                        };
                        
                        reader.readAsDataURL(this.files[0]);
                    }
                });
                
                // Handle remove button
                const removeButton = document.getElementById('remove-profile-picture');
                if (removeButton) {
                    removeButton.addEventListener('click', function() {
                        // Reset to default
                        localStorage.removeItem('profile_picture');
                        profileImage.src = '/static/images/default-avatar.png';
                        
                        // Show success animation
                        removeButton.innerHTML = '<i class="fas fa-check"></i>';
                        removeButton.style.backgroundColor = 'var(--sad-color)';
                        
                        setTimeout(() => {
                            removeButton.textContent = 'Remove';
                            removeButton.style.backgroundColor = '';
                        }, 1500);
                    });
                }
            }
        }
    }
    
    // Add profile picture setup when settings are opened
    // Use the existing chatSettingsBtn from earlier in the code
    if (chatSettingsBtn) {
        chatSettingsBtn.addEventListener('click', function() {
            // Add a delay to make sure the settings modal is created
            setTimeout(setupProfilePicture, 100);
        });
    }
    
    // Setup GIF button click handler
    if (gifButton) {
        gifButton.addEventListener('click', function() {
            // For now, we'll add a simple GIF picker with a few pre-selected GIFs
            const gifPicker = document.createElement('div');
            gifPicker.classList.add('gif-picker');
            gifPicker.innerHTML = `
                <div class="gif-picker-header">
                    <h4>Select a GIF</h4>
                    <button class="close-gif-picker">&times;</button>
                </div>
                <div class="gif-picker-content">
                    <div class="gif-item" data-src="/static/images/gifs/happy.svg">
                        <img src="/static/images/gifs/happy.svg" alt="Happy GIF">
                    </div>
                    <div class="gif-item" data-src="/static/images/gifs/sad.svg">
                        <img src="/static/images/gifs/sad.svg" alt="Sad GIF">
                    </div>
                    <div class="gif-item" data-src="/static/images/gifs/love.svg">
                        <img src="/static/images/gifs/love.svg" alt="Love GIF">
                    </div>
                    <div class="gif-item" data-src="/static/images/gifs/laugh.svg">
                        <img src="/static/images/gifs/laugh.svg" alt="Laugh GIF">
                    </div>
                </div>
            `;
            
            // Add to chat container
            document.body.appendChild(gifPicker);
            
            // Set up close button
            const closeButton = gifPicker.querySelector('.close-gif-picker');
            closeButton.addEventListener('click', function() {
                gifPicker.remove();
            });
            
            // Set up GIF selection
            const gifItems = gifPicker.querySelectorAll('.gif-item');
            gifItems.forEach(item => {
                item.addEventListener('click', function() {
                    const gifSrc = this.dataset.src;
                    
                    // Create message content with GIF
                    const messageContent = `<img src="${gifSrc}" alt="GIF" class="chat-gif">`;
                    
                    // Add to chat
                    const messageElement = addMessageToChat('You', messageContent, 'sent');
                    
                    // Save to server
                    const userName = getUserName();
                    const deviceId = getOrCreateDeviceId();
                    const userIdentifier = getUserIdentifier();
                    
                    fetch('/save_chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sender: 'You',
                            message: messageContent,
                            user_name: userName,
                            device_id: deviceId,
                            user_identifier: userIdentifier,
                            message_type: 'gif'
                        }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success' && data.message && data.message.id) {
                            // Store the message ID
                            messageElement.dataset.messageId = data.message.id;
                            
                            // Add delete button only (can't edit GIFs)
                            const messageActions = document.createElement('div');
                            messageActions.classList.add('message-actions');
                            
                            // Delete button
                            const deleteButton = document.createElement('button');
                            deleteButton.classList.add('message-action-btn', 'delete');
                            deleteButton.textContent = 'Delete';
                            deleteButton.addEventListener('click', function() {
                                if (confirm('Are you sure you want to delete this GIF?')) {
                                    deleteMessage(data.message.id, messageElement);
                                }
                            });
                            messageActions.appendChild(deleteButton);
                            
                            messageElement.appendChild(messageActions);
                        }
                    });
                    
                    // Close the picker
                    gifPicker.remove();
                });
            });
        });
    }
    
    // Setup sticker button click handler
    if (stickerButton) {
        stickerButton.addEventListener('click', function() {
            // Simple sticker picker
            const stickerPicker = document.createElement('div');
            stickerPicker.classList.add('sticker-picker');
            stickerPicker.innerHTML = `
                <div class="sticker-picker-header">
                    <h4>Select a Sticker</h4>
                    <button class="close-sticker-picker">&times;</button>
                </div>
                <div class="sticker-picker-content">
                    <div class="sticker-item" data-sticker="❤️">❤️</div>
                    <div class="sticker-item" data-sticker="😊">😊</div>
                    <div class="sticker-item" data-sticker="😂">😂</div>
                    <div class="sticker-item" data-sticker="👍">👍</div>
                    <div class="sticker-item" data-sticker="🎉">🎉</div>
                    <div class="sticker-item" data-sticker="🌟">🌟</div>
                    <div class="sticker-item" data-sticker="🐰">🐰</div>
                    <div class="sticker-item" data-sticker="🌈">🌈</div>
                    <div class="sticker-item" data-sticker="🍕">🍕</div>
                    <div class="sticker-item" data-sticker="🌸">🌸</div>
                    <div class="sticker-item" data-sticker="🌿">🌿</div>
                    <div class="sticker-item" data-sticker="🦄">🦄</div>
                </div>
            `;
            
            // Add to chat container
            document.body.appendChild(stickerPicker);
            
            // Set up close button
            const closeButton = stickerPicker.querySelector('.close-sticker-picker');
            closeButton.addEventListener('click', function() {
                stickerPicker.remove();
            });
            
            // Set up sticker selection
            const stickerItems = stickerPicker.querySelectorAll('.sticker-item');
            stickerItems.forEach(item => {
                item.addEventListener('click', function() {
                    const sticker = this.dataset.sticker;
                    
                    // Create message content with large sticker
                    const messageContent = `<span class="chat-sticker">${sticker}</span>`;
                    
                    // Add to chat
                    const messageElement = addMessageToChat('You', messageContent, 'sent');
                    
                    // Save to server
                    const userName = getUserName();
                    const deviceId = getOrCreateDeviceId();
                    const userIdentifier = getUserIdentifier();
                    
                    fetch('/save_chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sender: 'You',
                            message: messageContent,
                            user_name: userName,
                            device_id: deviceId,
                            user_identifier: userIdentifier,
                            message_type: 'sticker'
                        }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success' && data.message && data.message.id) {
                            // Store the message ID
                            messageElement.dataset.messageId = data.message.id;
                            
                            // Add delete button only (can't edit stickers)
                            const messageActions = document.createElement('div');
                            messageActions.classList.add('message-actions');
                            
                            // Delete button
                            const deleteButton = document.createElement('button');
                            deleteButton.classList.add('message-action-btn', 'delete');
                            deleteButton.textContent = 'Delete';
                            deleteButton.addEventListener('click', function() {
                                if (confirm('Are you sure you want to delete this sticker?')) {
                                    deleteMessage(data.message.id, messageElement);
                                }
                            });
                            messageActions.appendChild(deleteButton);
                            
                            messageElement.appendChild(messageActions);
                        }
                    });
                    
                    // Close the picker
                    stickerPicker.remove();
                });
            });
        });
    }
    
    // Function to show notification badge with count and message preview
    function showNotificationBadge(count = '', latestMessage = null) {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.style.display = 'flex';
            
            if (count && count > 1) {
                badge.textContent = count > 9 ? '9+' : count;
            } else {
                badge.textContent = '';
            }
            
            // Also show the notification dot on the rabbit if available
            const notificationDot = document.querySelector('.notification-dot');
            if (notificationDot) {
                notificationDot.style.display = 'block';
            }
            
            // Show the rabbit with notification message
            if (window.Rabbit && typeof window.Rabbit.say === 'function') {
                // If we have message details, show a WhatsApp-style notification with sender and preview
                if (latestMessage && latestMessage.sender && latestMessage.content) {
                    // Get the sender name
                    const senderName = latestMessage.user_name || latestMessage.sender || 'Someone';
                    
                    // Truncate message content for preview (max 30 chars)
                    let messagePreview = latestMessage.content;
                    if (messagePreview.length > 30) {
                        messagePreview = messagePreview.substring(0, 27) + '...';
                    }
                    
                    // Create WhatsApp style notification: "Sender: Message preview"
                    const notificationText = `${senderName}: ${messagePreview}`;
                    
                    setTimeout(() => {
                        window.Rabbit.say(notificationText);
                    }, 1000);
                }
                // Fallback to generic message if no details available
                else if (count === 1) {
                    setTimeout(() => {
                        window.Rabbit.say("You have a new message!");
                    }, 1000);
                } else if (count > 1) {
                    setTimeout(() => {
                        window.Rabbit.say(`You have ${count} new messages!`);
                    }, 1000);
                }
            }
        }
    }
    
    // Function to hide notification badge
    function hideNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.style.display = 'none';
        }
        
        // Also hide the notification dot on the rabbit
        const notificationDot = document.querySelector('.notification-dot');
        if (notificationDot) {
            notificationDot.style.display = 'none';
        }
        
        // Reset unread messages
        hasUnreadMessages = false;
        
        // Update last chat visit time
        lastChatVisit = Date.now();
        localStorage.setItem('lastChatVisit', lastChatVisit.toString());
    }
    
    // Start checking for real-time updates
    function startRealTimeUpdates() {
        if (!isRealTimeUpdatesActive) {
            console.log('Starting real-time updates...');
            isRealTimeUpdatesActive = true;
            
            // Initial check
            checkForNewMessages();
            
            // Set up polling interval
            chatPollingInterval = setInterval(checkForNewMessages, 8000);
            
            // Check if we need to show the notification badge on page load
            fetch('/get_chat_history')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success' && data.messages && data.messages.length > 0) {
                        // Check for messages newer than the last visit
                        const unreadMessages = data.messages.filter(message => {
                            const messageTime = new Date(message.timestamp).getTime();
                            const deviceId = getOrCreateDeviceId();
                            return messageTime > lastChatVisit && message.device_id !== deviceId;
                        });
                        
                        if (unreadMessages.length > 0) {
                            hasUnreadMessages = true;
                            
                            // Get the latest message for notification preview
                            const latestMessage = unreadMessages.reduce((latest, current) => {
                                if (!latest || new Date(current.timestamp) > new Date(latest.timestamp)) {
                                    return current;
                                }
                                return latest;
                            }, null);
                            
                            // Show notification with count and preview
                            showNotificationBadge(unreadMessages.length, latestMessage);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error checking unread messages:', error);
                });
        }
    }
    
    // Check for new messages at regular intervals
    function checkForNewMessages() {
        const lastId = lastMessageId;
        
        fetch('/get_chat_history?lastId=' + lastId)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // If there are new messages, add them to the chat
                    if (data.messages && data.messages.length > 0) {
                        let unreadCount = 0;
                        let newMessageReceived = false;
                        
                        data.messages.forEach(message => {
                            if (message.id > lastId) {
                                lastMessageId = Math.max(lastMessageId, message.id);
                                
                                // Don't add messages from this device
                                const deviceId = getOrCreateDeviceId();
                                const senderName = message.sender;
                                
                                if (message.device_id !== deviceId) {
                                    // Add message to chat if the chat is visible
                                    const chatContainer = document.getElementById('chat-container');
                                    if (chatContainer && !chatContainer.classList.contains('d-none')) {
                                        const messageElement = addMessageToChat(
                                            senderName, 
                                            message.content, 
                                            'received', 
                                            message.timestamp, 
                                            message.id,
                                            message.user_name,
                                            message.user_identifier
                                        );
                                    }
                                    
                                    // Check if this is a new unread message
                                    const messageTime = new Date(message.timestamp).getTime();
                                    if (messageTime > lastChatVisit) {
                                        unreadCount++;
                                        newMessageReceived = true;
                                    }
                                }
                            }
                        });
                        
                        // If we got new messages and chat is hidden, show notification
                        const chatContainer = document.getElementById('chat-container');
                        if (newMessageReceived && chatContainer && chatContainer.classList.contains('d-none')) {
                            hasUnreadMessages = true;
                            
                            // Get the latest message for the notification preview
                            const latestMessage = data.messages.reduce((latest, current) => {
                                if (!latest || new Date(current.timestamp) > new Date(latest.timestamp)) {
                                    return current;
                                }
                                return latest;
                            }, null);
                            
                            // Show notification with count and message preview
                            showNotificationBadge(unreadCount, latestMessage);
                        }
                    }
                }
            })
            .catch(error => {
                console.error('Error checking for new messages:', error);
            });
    }
    
    // Initialize the notification system
    document.addEventListener('DOMContentLoaded', function() {
        // Start real-time updates
        setTimeout(startRealTimeUpdates, 500);
        
        // Add click handler to chat button to clear notifications
        const chatButton = document.getElementById('chat-button');
        if (chatButton) {
            chatButton.addEventListener('click', function() {
                // Hide notification badge when opening chat
                hideNotificationBadge();
            }, true);
        }
    });
});
