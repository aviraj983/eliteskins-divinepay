import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  Gamepad2, 
  User as UserIcon, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  Star,
  Quote,
  Info,
  ShieldCheck,
  Zap,
  Loader2,
  X,
  Mail,
  Menu,
  CreditCard,
  Headphones,
  Phone,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SKIN_PACKAGES, PAYMENT_METHODS, type SkinPackage, type PaymentMethod } from './constants';
import { cn } from '@/lib/utils';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.029c0 2.125.547 4.197 1.591 6.042L0 24l6.135-1.61a11.75 11.75 0 005.911 1.603h.005c6.634 0 12.032-5.396 12.034-12.03a11.75 11.75 0 00-3.489-8.487" />
  </svg>
);

const REVIEWS = [
  {
    name: "Aarav Mehta",
    uid: "5189****43",
    rating: 5,
    item: "Golden Pharaoh X-Suit",
    text: "Was super anxious about entering my UID, but this is 100% legit. Got my Golden Pharaoh X-Suit in exactly 45 seconds in my game mail! Highly recommend EliteSkins.",
    date: "Just now"
  },
  {
    name: "Ishaan Sharma",
    uid: "5423****12",
    rating: 5,
    item: "M416 Glacier",
    text: "M416 Glacier at this price is a steal! Transaction was super fast and clean. No password requested. Truly official and secure process.",
    date: "30 mins ago"
  },
  {
    name: "Kabir Malhotra",
    uid: "5298****76",
    rating: 5,
    item: "Poseidon X-Suit",
    text: "Amazing customer support! I had a typo in my UID, but they fixed it instantly over WhatsApp support. Got my Poseidon X-Suit. Best store ever!",
    date: "2 hours ago"
  },
  {
    name: "Rohan Das",
    uid: "5109****98",
    rating: 5,
    item: "M416 The Fool",
    text: "My account security is my top priority. EliteSkins didn't ask for any login info or password. The item was sent via global sync mailbox. Absolute peace of mind.",
    date: "Yesterday"
  }
];

