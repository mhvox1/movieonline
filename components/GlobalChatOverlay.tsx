import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type GlobalChatMessage = {
  id: string;
  userId: string;
  username: string;
  studioName?: string | null;
  text: string;
  createdAtIso: string;
};

type ApiRequest = (path: string, init?: RequestInit, tokenOverride?: string) => Promise<any>;

type GlobalChatOverlayProps = {
  isVisible: boolean;
  language: 'de' | 'en';
  currentUserId?: string | null;
  apiRequest: ApiRequest;
};

const POLL_INTERVAL_MS = 4000;

const GlobalChatOverlay: React.FC<GlobalChatOverlayProps> = ({
  isVisible,
  language,
  currentUserId,
  apiRequest,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<GlobalChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const lastSeenMessageIdRef = useRef<string>('');
  const listRef = useRef<HTMLDivElement | null>(null);

  const t = useMemo(() => {
    if (language === 'de') {
      return {
        title: 'Globaler Chat',
        placeholder: 'Nachricht schreiben...',
        send: 'Senden',
        loading: 'Lade Chat...',
        empty: 'Noch keine Nachrichten.',
        expand: 'Aufklappen',
        collapse: 'Zuklappen',
        refreshFailed: 'Chat konnte nicht geladen werden.',
      };
    }
    return {
      title: 'Global Chat',
      placeholder: 'Write a message...',
      send: 'Send',
      loading: 'Loading chat...',
      empty: 'No messages yet.',
      expand: 'Expand',
      collapse: 'Collapse',
      refreshFailed: 'Could not load chat.',
    };
  }, [language]);

  const formatTime = useCallback((iso: string) => {
    const value = new Date(iso);
    if (Number.isNaN(value.getTime())) return '--:--';
    return value.toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [language]);

  const fetchMessages = useCallback(async () => {
    if (!isVisible) return;
    setLoading(true);
    try {
      const result = await apiRequest('/chat/global?limit=120', { method: 'GET' });
      const nextMessages = Array.isArray(result?.messages) ? result.messages : [];
      setMessages(nextMessages);
      setError('');

      const latestId = nextMessages.length > 0 ? String(nextMessages[nextMessages.length - 1]?.id || '') : '';
      if (latestId && lastSeenMessageIdRef.current && latestId !== lastSeenMessageIdRef.current && !isExpanded) {
        setUnreadCount(prev => prev + 1);
      }

      if (latestId) {
        lastSeenMessageIdRef.current = latestId;
      }
    } catch {
      setError(t.refreshFailed);
    } finally {
      setLoading(false);
    }
  }, [apiRequest, isExpanded, isVisible, t.refreshFailed]);

  useEffect(() => {
    if (!isVisible) return;
    fetchMessages();
    const timer = window.setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [fetchMessages, isVisible]);

  useEffect(() => {
    if (!isVisible || !isExpanded) return;
    setUnreadCount(0);
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [isVisible, isExpanded, messages.length]);

  useEffect(() => {
    if (!isVisible) {
      setIsExpanded(false);
      setUnreadCount(0);
      setError('');
    }
  }, [isVisible]);

  const visibleMessages = isExpanded ? messages : messages.slice(-3);

  const onToggle = () => {
    setIsExpanded(prev => {
      const next = !prev;
      if (next) {
        setUnreadCount(0);
      }
      return next;
    });
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await apiRequest('/chat/global', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      setInput('');
      setError('');
      await fetchMessages();
    } catch {
      setError(t.refreshFailed);
    } finally {
      setSending(false);
    }
  };

  const onInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await sendMessage();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 w-[88%] max-w-4xl pointer-events-none">
      <div className="pointer-events-auto rounded-xl border border-white/20 bg-slate-900/25 backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-white/80 font-bold">{t.title}</span>
            {!isExpanded && unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black">+{unreadCount}</span>
            )}
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="text-xs font-bold uppercase tracking-wide text-white/80 hover:text-white transition-colors"
          >
            {isExpanded ? t.collapse : t.expand}
          </button>
        </div>

        <div
          ref={listRef}
          className={`${isExpanded ? 'max-h-64' : 'max-h-20'} overflow-y-auto px-4 py-2 transition-all duration-200`}
        >
          {loading && messages.length === 0 && (
            <p className="text-white/65 text-xs">{t.loading}</p>
          )}
          {!loading && visibleMessages.length === 0 && (
            <p className="text-white/65 text-xs">{t.empty}</p>
          )}

          <div className="space-y-1">
            {visibleMessages.map((msg) => {
              const ownMessage = currentUserId ? String(msg.userId) === String(currentUserId) : false;
              return (
                <div key={msg.id} className="text-xs leading-5 text-white/90">
                  <span className={`font-bold ${ownMessage ? 'text-cyan-300' : 'text-amber-300'}`}>
                    {msg.username}
                  </span>
                  <span className="text-white/45 ml-2">{formatTime(msg.createdAtIso)}</span>
                  <span className="text-white/85 ml-2 block truncate">{msg.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {isExpanded && (
          <div className="px-3 pb-3 pt-1 border-t border-white/10">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={onInputKeyDown}
                maxLength={400}
                placeholder={t.placeholder}
                className="w-full bg-black/30 border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={sending || input.trim().length === 0}
                className="bg-cyan-500/80 hover:bg-cyan-400 disabled:bg-slate-600 disabled:text-white/40 text-black font-bold text-xs uppercase tracking-wide px-3 py-2 rounded-md transition-colors"
              >
                {t.send}
              </button>
            </div>
            {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalChatOverlay;
