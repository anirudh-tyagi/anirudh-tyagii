'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import './CatChat.css';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function CatChat() {
  // Stays shut until asked. It used to open itself a beat after load, which
  // covered the hero on arrival and made the first thing you saw a chat box
  // nobody had asked for. A brief nudge by the avatar does the same job of
  // advertising that the cat is interactive, without taking the screen.
  const [isOpen, setIsOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [tapWord, setTapWord] = useState('tap');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('Meso. I live here. I was not consulted about it. Ask me something about Anirudh.');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  // Fetched at runtime instead of statically imported, so the ~480KB
  // animation JSON ships as a cached static asset, not client JS.
  const [catAnimation, setCatAnimation] = useState<object | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // "tap" on touch, "click" on a mouse — the nudge is an instruction, so
    // it should name the gesture the visitor actually has.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setTapWord('click');
    }

    // Appears once the page has settled, then gets out of the way. A hint
    // that never leaves stops being a hint and becomes furniture.
    const show = window.setTimeout(() => setShowNudge(true), 1800);
    const hide = window.setTimeout(() => setShowNudge(false), 9000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  // 470KB of animation: fetched once the browser is idle so it never
  // competes with content for first paint, but with a short timeout since
  // the avatar has no stand-in and should not stay empty for long.
  useEffect(() => {
    const load = () => {
      fetch('/cat.json')
        .then((res) => res.json())
        .then(setCatAnimation)
        .catch(() => {});
    };

    const ric = window.requestIdleCallback;
    if (typeof ric === 'function') {
      const id = ric(load, { timeout: 800 });
      return () => window.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(load, 400);
    return () => window.clearTimeout(t);
  }, []);

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
    setResponse('thinking. or sleeping. hard to tell from outside.');
    
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
      } else if (res.status === 429) {
        setResponse(data.error || 'Too many questions. I have a nap booked. Try again shortly.');
      } else if (res.status === 400 && data.error) {
        setResponse(`Meow... ${data.error.toLowerCase()}`);
      } else {
        setResponse('I have no idea what that was. Use words. Preferably about Anirudh.');
        console.error('Chat Error:', data.error);
      }
    } catch (err) {
      setResponse('Something broke. Not my fault, I have no thumbs. Try again.');
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
            <div className="cat-chat-header">
              <span className="cat-chat-title">
                <span className="cat-chat-live" />
                meso@portfolio<span className="cat-chat-tilde">:~</span>
              </span>
              <button
                type="button"
                className="cat-chat-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                &times;
              </button>
            </div>

            <div className="cat-chat-content">
              {isLoading ? (
                <span className="cat-typing" aria-label="Meso is typing">
                  <span className="cat-typing-paw">🐾</span>
                  <i /><i /><i />
                </span>
              ) : (
                response
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSubmit} className="cat-chat-form">
              <span className="cat-chat-caret" aria-hidden="true">&gt;</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ask about Anirudh..."
                className="cat-chat-input"
                disabled={isLoading}
                maxLength={500}
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
        onClick={() => {
          setShowNudge(false);
          setIsOpen(!isOpen);
        }}
        title={isOpen ? 'Let the cat sleep' : 'Disturb the cat'}
        style={{ cursor: 'pointer' }}
      >
        {catAnimation && (
          <Lottie animationData={catAnimation} loop={true} style={{ width: 70, height: 70 }} />
        )}

        {!isOpen && showNudge && (
          <span className="cat-chat-nudge" aria-hidden="true">{tapWord} to talk to me</span>
        )}
      </div>
    </div>
  );
}
