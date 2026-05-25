'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import './CatChat.css';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import catAnimation from '../../public/cat.json';

export default function CatChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('Meow! I am Meso. Ask me anything about Anirudh.');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, response]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    const userQuery = query.trim();
    setQuery('');
    setResponse('...thinking (purrrr)...');
    
    const newMessage = { role: 'user', content: userQuery };
    const updatedHistory = [...chatHistory, newMessage];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedHistory
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.message) {
        const aiResponse = data.message;
        setResponse(aiResponse);
        setChatHistory([...updatedHistory, { role: 'assistant', content: aiResponse }]);
      } else {
        setResponse('Meow... I am confused right now.');
        console.error('Chat Error:', data.error);
      }
    } catch (err) {
      setResponse('Meow... something went wrong. Try again!');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cat-chat-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="cat-chat-tooltip"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="cat-chat-content">
              {response}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSubmit} className="cat-chat-form">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me something..." 
                className="cat-chat-input"
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading} className="cat-chat-submit" title="Send">
                {isLoading ? '🐾' : '➤'}
              </button>
            </form>

            <div className="cat-chat-arrow" />
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="cat-chat-avatar" 
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with me!"
        style={{ cursor: 'pointer' }}
      >
        <Lottie animationData={catAnimation} loop={true} style={{ width: 70, height: 70 }} />
      </div>
    </div>
  );
}
