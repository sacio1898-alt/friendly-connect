import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Phone, Bot, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/hooks/useFirestoreData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ChatBot from './ChatBot';

function MessengerIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.15 7.2V22l2.96-1.63c.84.23 1.73.36 2.66.36h.23c5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1.08 13.04l-2.55-2.73L5.8 15.04l4.7-4.98 2.55 2.73 4.73-2.73-4.7 4.98z"/>
    </svg>
  );
}

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function SupportFab() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [waMessages, setWaMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const { settings } = useSettings();
  const location = useLocation();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [waMessages]);

  useEffect(() => {
    if (whatsAppOpen && waMessages.length === 0) {
      setWaMessages([{ text: 'আসসালামু আলাইকুম! 👋\nকিভাবে সাহায্য করতে পারি?', isUser: false }]);
    }
  }, [whatsAppOpen]);

  const hiddenPaths = ['/admin'];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) return null;

  const hasWhatsApp = settings.whatsappEnabled !== false && settings.whatsapp;
  const hasCall = settings.callEnabled !== false && settings.phone;
  const hasMessenger = settings.messengerEnabled !== false && settings.facebookPageId;
  const hasChatbot = settings.chatbotEnabled !== false;

  const options = [
    hasChatbot && {
      label: 'চ্যাটবট',
      icon: <Bot size={18} />,
      color: 'bg-primary text-primary-foreground',
      action: () => { setChatOpen(true); setMenuOpen(false); },
    },
    hasWhatsApp && {
      label: 'WhatsApp',
      icon: <WhatsAppIcon size={18} />,
      color: 'bg-[#25D366] text-white',
      action: () => { setWhatsAppOpen(true); setMenuOpen(false); },
    },
    hasCall && {
      label: 'কল করুন',
      icon: <Phone size={18} />,
      color: 'bg-blue-500 text-white',
      action: () => { window.location.href = `tel:${settings.phone}`; setMenuOpen(false); },
    },
    hasMessenger && {
      label: 'Messenger',
      icon: <MessengerIcon size={18} />,
      color: 'bg-[#0084FF] text-white',
      action: () => {
        const fbLink = settings.facebookPageId?.startsWith('http') ? settings.facebookPageId : `https://m.me/${settings.facebookPageId}`;
        window.open(fbLink, '_blank');
        setMenuOpen(false);
      },
    },
  ].filter(Boolean) as { label: string; icon: React.ReactNode; color: string; action: () => void }[];

  if (chatOpen) {
    return <ChatBot open={chatOpen} onClose={() => setChatOpen(false)} />;
  }

  const sendWhatsApp = () => {
    if (!waMessage.trim()) return;
    const msg = waMessage.trim();
    setWaMessages(prev => [...prev, { text: msg, isUser: true }]);
    setWaMessage('');

    const num = settings.whatsapp?.replace(/[^0-9]/g, '') || '';
    const url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;

    setTimeout(() => {
      setWaMessages(prev => [...prev, { text: 'আপনার মেসেজ WhatsApp এ পাঠানো হচ্ছে...', isUser: false }]);
      setTimeout(() => window.open(url, '_blank'), 500);
    }, 300);
  };

  return (
    <>
      {/* WhatsApp Chat Panel - full chatbot style */}
      <AnimatePresence>
        {whatsAppOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            className="fixed bottom-20 right-4 w-[340px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl z-[60] overflow-hidden flex flex-col lg:bottom-6"
            style={{ maxHeight: 'calc(100vh - 140px)' }}
          >
            {/* Header */}
            <div className="bg-[#25D366] text-white p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <WhatsAppIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{settings.appName || 'Support'}</p>
                <p className="text-[10px] opacity-80">সাধারণত কয়েক মিনিটের মধ্যে উত্তর দেয়</p>
              </div>
              <button onClick={() => { setWhatsAppOpen(false); setWaMessages([]); }} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[300px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMykiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')]">
              {waMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                    msg.isUser
                      ? 'bg-[#DCF8C6] text-gray-900 rounded-br-sm'
                      : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-border bg-card">
              <form onSubmit={e => { e.preventDefault(); sendWhatsApp(); }} className="flex gap-2 items-center">
                <Input
                  value={waMessage}
                  onChange={e => setWaMessage(e.target.value)}
                  placeholder="মেসেজ লিখুন..."
                  className="h-10 text-sm rounded-full bg-muted border-0"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!waMessage.trim()}
                  className="h-10 w-10 shrink-0 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white"
                >
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB + Options - hide when whatsapp or chatbot is open */}
      {!whatsAppOpen && (
        <div className={`fixed right-4 z-50 flex flex-col-reverse items-end gap-3 lg:bottom-6 ${location.pathname.startsWith('/product/') ? 'bottom-[120px]' : 'bottom-20'}`}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center"
          >
            {menuOpen ? <X size={22} /> : <MessageCircle size={22} />}
          </motion.button>

          <AnimatePresence>
            {menuOpen && options.map((opt, i) => (
              <motion.button
                key={opt.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: i * 0.05 }}
                onClick={opt.action}
                className={`flex items-center gap-2.5 pl-4 pr-5 py-2.5 rounded-full shadow-lg ${opt.color} text-sm font-medium`}
              >
                {opt.icon}
                {opt.label}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
