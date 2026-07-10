import React, { useState, useRef, useEffect } from 'react';

const ChatWindow = ({ sessionId, messages: initialMessages, onMessagesUpdate, makeApiRequest, generateResponse, processAudioFile }) => {
  const [messages, setMessages] = useState(initialMessages || []);
  const [inputText, setInputText] = useState('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Update local messages when session changes
  useEffect(() => {
    setMessages(initialMessages || []);
  }, [initialMessages, sessionId]);

  // Remove the useEffect that was adding an initial greeting

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If audio file is selected, handle audio submission
    if (audioFile) {
      await handleAudioSubmit();
      return;
    }
    
    // Otherwise handle text submission as before
    if (inputText.trim() === '' || isWaitingForResponse) return;

    // Add user message
    const userMessage = { text: inputText, isUser: true };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    onMessagesUpdate(updatedMessages);
    
    const userMessageText = inputText;
    setInputText('');
    
    // Set waiting state to true
    setIsWaitingForResponse(true);

    try {
      // Generate AI response using the passed in generateResponse function
      const response = await generateResponse(sessionId, userMessageText);
      
      console.log("Received response:", response); // Debug log to check response format
      
      if (response) {
        let aiMessageText = "";
        
        if (response.messages && Array.isArray(response.messages)) {
          // Format: { messages: [{type: 'ai', content: '...'}] }
          const aiMessageObj = response.messages.find(msg => msg.type === 'ai');
          if (aiMessageObj) {
            aiMessageText = aiMessageObj.content;
          }
        } else if (response.response) {
          // Format: { response: '...', session_id: '...' }
          aiMessageText = response.response;
        } else if (typeof response === 'string') {
          // In case response is directly a string
          aiMessageText = response;
        }
        
        // Only proceed if we found a valid message text
        if (aiMessageText) {
          const aiResponse = { 
            text: aiMessageText, 
            isUser: false 
          };
          const newMessages = [...updatedMessages, aiResponse];
          setMessages(newMessages);
          onMessagesUpdate(newMessages);
        }
      }
      
      setIsWaitingForResponse(false);
    } catch (error) {
      console.error("Error in chat exchange:", error);
      setIsWaitingForResponse(false);
      
      // Add error message
      const errorMessage = { 
        text: "Sorry, there was an error processing your request. Please try again.", 
        isUser: false 
      };
      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
      onMessagesUpdate(newMessages);
    }
  };

  const handleAudioSubmit = async () => {
    if (!audioFile || isWaitingForResponse) return;
    
    // Add user message indicating audio upload
    const userMessage = { 
      text: `🎤 Sent audio file: ${audioFile.name} (${Math.round(audioFile.size/1024)} KB)`, 
      isUser: true 
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    onMessagesUpdate(updatedMessages);
    
    setIsWaitingForResponse(true);
    
    try {
      // Call the processAudioFile function from props instead of making API call here
      const response = await processAudioFile(sessionId, audioFile);
      
      console.log("Received audio response:", response); // Debug log
      
      if (response) {
        let aiMessageText = "";
        
        if (response.messages && Array.isArray(response.messages)) {
          // Format: { messages: [{type: 'ai', content: '...'}] }
          const aiMessageObj = response.messages.find(msg => msg.type === 'ai');
          if (aiMessageObj) {
            aiMessageText = aiMessageObj.content;
          }
        } else if (response.response) {
          // Format: { response: '...', session_id: '...' }
          aiMessageText = response.response;
        } else if (typeof response === 'string') {
          // In case response is directly a string
          aiMessageText = response;
        }
        
        // Only proceed if we found a valid message text
        if (aiMessageText) {
          const aiResponse = { 
            text: aiMessageText, 
            isUser: false 
          };
          const newMessages = [...updatedMessages, aiResponse];
          setMessages(newMessages);
          onMessagesUpdate(newMessages);
        }
      }
      
      // Reset the audio file after processing
      setAudioFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      setIsWaitingForResponse(false);
    } catch (error) {
      console.error("Error processing audio:", error);
      setIsWaitingForResponse(false);
      
      // Add error message
      const errorMessage = { 
        text: "Sorry, there was an error processing your audio file. Please try again.", 
        isUser: false 
      };
      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
      onMessagesUpdate(newMessages);
      
      // Reset the audio file on error
      setAudioFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is a .wav audio file
      if (file.type === 'audio/wav') {
        setAudioFile(file);
      } else {
        alert('Please select a .wav audio file');
        // Reset the file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = () => {
    setAudioFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e) => {
    // If Enter is pressed without Shift, submit the form
    if (e.key === 'Enter' && !e.shiftKey && !isWaitingForResponse) {
      e.preventDefault(); // Prevent default to avoid creating a new line
      handleSubmit(e);
    }
    // If Shift+Enter is pressed, let the default behavior (new line) happen
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden shadow-lg">
      {/* Chat header */}
      <div className="bg-indigo-600 text-white px-4 py-3 flex items-center">
        <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
            <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
          </svg>
        </div>
        <div>
          <h2 className="font-semibold text-lg">AI Assistant</h2>
          <p className="text-xs text-indigo-200">Active Session</p>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex mb-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                  message.isUser 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Start a new conversation</p>
          </div>
        )}
        {isWaitingForResponse && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center">
              <span className="typing-indicator">AI is typing</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area with audio upload button */}
      <form onSubmit={handleSubmit} className="border-t border-gray-300 p-4 bg-white">
        <div className="flex">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="audio/wav"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {/* Audio upload button */}
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isWaitingForResponse || audioFile !== null}
            className={`px-3 py-2 rounded-l-lg transition-colors ${
              isWaitingForResponse || audioFile !== null
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            title="Upload .wav audio file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 2a1 1 0 011 1v3a1 1 0 11-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm10-8a1 1 0 01-1 1h-3a1 1 0 110-2h3a1 1 0 011 1zM6 10a1 1 0 01-1 1H2a1 1 0 110-2h3a1 1 0 011 1zm14.95 4.536l-2.12-2.122a1 1 0 00-1.414 1.414l2.12 2.122a1 1 0 001.414-1.414zm-14.486.024l-2.122 2.12a1 1 0 001.414 1.415l2.122-2.12a1 1 0 00-1.414-1.415zM6.464 5.464L4.344 3.344a1 1 0 00-1.414 1.414l2.12 2.12a1 1 0 101.414-1.414zm14.5.042l-2.121-2.12a1 1 0 10-1.415 1.413l2.121 2.12a1 1 0 001.415-1.413z" />
            </svg>
          </button>
          
          {/* Display selected file or text input */}
          {audioFile ? (
            <div className="flex-1 bg-gray-100 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 truncate">{audioFile.name}</span>
                <span className="ml-2 text-xs text-gray-500">({Math.round(audioFile.size/1024)} KB)</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700"
                disabled={isWaitingForResponse}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isWaitingForResponse ? "Waiting for response..." : "Type your message here... (Shift+Enter for new line)"}
              className={`flex-1 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[40px] max-h-[120px] resize-y ${
                isWaitingForResponse ? 'bg-gray-200 text-gray-500' : 'bg-gray-100'
              } ${audioFile ? 'rounded-l-none' : ''}`}
              rows={1}
              disabled={isWaitingForResponse}
            />
          )}
          
          <button 
            type="submit"
            className={`text-white px-4 py-2 rounded-r-lg transition-colors ${
              isWaitingForResponse ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            disabled={isWaitingForResponse || (audioFile === null && inputText.trim() === '')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
