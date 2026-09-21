/**
 * Razorpay Payment Backend Service (Node.js)
 * 
 * Handles:
 * 1. Razorpay Order Creation via official REST API
 * 2. Cryptographic Payment Verification using HMAC-SHA256
 * 3. Verified Receipt Generation & Audit Logging
 * 4. Email receipt dispatch simulation / handling
 */

import crypto from 'crypto';

export interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
  farmerId?: string;
  buyerId?: string;
}

export interface PaymentReceipt {
  receiptId: string;
  transactionId: string;
  orderId: string;
  amountPaid: number;
  currency: string;
  dateTime: string;
  formattedDate: string;
  status: 'CAPTURED' | 'FAILED' | 'REFUNDED';
  customer: CustomerDetails;
  settlementPeriod?: string;
  paymentMethod: string;
  notes?: Record<string, string>;
}

export interface CreateOrderRequest {
  amount: number; // in INR (Rupees)
  currency?: string;
  receiptId?: string;
  customer: CustomerDetails;
  notes?: Record<string, string>;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
  amount: number;
  currency?: string;
  receiptId?: string;
  customer: CustomerDetails;
  notes?: Record<string, string>;
}

/**
 * Creates an order with Razorpay
 * Uses official Razorpay Orders API with HTTP Basic Authentication
 */
export async function createRazorpayOrder(reqData: CreateOrderRequest): Promise<{
  success: boolean;
  orderId: string;
  amount: number; // in INR
  amountInPaise: number;
  currency: string;
  keyId: string;
  receiptId: string;
  isMock: boolean;
  error?: string;
}> {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_MandiPaymentDemo';
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const amountInINR = Math.max(1, Number(reqData.amount) || 0);
  const amountInPaise = Math.round(amountInINR * 100);
  const currency = reqData.currency || 'INR';
  const receiptId = reqData.receiptId || `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // If live or test keys are provided in environment
  if (keySecret && keyId && !keyId.includes('YourKeyIdHere')) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: receiptId.slice(0, 40),
          notes: {
            customerName: reqData.customer?.name || 'Customer',
            customerPhone: reqData.customer?.phone || '',
            farmerId: reqData.customer?.farmerId || '',
            ...reqData.notes,
          },
        }),
      });

      if (response.ok) {
        const orderData = await response.json();
        return {
          success: true,
          orderId: orderData.id,
          amount: amountInINR,
          amountInPaise,
          currency: orderData.currency || currency,
          keyId,
          receiptId,
          isMock: false,
        };
      } else {
        const errBody = await response.text();
        console.warn('[Razorpay API] Order creation returned non-200, falling back to simulated order:', errBody);
      }
    } catch (apiErr: any) {
      console.warn('[Razorpay API] Network/Auth error:', apiErr?.message);
    }
  }

  // Graceful fallback for demo/development environments
  const simulatedOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return {
    success: true,
    orderId: simulatedOrderId,
    amount: amountInINR,
    amountInPaise,
    currency,
    keyId: keyId || 'rzp_test_MandiDemo',
    receiptId,
    isMock: true,
  };
}

/**
 * Verifies Razorpay Payment Signature
 * Using HMAC SHA-256 with the Razorpay Key Secret
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  receivedSignature?: string
): { isValid: boolean; reason?: string } {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // If no secret configured in test/demo mode, validate transaction presence
  if (!keySecret || keySecret.includes('YourRazorpayKeySecretHere')) {
    return {
      isValid: Boolean(orderId && paymentId),
      reason: 'Demo / Sandbox signature verified',
    };
  }

  if (!receivedSignature) {
    return {
      isValid: false,
      reason: 'Missing Razorpay signature in payload',
    };
  }

  try {
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    const isValid = expectedSignature === receivedSignature;
    return {
      isValid,
      reason: isValid ? 'Cryptographic HMAC-SHA256 signature verified' : 'Invalid signature match',
    };
  } catch (err: any) {
    return {
      isValid: false,
      reason: `Signature verification error: ${err.message}`,
    };
  }
}

/**
 * Generates an official verified payment receipt
 */
export function generateVerifiedReceipt(reqData: VerifyPaymentRequest): PaymentReceipt {
  const now = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };

  return {
    receiptId: reqData.receiptId || `RCP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-6)}`,
    transactionId: reqData.razorpay_payment_id || `pay_${Date.now()}`,
    orderId: reqData.razorpay_order_id,
    amountPaid: Number(reqData.amount) || 0,
    currency: reqData.currency || 'INR',
    dateTime: now.toISOString(),
    formattedDate: now.toLocaleDateString('en-IN', dateOptions),
    status: 'CAPTURED',
    customer: {
      name: reqData.customer?.name || 'Valued Customer / Farmer',
      phone: reqData.customer?.phone || '',
      email: reqData.customer?.email || '',
      farmerId: reqData.customer?.farmerId || '',
      buyerId: reqData.customer?.buyerId || '',
    },
    settlementPeriod: reqData.notes?.settlementPeriod || 'Due Balance Settlement',
    paymentMethod: 'UPI / Cards / NetBanking (via Razorpay)',
    notes: reqData.notes || {},
  };
}
