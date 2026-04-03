import { useSettings } from '@/hooks/useFirestoreData';
import { Store, Shield, Truck, Award, Heart, Users } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

export default function AboutPage() {
  const { settings } = useSettings();

  return (
    <div className="max-w-screen-md mx-auto px-4 py-5 pb-nav lg:pb-8 space-y-8">
      <SEOHead
        title={`আমাদের সম্পর্কে — ${settings.appName}`}
        description={`${settings.appName} বাংলাদেশের বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম। সেরা মানের পণ্য, দ্রুত ডেলিভারি এবং ক্যাশ অন ডেলিভারি সুবিধা।`}
        url="https://zupramart.netlify.app/about"
      />

      <h1 className="font-bold text-xl">{settings.appName} সম্পর্কে</h1>

      <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Store size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-base">আমরা কারা?</h2>
            <p className="text-sm text-muted-foreground">{settings.appName} — আপনার বিশ্বস্ত অনলাইন শপ</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {settings.appName} হলো বাংলাদেশের একটি বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম। আমরা সর্বদা সেরা মানের পণ্য সাশ্রয়ী মূল্যে সরবরাহ করতে প্রতিশ্রুতিবদ্ধ। আমাদের লক্ষ্য হলো সকল ক্রেতার কাছে নির্ভরযোগ্য এবং সুবিধাজনক শপিং অভিজ্ঞতা নিশ্চিত করা।
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {[
          { icon: Shield, label: '১০০% অরিজিনাল', desc: 'সকল পণ্যের মান নিশ্চিত' },
          { icon: Truck, label: 'দ্রুত ডেলিভারি', desc: '৩-৫ কার্যদিবসের মধ্যে' },
          { icon: Award, label: '৭ দিনের রিটার্ন', desc: 'সহজ রিটার্ন ও রিফান্ড' },
          { icon: Heart, label: 'ক্যাশ অন ডেলিভারি', desc: 'পণ্য হাতে পেয়ে পেমেন্ট' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center space-y-2">
            <Icon size={28} className="mx-auto text-primary" />
            <h3 className="text-sm font-semibold">{label}</h3>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-primary" />
          <h2 className="font-bold text-base">আমাদের মিশন</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          বাংলাদেশের প্রতিটি মানুষের কাছে মানসম্পন্ন পণ্য সহজেই পৌঁছে দেওয়া। আমরা বিশ্বাস করি, প্রতিটি ক্রেতা সেরা সেবা পাওয়ার যোগ্য।
        </p>
      </section>
    </div>
  );
}