export default function App() {
  const [playerId, setPlayerId] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<SkinPackage | null>(null);
  const [isVerifiedPopupOpen, setIsVerifiedPopupOpen] = useState(false);
  
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [isHoveredReview, setIsHoveredReview] = useState(false);

  useEffect(() => {
    if (isHoveredReview) return;
    const interval = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHoveredReview]);

  const handleVerify = async () => {
    if (!playerId || playerId.length < 8) {
      toast.error('Invalid Player ID', { description: 'Please enter a valid BGMI Player ID (8-12 digits).' });
      return;
    }
    
    setIsVerifying(true);
    setVerifiedName(null);
    
    try {
      const response = await fetch('/api/verify-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      const data = await response.json();

      if (data.success && data.name) {
        setVerifiedName(data.name);
        setIsVerifiedPopupOpen(true);
      } else {
        toast.error('Player Not Found', { 
          description: 'PLEASE ENTER CORRECT UID AND TRY AGAIN' 
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification Failed', { 
        description: 'Could not verify player ID. Please try again later.' 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const [livePurchases, setLivePurchases] = useState<{ id: string; uid: string; itemName: string }[]>([]);
  const [recentPurchasesFeed, setRecentPurchasesFeed] = useState<{ id: string; uid: string; itemName: string; time: string }[]>([]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  useEffect(() => {
    const initialFeed = Array.from({ length: 8 }).map((_, i) => {
      const randomUid = Math.floor(5100000000 + Math.random() * 900000000).toString();
      const maskedUid = `${randomUid.substring(0, 4)}****${randomUid.substring(8)}`;
      const randomPkg = SKIN_PACKAGES[Math.floor(Math.random() * SKIN_PACKAGES.length)];
      return {
        id: `feed-${i}`,
        uid: maskedUid,
        itemName: randomPkg.name,
        time: `${Math.floor(Math.random() * 59) + 1}m ago`
      };
    });
    setRecentPurchasesFeed(initialFeed);

    const interval = setInterval(() => {
      const randomUid = Math.floor(5100000000 + Math.random() * 900000000).toString();
      const maskedUid = `${randomUid.substring(0, 4)}****${randomUid.substring(8)}`;
      const randomPkg = SKIN_PACKAGES[Math.floor(Math.random() * SKIN_PACKAGES.length)];
      
      const newPurchase = {
        id: Math.random().toString(36).substring(2, 9),
        uid: maskedUid,
        itemName: randomPkg.name
      };

      setLivePurchases([newPurchase]);
      
      setRecentPurchasesFeed(prev => [
        { ...newPurchase, time: 'Just now' },
        ...prev.map(p => ({
          ...p,
          time: p.time === 'Just now' ? '1m ago' : p.time.includes('m ago') ? `${parseInt(p.time) + 1}m ago` : p.time
        })).slice(0, 7)
      ]);
    }, 6000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, []);

  const handlePurchase = async () => {
    const selectedItem = selectedSkin;

    if (!playerId || !selectedItem || !selectedPayment || !verifiedName) {
      toast.error('Please complete all steps and verify your ID');
      return;
    }

    setIsProcessingPayment(true);
    try {
      if (!navigator.onLine) {
        toast.error('Offline', {
          description: 'You appear to be offline. Please reconnect and try again.'
        });
        setIsProcessingPayment(false);
        return;
      }

      const response = await fetch(`/api/create-payment?t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          playerId, 
          packageId: selectedItem.id,
          amount: 1,
          price: selectedItem.price,
          name: 'N/A',
          email: 'not-provided@eliteskins.in',
          phone: '0000000000'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        toast.success('Redirecting to Payment Gateway...');
        window.location.href = data.paymentUrl;
      } else if (data.success && !data.paymentUrl) {
        toast.success('Order Created', {
          description: 'Your order has been placed. Complete payment to receive your items.'
        });
      } else {
        toast.error('Payment Error', {
          description: data.error || 'Could not initiate secure transaction.',
          action: {
            label: 'Retry',
            onClick: () => handlePurchase()
          }
        });
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error('Transaction Failed', {
        description: error.message || 'Payment gateway is taking too long. Please try again or contact support.'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full golden-header safe-top">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <a href="#" className="flex items-center min-w-0">
            <img 
              src="/logo.png" 
              alt="EliteSkins Official Logo" 
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(250,204,21,0.3)] transition-transform duration-300 hover:scale-105"
            />
          </a>
          
          <div className="hidden md:flex items-center gap-1">
            <nav className="flex items-center gap-1">
              <Button variant="ghost" className="text-sm font-bold px-4 uppercase tracking-wider text-primary/80 hover:text-primary hover:bg-primary/10" render={<a href="#packages" />}>
                Packs
              </Button>
              <Button variant="ghost" className="text-sm font-bold px-4 uppercase tracking-wider text-primary/80 hover:text-primary hover:bg-primary/10" render={<a href="#about" />}>
                How It Works
              </Button>
              <Button variant="ghost" className="text-sm font-bold px-4 uppercase tracking-wider text-primary/80 hover:text-primary hover:bg-primary/10" render={<a href="#support" />}>
                Support
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-5xl">
        <section className="mb-6 sm:mb-8 md:mb-12 relative overflow-hidden bg-gradient-to-br from-primary/15 via-background to-background border border-primary/20 p-4 sm:p-5 md:p-12 hardware-grid min-h-[220px] flex flex-col justify-center rounded-2xl">
          <div className="relative z-10 max-w-2xl">
            <Badge className="bg-primary text-primary-foreground mb-3 text-xs font-black uppercase">⚡ Official Partner</Badge>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase italic">PREMIUM <span className="text-primary">BGMI SKINS</span></h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">Get exclusive X-Suits and legendary Gun Skins delivered directly to your in-game mailbox. No password needed.</p>
          </div>
        </section>

        <div className="space-y-8 max-w-3xl mx-auto">
          {/* Step 1: User ID */}
          <Card className="border border-primary/20 bg-card/40 backdrop-blur-md p-6 glass-card">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground font-black">1</div>
                <CardTitle className="text-lg uppercase font-black italic">Enter Player ID</CardTitle>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Example: 5123456789" 
                  value={playerId}
                  onChange={(e) => { setPlayerId(e.target.value); setVerifiedName(null); }}
                />
                <Button onClick={handleVerify} disabled={isVerifying || !playerId}>
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : verifiedName ? <CheckCircle2 className="w-5 h-5" /> : "Verify"}
                </Button>
              </div>
              {verifiedName && (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <span className="text-xs font-bold text-primary">PLAYER VERIFIED: {verifiedName}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Step 2: Select Skin */}
          <Card id="packages" className="border border-primary/20 bg-card/40 backdrop-blur-md p-6 glass-card">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground font-black">2</div>
                <CardTitle className="text-lg uppercase font-black italic">Select Skin / Outfit</CardTitle>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {SKIN_PACKAGES.map((skin) => (
                  <button
                    key={skin.id}
                    onClick={() => setSelectedSkin(skin)}
                    className={cn(
                      "p-4 border text-center rounded-xl transition-all cursor-pointer flex flex-col items-center justify-between",
                      selectedSkin?.id === skin.id ? "border-primary bg-primary/10" : "border-border/40 hover:border-primary/50"
                    )}
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-2 bg-black/40 border border-primary/20 flex items-center justify-center">
                      <img src={skin.image} alt={skin.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="font-bold text-xs uppercase truncate w-full">{skin.name}</div>
                    <div className="text-sm font-black text-primary">₹{skin.price}</div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Step 3: Payment */}
          <Card className="border border-primary/20 bg-card/40 backdrop-blur-md p-6 glass-card">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground font-black">3</div>
                <CardTitle className="text-lg uppercase font-black italic">Select Payment Channel</CardTitle>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method)}
                    className={cn(
                      "flex items-center gap-4 p-4 border text-left rounded-xl transition-all",
                      selectedPayment?.id === method.id ? "border-primary bg-primary/10" : "border-border/40"
                    )}
                  >
                    <img src={method.icon} alt={method.name} className="w-10 h-10 object-contain" />
                    <div>
                      <div className="font-bold text-sm uppercase">{method.name}</div>
                      <div className="text-xs text-muted-foreground">{method.description}</div>
                    </div>
                  </button>
                ))}
              </div>
              <Button 
                className="w-full h-14 text-lg font-black uppercase mt-6"
                disabled={!playerId || !verifiedName || !selectedSkin || !selectedPayment || isProcessingPayment}
                onClick={handlePurchase}
              >
                {isProcessingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue to Pay"}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
