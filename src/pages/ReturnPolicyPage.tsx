import { useSettings } from '@/hooks/useFirestoreData';
import { RotateCcw } from 'lucide-react';

export default function ReturnPolicyPage() {
  const { settings } = useSettings();
  return (
    <div className="max-w-screen-md mx-auto px-4 py-5 pb-nav lg:pb-8">
      <div className="flex items-center gap-2 mb-6"><RotateCcw size={20} className="text-primary" /><h1 className="font-bold text-xl">রিটার্ন পলিসি</h1></div>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>{settings.appName}-এ আপনার সন্তুষ্টি আমাদের সর্বোচ্চ অগ্রাধিকার। নিচে আমাদের রিটার্ন পলিসি বিস্তারিত দেওয়া হলো।</p>
        <h2 className="text-foreground font-semibold text-base">রিটার্ন যোগ্যতা</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>পণ্য পাওয়ার ৭ দিনের মধ্যে রিটার্ন করতে হবে</li>
          <li>পণ্য অবশ্যই অব্যবহৃত ও মূল অবস্থায় থাকতে হবে</li>
          <li>অরিজিনাল প্যাকেজিং ও ট্যাগ অক্ষত থাকতে হবে</li>
          <li>রসিদ বা অর্ডার নম্বর প্রদান করতে হবে</li>
        </ul>
        <h2 className="text-foreground font-semibold text-base">রিটার্ন অযোগ্য পণ্য</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>ব্যবহৃত বা ক্ষতিগ্রস্ত পণ্য</li>
          <li>ব্যক্তিগত যত্ন ও স্বাস্থ্যসেবা পণ্য</li>
          <li>কাস্টমাইজড বা পার্সোনালাইজড পণ্য</li>
          <li>সেল/ক্লিয়ারেন্স পণ্য</li>
        </ul>
        <h2 className="text-foreground font-semibold text-base">রিটার্ন প্রক্রিয়া</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>আমাদের সাপোর্ট টিমে যোগাযোগ করুন</li>
          <li>রিটার্নের কারণ জানান</li>
          <li>অনুমোদন পেলে পণ্য প্যাক করে পাঠান</li>
          <li>পণ্য পরীক্ষার পর রিফান্ড প্রসেস হবে</li>
        </ol>
        <h2 className="text-foreground font-semibold text-base">রিফান্ড</h2>
        <p>রিটার্ন অনুমোদিত হলে ৫-৭ কার্যদিবসের মধ্যে রিফান্ড প্রসেস হবে। মোবাইল ব্যাংকিং এর মাধ্যমে রিফান্ড প্রদান করা হবে।</p>
        <h2 className="text-foreground font-semibold text-base">যোগাযোগ</h2>
        <p>রিটার্ন সংক্রান্ত সহায়তার জন্য: {settings.email || 'support@zupramart.com'} | {settings.phone || ''}</p>
      </div>
    </div>
  );
}
