import paymentMethods from '@/assets/payment-methods.png';

export default function TrustBadges() {
  return (
    <div className="flex items-center justify-center py-1 px-2">
      <img
        src={paymentMethods}
        alt="Payment Methods - bKash, Nagad, Cash on Delivery"
        className="w-full max-w-[240px] h-auto object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
