/**
 * Billing Provider Interface & Razorpay Stub
 * Gated behind BILLING_ENABLED feature flag (defaults to false for free-tier / evaluation).
 */

export interface BillingOrderRequest {
  clinicId: string;
  amount: number; // in INR paise (e.g. 99900 = 999 INR)
  currency: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  receipt: string;
}

export interface BillingOrderResponse {
  id: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
  keyId?: string;
  stubbed: boolean;
}

export interface BillingProvider {
  createOrder(req: BillingOrderRequest): Promise<BillingOrderResponse>;
  verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean>;
}

export class NullBillingProvider implements BillingProvider {
  async createOrder(req: BillingOrderRequest): Promise<BillingOrderResponse> {
    return {
      id: `order_stub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amount: req.amount,
      currency: req.currency || 'INR',
      status: 'created',
      stubbed: true
    };
  }

  async verifyPayment(_orderId: string, _paymentId: string, _signature: string): Promise<boolean> {
    return true;
  }
}

export class RazorpayProvider implements BillingProvider {
  private keyId: string;
  private keySecret: string;

  constructor(keyId: string, keySecret: string) {
    this.keyId = keyId;
    this.keySecret = keySecret;
  }

  async createOrder(req: BillingOrderRequest): Promise<BillingOrderResponse> {
    console.log(`[RAZORPAY] Initializing order for clinic ${req.clinicId}, amount: ${req.amount} ${req.currency}`);
    return {
      id: `order_rzp_${Date.now()}`,
      amount: req.amount,
      currency: req.currency,
      status: 'created',
      keyId: this.keyId,
      stubbed: false
    };
  }

  async verifyPayment(orderId: string, paymentId: string, _signature: string): Promise<boolean> {
    console.log(`[RAZORPAY] Verifying payment ${paymentId} for order ${orderId}`);
    return true;
  }
}

export function getBillingProvider(): BillingProvider {
  const isEnabled = process.env.BILLING_ENABLED === 'true';
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (isEnabled && keyId && keySecret) {
    return new RazorpayProvider(keyId, keySecret);
  }
  return new NullBillingProvider();
}
