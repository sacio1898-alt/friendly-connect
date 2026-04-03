import { useSettings } from '@/hooks/useFirestoreData';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  const { settings } = useSettings();
  return (
    <div className="max-w-screen-md mx-auto px-4 py-5 pb-nav lg:pb-8">
      <div className="flex items-center gap-2 mb-6"><FileText size={20} className="text-primary" /><h1 className="font-bold text-xl">শর্তাবলী</h1></div>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>{settings.appName}-এর সেবা ব্যবহার করার মাধ্যমে আপনি নিম্নলিখিত শর্তাবলী মেনে নিচ্ছেন।</p>
        <h2 className="text-foreground font-semibold text-base">১. সেবার শর্ত</h2>
        <p>আমাদের প্ল্যাটফর্ম ব্যবহার করতে আপনাকে একটি অ্যাকাউন্ট তৈরি করতে হবে। আপনার অ্যাকাউন্টের নিরাপত্তা আপনার দায়িত্ব।</p>
        <h2 className="text-foreground font-semibold text-base">২. পণ্য ও মূল্য</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>পণ্যের মূল্য পরিবর্তন হতে পারে</li>
          <li>সকল মূল্য বাংলাদেশী টাকায় (৳) প্রদর্শিত</li>
          <li>পণ্যের ছবি প্রকৃত পণ্য থেকে সামান্য ভিন্ন হতে পারে</li>
        </ul>
        <h2 className="text-foreground font-semibold text-base">৩. অর্ডার ও ডেলিভারি</h2>
        <p>অর্ডার নিশ্চিত হওয়ার পর আমরা যত দ্রুত সম্ভব ডেলিভারি দেওয়ার চেষ্টা করি। তবে কিছু ক্ষেত্রে বিলম্ব হতে পারে।</p>
        <h2 className="text-foreground font-semibold text-base">৪. পেমেন্ট</h2>
        <p>ক্যাশ অন ডেলিভারি (COD) এবং মোবাইল ব্যাংকিং এর মাধ্যমে পেমেন্ট গ্রহণ করা হয়। ভুল পেমেন্ট তথ্য প্রদানের দায়ভার ক্রেতার।</p>
        <h2 className="text-foreground font-semibold text-base">৫. ক্যান্সেলেশন</h2>
        <p>পণ্য শিপ হওয়ার আগে অর্ডার ক্যান্সেল করা যাবে। শিপ হওয়ার পর রিটার্ন পলিসি অনুসরণ করতে হবে।</p>
        <h2 className="text-foreground font-semibold text-base">৬. দায়বদ্ধতা সীমাবদ্ধতা</h2>
        <p>{settings.appName} কোনো পরোক্ষ ক্ষতির জন্য দায়ী থাকবে না। আমাদের সর্বোচ্চ দায়বদ্ধতা আপনার ক্রয়মূল্যের সমপরিমাণ।</p>
      </div>
    </div>
  );
}
