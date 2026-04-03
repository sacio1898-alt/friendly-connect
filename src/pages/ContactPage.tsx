import { useState } from 'react';
import { Send, Phone, Mail, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/hooks/useFirestoreData';
import SEOHead from '@/components/SEOHead';

export default function ContactPage() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', subject: '', message: '' });
  const [whatsappMsg, setWhatsappMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Name: ${form.name}\n\n${form.message}`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `mailto:${settings.email}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`;
    } else {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${settings.email}&su=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`, '_blank');
    }
  };

  const sendWhatsApp = () => {
    if (!whatsappMsg.trim()) return;
    const num = settings.whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
    setWhatsappMsg('');
  };

  return (
    <div className="max-w-screen-md mx-auto px-4 py-5 pb-nav lg:pb-8 space-y-8">
      <SEOHead
        title={`যোগাযোগ করুন — ${settings.appName}`}
        description={`${settings.appName} এ যোগাযোগ করুন। ফোন, WhatsApp, ইমেইলে আমাদের সাথে কথা বলুন।`}
        url="https://zupramart.netlify.app/contact"
      />

      <h1 className="font-bold text-xl">যোগাযোগ করুন</h1>

      {/* Contact Info Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {settings.phone && (
          <a href={`tel:${settings.phone}`} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Phone size={18} className="text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">ফোন</p><p className="text-sm font-medium">{settings.phone}</p></div>
          </a>
        )}
        {settings.email && (
          <a href={`mailto:${settings.email}`} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Mail size={18} className="text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">ইমেইল</p><p className="text-sm font-medium">{settings.email}</p></div>
          </a>
        )}
        {settings.location && (
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><MapPin size={18} className="text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">ঠিকানা</p><p className="text-sm font-medium">{settings.location}</p></div>
          </div>
        )}
      </section>

      {/* Contact Form */}
      <section className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-bold text-base mb-4 flex items-center gap-2"><Mail size={18} className="text-primary" /> ইমেইলে যোগাযোগ</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5"><Label>আপনার নাম</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div className="space-y-1.5"><Label>বিষয়</Label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required /></div>
          <div className="space-y-1.5"><Label>মেসেজ</Label><textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="w-full h-24 rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:ring-1 focus:ring-primary" required /></div>
          <Button type="submit" className="w-full gap-2"><Send size={14} /> পাঠান</Button>
        </form>
      </section>

      {/* WhatsApp */}
      {settings.whatsapp && (
        <section className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold text-base mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-[#25D366]" /> WhatsApp-এ মেসেজ</h2>
          <div className="flex gap-2">
            <Input value={whatsappMsg} onChange={e => setWhatsappMsg(e.target.value)} placeholder="আপনার মেসেজ..." className="flex-1" />
            <Button onClick={sendWhatsApp} className="bg-[#25D366] hover:bg-[#20BD5A] gap-2"><Send size={14} /> Send</Button>
          </div>
        </section>
      )}
    </div>
  );
}
