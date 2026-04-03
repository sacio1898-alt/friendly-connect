import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useSettings, useProducts, useCategories } from '@/hooks/useFirestoreData';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  quickReplies?: string[];
}

interface ChatBotProps {
  open: boolean;
  onClose: () => void;
}

export default function ChatBot({ open, onClose }: ChatBotProps) {
  const { settings } = useSettings();
  const { products } = useProducts();
  const { categories } = useCategories();

  const getGreeting = () => ({
    text: `আসসালামু আলাইকুম! ${settings.appName} এ স্বাগতম! আমি আপনাকে কিভাবে সাহায্য করতে পারি?`,
    quickReplies: ['🛍️ প্রোডাক্ট খুঁজুন', '📦 অর্ডার ট্র্যাক', '💰 পেমেন্ট', '🚚 ডেলিভারি', '↩️ রিটার্ন পলিসি', '📞 যোগাযোগ', '📂 ক্যাটাগরি', '🏷️ অফার'],
  });

  const getResponse = (input: string): { text: string; quickReplies?: string[] } => {
    const lower = input.toLowerCase();

    if (lower.includes('প্রোডাক্ট') || lower.includes('product') || lower.includes('খুঁজ') || lower.includes('search') || lower.includes('পণ্য')) {
      const matched = products.filter(p => p.name.toLowerCase().includes(lower) || p.tags?.some(t => lower.includes(t.toLowerCase()))).slice(0, 3);
      if (matched.length > 0) {
        const list = matched.map(p => `• ${p.name} — ৳${p.price}`).join('\n');
        return { text: `আপনার জন্য কিছু প্রোডাক্ট পেয়েছি:\n\n${list}`, quickReplies: ['📂 ক্যাটাগরি', '💰 পেমেন্ট', '📞 যোগাযোগ'] };
      }
      return { text: `আমাদের কাছে ${products.length}+ প্রোডাক্ট রয়েছে। হোমপেজে আপনার পছন্দের পণ্য খুঁজুন!`, quickReplies: ['📂 ক্যাটাগরি', '🏷️ অফার'] };
    }
    if (lower.includes('ক্যাটাগরি') || lower.includes('category')) {
      const catList = categories.slice(0, 6).map(c => `• ${c.icon} ${c.name}`).join('\n');
      return { text: `আমাদের ক্যাটাগরি:\n\n${catList}`, quickReplies: ['🛍️ প্রোডাক্ট খুঁজুন', '💰 পেমেন্ট'] };
    }
    if (lower.includes('order') || lower.includes('অর্ডার') || lower.includes('ট্র্যাক')) {
      return { text: 'অর্ডার ট্র্যাক করতে Profile > My Orders এ যান।', quickReplies: ['↩️ রিটার্ন পলিসি', '📞 যোগাযোগ'] };
    }
    if (lower.includes('return') || lower.includes('রিটার্ন') || lower.includes('রিফান্ড')) {
      return { text: '↩️ রিটার্ন পলিসি:\n• ৭ দিনের মধ্যে রিটার্ন\n• অব্যবহৃত ও অরিজিনাল প্যাকেজিং\n• রিফান্ড ৩-৫ কার্যদিবসে', quickReplies: ['📦 অর্ডার ট্র্যাক', '📞 যোগাযোগ'] };
    }
    if (lower.includes('payment') || lower.includes('পেমেন্ট') || lower.includes('bkash') || lower.includes('nagad') || lower.includes('cod')) {
      let info = '💰 পেমেন্ট:\n• ক্যাশ অন ডেলিভারি (COD)';
      if (settings.bkashNumber) info += `\n• bKash: ${settings.bkashNumber}`;
      if (settings.nagadNumber) info += `\n• Nagad: ${settings.nagadNumber}`;
      return { text: info, quickReplies: ['🚚 ডেলিভারি', '📞 যোগাযোগ'] };
    }
    if (lower.includes('delivery') || lower.includes('ডেলিভারি') || lower.includes('শিপিং')) {
      let info = '🚚 ডেলিভারি:\n• সাধারণ: ৩-৫ দিন\n• এক্সপ্রেস: ১-২ দিন';
      if (settings.deliveryAreas?.length > 0) {
        info += '\n\n📍 এরিয়া ও চার্জ:';
        settings.deliveryAreas.forEach(a => { info += `\n• ${a.name} — ৳${a.charge}`; });
      }
      return { text: info, quickReplies: ['📦 অর্ডার ট্র্যাক', '💰 পেমেন্ট'] };
    }
    if (lower.includes('contact') || lower.includes('যোগাযোগ') || lower.includes('ফোন')) {
      let info = '📞 যোগাযোগ:';
      if (settings.phone) info += `\n• ফোন: ${settings.phone}`;
      if (settings.whatsapp) info += `\n• WhatsApp: ${settings.whatsapp}`;
      if (settings.email) info += `\n• ইমেইল: ${settings.email}`;
      return { text: info, quickReplies: ['📦 অর্ডার ট্র্যাক', '💰 পেমেন্ট'] };
    }
    if (lower.includes('offer') || lower.includes('অফার') || lower.includes('ডিসকাউন্ট')) {
      const featured = products.filter(p => p.featured || (p.originalPrice && p.originalPrice > p.price)).slice(0, 3);
      if (featured.length > 0) {
        const list = featured.map(p => {
          const d = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
          return `• ${p.name} — ৳${p.price} ${d > 0 ? `(${d}% ছাড়!)` : ''}`;
        }).join('\n');
        return { text: `🏷️ চলমান অফার:\n\n${list}`, quickReplies: ['🛍️ প্রোডাক্ট খুঁজুন', '📞 যোগাযোগ'] };
      }
      return { text: 'হোমপেজে অফার দেখুন!', quickReplies: ['🛍️ প্রোডাক্ট খুঁজুন'] };
    }
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('সালাম') || lower.includes('আসসালামু')) return getGreeting();
    if (lower.includes('point') || lower.includes('পয়েন্ট') || lower.includes('loyalty')) {
      return { text: `⭐ লয়ালটি পয়েন্ট:\n• প্রতি অর্ডারে পয়েন্ট\n• ${settings.pointsPerTaka || 10} পয়েন্ট = ৳1\n• রেফারেল: ৫০ পয়েন্ট বোনাস`, quickReplies: ['📦 অর্ডার ট্র্যাক', '📞 যোগাযোগ'] };
    }
    if (lower.includes('কিভাবে') || lower.includes('how') || lower.includes('অর্ডার কর')) {
      return { text: '🛒 অর্ডার:\n১. প্রোডাক্ট সিলেক্ট\n২. সাইজ/কালার বেছে নিন\n৩. Cart এ যোগ করুন\n৪. Checkout এ তথ্য দিন\n৫. কনফার্ম!', quickReplies: ['💰 পেমেন্ট', '🚚 ডেলিভারি'] };
    }
    return { text: 'দুঃখিত, আমি বুঝতে পারিনি। নিচের অপশন থেকে বেছে নিন।', quickReplies: ['🛍️ প্রোডাক্ট খুঁজুন', '📦 অর্ডার ট্র্যাক', '💰 পেমেন্ট', '📞 যোগাযোগ'] };
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const g = getGreeting();
    setMessages([{ id: '0', text: g.text, isBot: true, quickReplies: g.quickReplies }]);
  }, [settings.appName]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), text, isBot: false }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const resp = getResponse(text);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: resp.text, isBot: true, quickReplies: resp.quickReplies }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-20 right-4 w-80 h-[28rem] bg-card border border-border rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden lg:bottom-6"
    >
      <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><Bot size={18} /><span className="font-semibold text-sm">{settings.appName} Support</span></div>
        <button onClick={onClose}><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className="max-w-[85%]">
              <div className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${msg.isBot ? 'bg-muted text-foreground rounded-bl-sm' : 'bg-primary text-primary-foreground rounded-br-sm'}`}>
                {msg.text}
              </div>
              {msg.quickReplies && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.quickReplies.map(qr => (
                    <button key={qr} onClick={() => sendMessage(qr)} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors">
                      {qr}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="p-2 border-t border-border flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="মেসেজ লিখুন..." className="h-9 text-sm" />
        <Button type="submit" size="icon" className="h-9 w-9 shrink-0"><Send size={14} /></Button>
      </form>
    </motion.div>
  );
}
