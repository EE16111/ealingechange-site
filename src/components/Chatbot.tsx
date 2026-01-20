
import React, { useState, useEffect, useRef } from 'react';
import { sendMessage } from '../services/geminiService';
import { createChatLead } from '../services/exchangeService';
import type { ChatMessage, LeadData, AppData, Currency } from '../types';
import ChatIcon from './icons/ChatIcon';
import CloseIcon from './icons/CloseIcon';
import SendIcon from './icons/SendIcon';
import Spinner from './ui/Spinner';
import LeadCaptureForm from './LeadCaptureForm';

interface Props {
    appData: AppData | null;
}

const Chatbot: React.FC<Props> = ({ appData }) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: Date.now(),
      role: 'model',
      text: "Hi there! I'm the official Ealing Exchange Assistant. How can I help you with your currency needs today?",
      isThinking: false
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasPulsed, setHasPulsed] = useState(false);

  useEffect(() => {
    if (isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
        setHasPulsed(true);
    }
  }, [isOpen, messages]);
  
  const extractContextForLead = (chatHistory: ChatMessage[]): { currency?: string, amount?: string } => {
    let currency: string | undefined;
    let amount: string | undefined;
    
    const currencyCodes = appData?.currencies.map((c: Currency) => c.code) || [];
    const amountRegex = /([\d,]+(\.\d{1,2})?)/;

    for (const message of [...chatHistory].reverse()) {
        if (message.role === 'user') {
            const text = message.text.toUpperCase();
            if (!currency) {
                currency = currencyCodes.find((code: string) => text.includes(code));
            }
            if (!amount) {
                const match = text.match(amountRegex);
                if (match) {
                    amount = match[0].replace(/,/g, '');
                }
            }
        }
        if (currency && amount) break;
    }
    return { currency, amount };
  };

  const handleLeadSubmit = async (data: LeadData) => {
    setMessages(prev => prev.filter(msg => !msg.component));
    
    const confirmationMsg: ChatMessage = {
        id: Date.now(),
        role: 'model',
        text: `Thanks, ${data.name.split(' ')[0]}! I've sent your details to the team. They'll be ready for you. Remember to bring a valid photo ID for your transaction. We look forward to seeing you!`
    };
    setMessages(prev => [...prev, confirmationMsg]);

    try {
        await createChatLead(data);
    } catch (error) {
        console.error("Failed to create chat lead:", error);
    }
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessageText = inputValue.trim();
    if (!userMessageText || isLoading) return;

    const newUserMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      text: userMessageText,
    };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    const thinkingMessageId = Date.now() + 1;
    setMessages(prev => [...prev, { id: thinkingMessageId, role: 'model', text: '', isThinking: true }]);

    try {
      const fullResponse = await sendMessage(userMessageText, newMessages, appData);
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === thinkingMessageId
            ? { ...msg, text: fullResponse, isThinking: false }
            : msg
        )
      );
      
      const triggerPhrase = "form I've prepared for you below";
      if (fullResponse.includes(triggerPhrase)) {
        
        const leadContext = extractContextForLead(newMessages);

        const formMessage: ChatMessage = {
            id: Date.now() + 2,
            role: 'model',
            text: '',
            component: <LeadCaptureForm onSubmit={handleLeadSubmit} {...leadContext} />
        };
        setMessages(prev => [...prev, formMessage]);
      }

    } catch (error) {
      console.error("Error sending message to backend. The assistant will be disabled.", error);
      setIsAvailable(false);
      const errorMessage = "Sorry, I'm having trouble connecting to the AI assistant. This feature is currently unavailable. Please contact us directly for help.";
      setMessages(prev =>
        prev.map(msg =>
          msg.id === thinkingMessageId
            ? { ...msg, text: errorMessage, isThinking: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAvailable) {
    return null;
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(prev => !prev)} 
        className={`fixed bottom-5 right-5 bg-brand-blue text-white p-4 rounded-full shadow-lg hover:bg-slate-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow z-50 ${!hasPulsed && 'chatbot-pulse'}`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <CloseIcon className="w-8 h-8" /> : <ChatIcon className="w-8 h-8" />}
      </button>

      <div className={`fixed bottom-24 right-5 w-full max-w-sm h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-50 origin-bottom-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="flex justify-between items-center p-4 bg-brand-blue text-white rounded-t-2xl flex-shrink-0">
            <h3 className="font-bold text-lg">Ealing Exchange <span className="text-brand-yellow">Assistant</span></h3>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-slate-700" aria-label="Close chat window">
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
            <div className="space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-brand-yellow text-brand-blue rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                            {msg.isThinking ? <div className="p-1"><Spinner /></div> : (
                                msg.component ? msg.component : <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me anything..."
                    className="w-full bg-slate-100 border-2 border-slate-200 rounded-full py-2 px-4 focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow transition disabled:bg-slate-200"
                    disabled={isLoading}
                    aria-label="Your message"
                />
                <button type="submit" disabled={isLoading || !inputValue} className="bg-brand-yellow text-white p-3 rounded-full hover:bg-yellow-400 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex-shrink-0">
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
