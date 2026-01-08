import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: "premium" | "elite";
}

type Duration = "1month" | "3months" | "6months" | "1year";

const SUBSCRIPTION_PLANS = {
  premium: {
    name: "Premium",
    icon: Zap,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    durations: {
      "1month": { price: 300, months: 1, label: "1 Month" },
      "3months": { price: 750, months: 3, label: "3 Months" },
      "6months": { price: 1400, months: 6, label: "6 Months" },
      "1year": { price: 2500, months: 12, label: "1 Year" },
    },
    features: [
      "Create up to 2 study groups",
      "Priority support",
      "Advanced analytics",
      "Custom profile badges",
      "Wider reach",
    ],
  },
  elite: {
    name: "Elite",
    icon: Crown,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    durations: {
      "1month": { price: 600, months: 1, label: "1 Month" },
      "3months": { price: 1500, months: 3, label: "3 Months" },
      "6months": { price: 2400, months: 6, label: "6 Months" },
      "1year": { price: 4200, months: 12, label: "1 Year" },
    },
    features: [
      "Create up to 5 study groups",
      "All Premium features",
      "Early access to new features",
      "Exclusive Elite badge",
      "VIP support",
      "Exclusive Retro & Cyberpunk themes",
    ],
  },
};

export function PaymentDialog({ open, onOpenChange, tier }: PaymentDialogProps) {
  const [selectedDuration, setSelectedDuration] = useState<Duration>("1month");

  const planInfo = SUBSCRIPTION_PLANS[tier];
  const Icon = planInfo.icon;
  const durationInfo = planInfo.durations[selectedDuration];
  const amount = durationInfo.price;
  const perMonthCost = Math.round(amount / durationInfo.months);
  const savingsPercent = durationInfo.months > 1
    ? Math.round((1 - perMonthCost / planInfo.durations["1month"].price) * 100)
    : 0;

  const upiId = "pawansingh.24@ibl";
  const upiString = `upi://pay?pa=${upiId}&pn=YuvaVerse&am=${amount}&cu=INR&tn=${planInfo.name} ${durationInfo.label} Subscription`;

  // Generate QR code URL using Google Charts API (free service)
  const qrCodeUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(upiString)}&choe=UTF-8`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied to clipboard!");
  };

  const openUpiApp = () => {
    window.open(upiString, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black uppercase">
            <Icon className={`h-6 w-6 ${planInfo.color}`} />
            Upgrade to {planInfo.name}
          </DialogTitle>
          <DialogDescription>
            Complete the payment to unlock premium features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Duration Selection */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase">Choose Duration:</h4>
            <RadioGroup value={selectedDuration} onValueChange={(value) => setSelectedDuration(value as Duration)}>
              {Object.entries(planInfo.durations).map(([key, info]) => {
                const monthlyRate = Math.round(info.price / info.months);
                const discount = info.months > 1
                  ? Math.round((1 - monthlyRate / planInfo.durations["1month"].price) * 100)
                  : 0;

                return (
                  <div
                    key={key}
                    className={`flex items-center space-x-3 border-2 p-4 rounded-lg cursor-pointer transition-all ${
                      selectedDuration === key
                        ? `${planInfo.bgColor} ${planInfo.color} border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]`
                        : "border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40"
                    }`}
                    onClick={() => setSelectedDuration(key as Duration)}
                  >
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">{info.label}</p>
                          <p className="text-sm">₹{monthlyRate}/month</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-lg">₹{info.price}</p>
                          {discount > 0 && (
                            <Badge className="bg-green-500 text-white border-0 text-xs">
                              Save {discount}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Price Summary */}
          <div className="flex flex-col items-center gap-2 bg-slate-100 dark:bg-slate-900 p-4 rounded-lg border-2 border-black dark:border-white">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground uppercase">Total Amount</p>
              <Badge className={`${planInfo.bgColor} ${planInfo.color} text-3xl font-black px-6 py-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] mt-2`}>
                ₹{amount}
              </Badge>
            </div>
            <p className="text-sm font-bold">
              ₹{perMonthCost}/month × {durationInfo.months} {durationInfo.months === 1 ? "month" : "months"}
            </p>
            {savingsPercent > 0 && (
              <p className="text-xs font-medium text-green-600 dark:text-green-400">
                💰 You save {savingsPercent}% compared to monthly billing!
              </p>
            )}
          </div>

          {/* Features List */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border-2 border-black dark:border-white">
            <h4 className="font-bold text-sm uppercase mb-3">What you get:</h4>
            {planInfo.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* QR Code Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-bold text-lg uppercase mb-2">Scan QR Code to Pay</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Use any UPI app (GPay, PhonePe, Paytm, etc.)
              </p>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]">
                  <img
                    src={qrCodeUrl}
                    alt="Payment QR Code"
                    className="w-64 h-64"
                    onError={(e) => {
                      // Fallback if Google Charts fails
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect fill='%23f0f0f0' width='256' height='256'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-family='sans-serif' font-size='14'%3EQR Code Unavailable%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='12'%3EUse UPI ID below%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* UPI ID Section */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border-2 border-black dark:border-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                    UPI ID
                  </p>
                  <p className="font-mono font-bold text-lg">{upiId}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyUpiId}
                  className="border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Open UPI App Button */}
            <Button
              onClick={openUpiApp}
              className="w-full font-bold border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in UPI App
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 p-4 rounded-lg">
            <h4 className="font-bold text-sm text-yellow-800 dark:text-yellow-400 mb-2">
              📱 Payment Instructions:
            </h4>
            <ol className="text-sm space-y-1 text-yellow-900 dark:text-yellow-300">
              <li>1. Scan the QR code or copy the UPI ID</li>
              <li>2. Complete the payment of ₹{amount}</li>
              <li>3. Take a screenshot of the payment confirmation</li>
              <li>4. Contact support with your screenshot to activate</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-2 border-black dark:border-white"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
