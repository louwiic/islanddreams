'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import ReactMarkdown, { type Components } from 'react-markdown';
import Image from 'next/image';
import { MessageCircle, X, Send, Loader2, Bot, User, RotateCcw } from 'lucide-react';

type Config = {
  is_enabled: boolean;
  welcome_message: string;
  assistant_name: string;
  assistant_avatar: string;
  primary_color: string;
  text_color: string;
  position: string;
};

function getMessageText(parts: Array<{ type: string; text?: string }>): string {
  return parts.filter((p) => p.type === 'text').map((p) => p.text ?? '').join('');
}

function linkifyText(text: string): string {
  return text.replace(/\*{0,2}(https?:\/\/[^\s)<>*]+)\*{0,2}/g, (_, url) => `[${url}](${url})`);
}

const mdComponents: Components = {
  a: ({ href, children }) => (
    <a href={href} className="underline underline-offset-2 hover:opacity-80" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

function Avatar({ url, color, size = 32 }: { url: string; color: string; size?: number }) {
  if (url) return (
    <div className="relative shrink-0 rounded-full overflow-hidden" style={{ width: size, height: size }}>
      <Image src={url} alt="" fill className="object-cover" unoptimized />
    </div>
  );
  return (
    <div className="flex shrink-0 items-center justify-center rounded-full" style={{ width: size, height: size, backgroundColor: `${color}25` }}>
      <Bot size={size * 0.45} style={{ color }} />
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationIdRef = useRef<string | null>(null);

  const transport = useMemo(() => new TextStreamChatTransport({
    api: '/api/chat',
    fetch: async (url, init) => {
      if (init?.body) {
        try {
          const body = JSON.parse(init.body as string);
          body.conversationId = conversationIdRef.current;
          init = { ...init, body: JSON.stringify(body) };
        } catch { /* ignore */ }
      }
      const response = await globalThis.fetch(url, init);
      const newId = response.headers.get('X-Conversation-Id');
      if (newId) conversationIdRef.current = newId;
      return response;
    },
  }), []);

  const { messages, sendMessage, setMessages, status } = useChat({ transport });
  const isStreaming = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    fetch('/api/chatbot/config').then((r) => r.json()).then(setConfig).catch(() => setConfig({ is_enabled: false, welcome_message: '', assistant_name: '', assistant_avatar: '', primary_color: '#16a34a', text_color: '#ffffff', position: 'bottom-right' }));
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 150); }, [open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    sendMessage({ text });
  };

  const handleReset = useCallback(() => {
    conversationIdRef.current = null;
    setMessages([]);
  }, [setMessages]);

  if (!config?.is_enabled) return null;

  const isRight = config.position !== 'bottom-left';

  return (
    <>
      {/* Panel */}
      {open && (
        <div
          className={`fixed z-[9999] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl
            bottom-0 left-0 right-0 h-full
            sm:bottom-24 sm:left-auto sm:right-auto sm:h-[580px] sm:w-[380px] sm:rounded-2xl
            ${isRight ? 'sm:right-6' : 'sm:left-6'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ backgroundColor: config.primary_color, color: config.text_color }}>
            <div className="flex items-center gap-3">
              <Avatar url={config.assistant_avatar} color={config.primary_color} size={36} />
              <div>
                <p className="text-sm font-semibold">{config.assistant_name || 'Assistant'}</p>
                <p className="text-xs opacity-75">Assistant virtuel</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button onClick={handleReset} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="Nouvelle conversation">
                  <RotateCcw size={15} />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {config.welcome_message && (
              <div className="flex gap-3">
                <Avatar url={config.assistant_avatar} color={config.primary_color} />
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2.5 text-sm text-gray-800">
                  {config.welcome_message}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const text = getMessageText(msg.parts);
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                  {isUser ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                      <User size={14} className="text-gray-600" />
                    </div>
                  ) : (
                    <Avatar url={config.assistant_avatar} color={config.primary_color} />
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isUser ? 'rounded-tr-sm text-white' : 'rounded-tl-sm bg-gray-100 text-gray-800'}`}
                    style={isUser ? { backgroundColor: config.primary_color } : undefined}
                  >
                    {isUser ? <p>{text}</p> : (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown components={mdComponents}>{linkifyText(text)}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isStreaming && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <Avatar url={config.assistant_avatar} color={config.primary_color} />
                <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 shrink-0 bg-white">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Votre message..."
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="shrink-0 rounded-xl p-2.5 text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: config.primary_color }}
              >
                {isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bulle */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={`fixed z-[9999] flex items-center justify-center rounded-full shadow-xl transition-transform hover:scale-110 bottom-6 ${isRight ? 'right-6' : 'left-6'}`}
          style={{ width: 56, height: 56, backgroundColor: config.primary_color, color: config.text_color }}
          aria-label="Ouvrir le chat"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </>
  );
}
