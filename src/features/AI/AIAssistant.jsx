import { useEffect, useRef, useState } from 'react';
import { sendAIMessage } from './aiApi';
import './AIAssistant.css';

function getCustomerFromToken() {
  try {
    const token = localStorage.getItem('customerToken');

    if (!token) {
      return null;
    }

    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    const decoded = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    );

    return decoded;
  } catch (error) {
    console.error('Could not decode customer token:', error);
    return null;
  }
}

function RobotIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="6"
        width="16"
        height="13"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M12 3V6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <circle
        cx="12"
        cy="2.5"
        r="1"
        fill="currentColor"
      />

      <circle
        cx="9"
        cy="12"
        r="1.2"
        fill="currentColor"
      />

      <circle
        cx="15"
        cy="12"
        r="1.2"
        fill="currentColor"
      />

      <path
        d="M9 16H15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="M4 11H2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M21.5 11H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AIAssistant() {
  const [isCustomer, setIsCustomer] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState([]);

  const [sessionId, setSessionId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [showHint, setShowHint] = useState(true);

  const messagesEndRef = useRef(null);


  /*
   * Check whether the logged-in user is a customer.
   */
  useEffect(() => {
    const user = getCustomerFromToken();

    if (user?.role === 'customer') {
      setIsCustomer(true);
    } else {
      setIsCustomer(false);
    }
  }, []);


  /*
   * Scroll automatically to the newest message.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, loading]);


  const handleSend = async () => {
    if (!message.trim() || loading) {
      return;
    }

    const userMessage = message.trim();

    // Display user's message immediately
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
      },
    ]);

    setMessage('');

    setLoading(true);

    try {
      const data = await sendAIMessage({
        message: userMessage,
        sessionId,
      });

      // Save session ID only in React state.
      // It will be reset when the page/component is refreshed.
      setSessionId(data.sessionId);

      // Display AI response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error('AI chat error:', error);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, I could not process your request. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      handleSend();
    }
  };


  /*
   * Don't render anything for admins.
   */
  if (!isCustomer) {
    return null;
  }


  return (
    <>
      {/* Small notification / hint */}
      {!isOpen && showHint && (
        <div className="ai-hint">

          <div className="ai-hint-icon">
            <RobotIcon size={18} />
          </div>

          <div className="ai-hint-text">
            <strong>Need help?</strong>
            <span>Ask our AI Assistant</span>
          </div>

          <button
            className="ai-hint-close"
            onClick={() => setShowHint(false)}
            aria-label="Close AI hint"
          >
            ×
          </button>

        </div>
      )}


      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">

          {/* Header */}
          <div className="ai-chat-header">

            <div className="ai-chat-title">

              <div className="ai-header-robot">
                <RobotIcon size={25} />
              </div>

              <div>
                <h3>AI Assistant</h3>

                <span>
                  Online
                </span>
              </div>

            </div>

            <button
              className="ai-close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Assistant"
            >
              ×
            </button>

          </div>


          {/* Messages */}
          <div className="ai-chat-messages">

            {messages.length === 0 && (
              <div className="ai-welcome">

                <div className="ai-welcome-robot">
                  <RobotIcon size={34} />
                </div>

                <h3>
                  Hi! I'm your AI Assistant
                </h3>

                <p>
                  Ask me anything about your gym,
                  workouts, memberships, classes,
                  or fitness.
                </p>

              </div>
            )}


            {messages.map((msg, index) => (
              <div
                key={index}
                className={`ai-message-row ${
                  msg.role === 'user'
                    ? 'user-message-row'
                    : 'assistant-message-row'
                }`}
              >

                {msg.role === 'assistant' && (
                  <div className="ai-message-avatar">
                    <RobotIcon size={16} />
                  </div>
                )}

                <div
                  className={`ai-message ${
                    msg.role === 'user'
                      ? 'user-message'
                      : 'assistant-message'
                  }`}
                >
                  {msg.content}
                </div>

              </div>
            ))}


            {loading && (
              <div className="ai-message-row assistant-message-row">

                <div className="ai-message-avatar">
                  <RobotIcon size={16} />
                </div>

                <div className="ai-message assistant-message typing">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>

              </div>
            )}


            <div ref={messagesEndRef} />

          </div>


          {/* Input */}
          <div className="ai-chat-input-container">

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              disabled={loading}
            />

            <button
              className="ai-send-button"
              onClick={handleSend}
              disabled={loading || !message.trim()}
              aria-label="Send message"
            >
              ➤
            </button>

          </div>

        </div>
      )}


      {/* Floating Button */}
      <button
        className={`ai-floating-button ${
          isOpen ? 'ai-floating-button-open' : ''
        }`}
        onClick={() => {
          setIsOpen((prev) => !prev);
          setShowHint(false);
        }}
        aria-label={
          isOpen
            ? 'Close AI Assistant'
            : 'Open AI Assistant'
        }
      >
        {isOpen ? (
          '×'
        ) : (
          <RobotIcon size={48} />
        )}
      </button>
    </>
  );
}