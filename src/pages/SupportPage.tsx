import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Phone, Mail, MapPin, MessageSquare, ChevronDown, HelpCircle, FileText, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSettings } from '@/hooks/useFirestoreData';

const faqs = [
  { q: 'কিভাবে অর্ডার করবো?', a: 'আপনার পছন্দের পণ্য সিলেক্ট করুন, কার্টে যোগ করুন এবং চেকআউট পেজে গিয়ে শিপিং তথ্য দিয়ে অর্ডার সম্পন্ন করুন।' },
  { q: 'ডেলিভারি কত দিনে হয়?', a: 'সাধারণত ৩-৫ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়। এক্সপ্রেস ডেলিভারিতে ১-২ দিনের মধ্যে পেতে পারেন।' },
  { q: 'পেমেন্ট কিভাবে করবো?', a: 'আমরা ক্যাশ অন ডেলিভারি (COD) এবং মোবাইল ব্যাংকিং (bKash, Nagad) এর মাধ্যমে পেমেন্ট গ্রহণ করি।' },
  { q: 'রিটার্ন করতে কি করতে হবে?', a: 'পণ্য পাওয়ার ৭ দিনের মধ্যে আমাদের সাথে যোগাযোগ করুন। পণ্য অব্যবহৃত ও অরিজিনাল প্যাকেজিংসহ ফেরত দিতে হবে।' },
  { q: 'অর্ডার ক্যান্সেল করতে পারবো?', a: 'পণ্য শিপ হওয়ার আগে অর্ডার ক্যান্সেল করা যাবে। আমাদের সাপোর্টে যোগাযোগ করুন।' },
];

export default function SupportPage() {
  const { settings } = useSettings();
  const [contactForm, setContactForm] = useState({ name: '', subject: '', message: '' });
  const [whatsappMsg, setWhatsappMsg] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, subject, message } = contactForm;
    const body = `Name: ${name}\n\n${message}`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `mailto:${settings.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${settings.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
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
      <h1 className="font-bold text-xl">সহায়তা</h1>

      {/* Contact Form */}
      <section className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-bold text-base mb-4 flex items-center gap-2"><Mail size={18} className="text-primary" /> যোগাযোগ করুন</h2>
        <form onSubmit={handleContactSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>আপনার নাম</Label>
            <Input value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label>বিষয়</Label>
            <Input value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label>মেসেজ</Label>
            <textarea value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} className="w-full h-24 rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:ring-1 focus:ring-primary" required />
          </div>
          <Button type="submit" className="w-full gap-2"><Send size={14} /> পাঠান</Button>
        </form>
      </section>

      {/* WhatsApp */}
      <section className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-bold text-base mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-green-500" /> WhatsApp-এ মেসেজ করুন</h2>
        <div className="flex gap-2">
          <Input value={whatsappMsg} onChange={e => setWhatsappMsg(e.target.value)} placeholder="আপনার মেসেজ লিখুন..." className="flex-1" />
          <Button onClick={sendWhatsApp} className="bg-green-500 hover:bg-green-600 gap-2"><Send size={14} /> Send</Button>
        </div>
      </section>

      {/* Contact Info */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {settings.phone && (
          <a href={`tel:${settings.phone}`} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors">
            <Phone size={18} className="text-primary" />
            <div><p className="text-xs text-muted-foreground">ফোন</p><p className="text-sm font-medium">{settings.phone}</p></div>
          </a>
        )}
        {settings.email && (
          <a href={`mailto:${settings.email}`} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors">
            <Mail size={18} className="text-primary" />
            <div><p className="text-xs text-muted-foreground">ইমেইল</p><p className="text-sm font-medium">{settings.email}</p></div>
          </a>
        )}
        {settings.location && (
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
            <MapPin size={18} className="text-primary" />
            <div><p className="text-xs text-muted-foreground">ঠিকানা</p><p className="text-sm font-medium">{settings.location}</p></div>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section>
        <h2 className="font-bold text-base mb-4 flex items-center gap-2"><HelpCircle size={18} className="text-primary" /> সচরাচর জিজ্ঞাসা</h2>
        <Accordion type="multiple" className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl px-4">
              <AccordionTrigger className="text-sm font-medium">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Policy Links */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/return-policy" className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors">
          <RotateCcw size={18} className="text-primary" /><span className="text-sm font-medium">রিটার্ন পলিসি</span>
        </Link>
        <Link to="/privacy-policy" className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors">
          <Shield size={18} className="text-primary" /><span className="text-sm font-medium">প্রাইভেসি পলিসি</span>
        </Link>
        <Link to="/terms" className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors">
          <FileText size={18} className="text-primary" /><span className="text-sm font-medium">শর্তাবলী</span>
        </Link>
      </section>
    </div>
  );
}
