import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders, useProducts } from '@/hooks/useFirestoreData';
import { Package, CheckCircle, Truck, Box, Clock, XCircle, Download, Monitor, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const statusSteps = [
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'packed', label: 'Packed', icon: Box },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderTrackingPage() {
  const { user } = useAuth();
  const { orders, loading } = useOrders(user?.uid);
  const { products } = useProducts();
  const navigate = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <Package size={40} className="text-muted-foreground opacity-30" />
      <p className="text-muted-foreground">Please login to view orders</p>
      <Button onClick={() => navigate('/auth')}>Login</Button>
    </div>
  );

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <Package size={40} className="text-muted-foreground opacity-30" />
      <h2 className="text-xl font-bold">No orders yet</h2>
      <Button onClick={() => navigate('/')}>Start Shopping</Button>
    </div>
  );

  return (
    <div className="max-w-screen-md mx-auto px-4 py-5 pb-nav lg:pb-8">
      <h1 className="font-bold text-xl mb-5">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => {
          const currentIndex = statusSteps.findIndex(s => s.key === order.status);
          const isCancelled = order.status === 'cancelled';
          const isDelivered = order.status === 'delivered';
          const isDigitalOrder = order.isDigitalOrder || order.items?.some((i: any) => i.isDigital);

          // Get digital product details for download
          const digitalItems = isDigitalOrder ? order.items?.filter((i: any) => i.isDigital) || order.items : [];

          return (
            <div key={order.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                    {isDigitalOrder && <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Monitor size={10} /> Digital</span>}
                  </div>
                  <p className="font-bold text-sm">{order.items?.length || 0} items &middot; ৳{order.total?.toFixed(0)}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${isCancelled ? 'bg-destructive/10 text-destructive' : isDelivered ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'}`}>
                  {order.status}
                </span>
              </div>

              {/* Order items preview */}
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {order.items?.slice(0, 4).map((item: any, i: number) => (
                  <img key={i} src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ))}
                {(order.items?.length || 0) > 4 && <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">+{order.items.length - 4}</div>}
              </div>

              {isCancelled ? (
                <div className="flex items-center gap-2 text-destructive text-sm"><XCircle size={16} /> Cancelled</div>
              ) : (
                <div className="flex items-center gap-1">
                  {statusSteps.map((step, i) => {
                    const done = i <= currentIndex;
                    return (
                      <div key={step.key} className="flex items-center flex-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${done ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          <step.icon size={12} />
                        </div>
                        {i < statusSteps.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < currentIndex ? 'bg-green-500' : 'bg-border'}`} />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Digital Product Download Section */}
              {isDigitalOrder && (
                <div className="mt-4 border-t border-border pt-4">
                  {isDelivered ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-green-600 flex items-center gap-1"><CheckCircle size={14} /> ডাউনলোড রেডি!</p>
                      {digitalItems.map((item: any, i: number) => {
                        const productData = products.find(p => p.id === item.productId);
                        return (
                          <div key={i} className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
                            <p className="text-sm font-medium mb-2">{item.name}</p>
                            {productData?.sourceCodeUrl && (
                              <a href={productData.sourceCodeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                                <Download size={16} /> Download
                              </a>
                            )}
                            {productData?.filePassword && (
                              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                <Lock size={12} /> Password: <code className="bg-muted px-2 py-0.5 rounded font-mono font-bold text-foreground">{productData.filePassword}</code>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <Lock size={20} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">পেমেন্ট কনফার্ম হলে ডাউনলোড লিংক পাবেন।</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Status: <span className="font-semibold capitalize text-primary">{order.status}</span></p>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-3">
                {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('bn-BD') : 'Recent'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
