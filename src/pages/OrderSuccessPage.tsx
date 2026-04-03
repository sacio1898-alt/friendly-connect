import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const orderId = state?.orderId || 'ORD-000000';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm mx-auto">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={48} className="text-green-500" strokeWidth={1.5} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
          <p className="text-muted-foreground mb-4">আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে।</p>
          <div className="bg-card border border-border rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs text-muted-foreground mb-1">Order Number</p>
            <p className="font-bold font-mono text-primary">{orderId}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => window.location.href = '/orders'} className="w-full h-12 font-semibold"><Package size={16} className="mr-2" /> Track Order</Button>
            <Button variant="outline" asChild className="h-12"><Link to="/"><Home size={16} className="mr-2" /> Continue Shopping</Link></Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
