import { useSettings } from '@/hooks/useFirestoreData';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  const { settings } = useSettings();
  return (
    <div className="max-w-screen-md mx-auto px-4 py-5 pb-nav lg:pb-8">
      <div className="flex items-center gap-2 mb-6"><Shield size={20} className="text-primary" /><h1 className="font-bold text-xl">প্রাইভেসি পলিসি</h1></div>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>এই প্রাইভেসি পলিসি {settings.appName}-এর ব্যবহারকারীদের ব্যক্তিগত তথ্যের সুরক্ষা ও ব্যবহার সম্পর্কে বিস্তারিত জানায়।</p>
        <h2 className="text-foreground font-semibold text-base">১. তথ্য সংগ্রহ</h2>
        <p>আমরা নিম্নলিখিত তথ্য সংগ্রহ করতে পারি:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>নাম, ইমেইল, ফোন নম্বর</li>
          <li>শিপিং ও বিলিং ঠিকানা</li>
          <li>পেমেন্ট তথ্য (ট্রানজেকশন আইডি)</li>
          <li>ব্রাউজিং ডেটা ও কুকিজ</li>
        </ul>
        <h2 className="text-foreground font-semibold text-base">২. তথ্যের ব্যবহার</h2>
        <p>আমরা সংগৃহীত তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করি:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>অর্ডার প্রসেসিং ও ডেলিভারি</li>
          <li>কাস্টমার সাপোর্ট প্রদান</li>
          <li>সেবার মান উন্নয়ন</li>
          <li>প্রমোশনাল তথ্য প্রেরণ (সম্মতি সাপেক্ষে)</li>
        </ul>
        <h2 className="text-foreground font-semibold text-base">৩. তথ্য সুরক্ষা</h2>
        <p>আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে যথাযথ নিরাপত্তা ব্যবস্থা গ্রহণ করি। আপনার তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি করা হবে না।</p>
        <h2 className="text-foreground font-semibold text-base">৪. কুকিজ</h2>
        <p>আমাদের ওয়েবসাইট কুকিজ ব্যবহার করে আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে। আপনি ব্রাউজার সেটিংস থেকে কুকিজ নিয়ন্ত্রণ করতে পারেন।</p>
        <h2 className="text-foreground font-semibold text-base">৫. যোগাযোগ</h2>
        <p>প্রাইভেসি সংক্রান্ত কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন: {settings.email || 'support@zupramart.com'}</p>
      </div>
    </div>
  );
}
