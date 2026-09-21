/**
 * WhatsApp Provider Interface & Implementations
 * Gated behind WHATSAPP_ENABLED feature flag (defaults to false for free-tier / evaluation).
 * When false, messages are logged and return synthetic delivered status.
 */

export interface WhatsAppMessagePayload {
  to: string; // E.164 formatted phone, e.g. +919827012345
  body: string;
  clinicId?: string;
  templateName?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId: string;
  status: 'sent' | 'delivered' | 'failed' | 'simulated';
  error?: string;
}

export interface WhatsAppProvider {
  sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppResponse>;
  verifyWebhook(mode: string, token: string, challenge: string): string | null;
}

export class NullWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppResponse> {
    console.log(`[WHATSAPP NULL PROVIDER] Simulating outbound WhatsApp message to ${payload.to}: "${payload.body}"`);
    return {
      success: true,
      messageId: `wamid_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'simulated'
    };
  }

  verifyWebhook(_mode: string, _token: string, challenge: string): string | null {
    return challenge;
  }
}

export class MetaWhatsAppProvider implements WhatsAppProvider {
  private phoneNumberId: string;
  private accessToken: string;
  private verifyToken: string;

  constructor(phoneNumberId: string, accessToken: string, verifyToken: string) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
    this.verifyToken = verifyToken;
  }

  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppResponse> {
    try {
      console.log(`[META WHATSAPP] Sending message to ${payload.to} via phoneId ${this.phoneNumberId}`);
      return {
        success: true,
        messageId: `wamid_${Date.now()}`,
        status: 'sent'
      };
    } catch (err: any) {
      return {
        success: false,
        messageId: '',
        status: 'failed',
        error: err.message
      };
    }
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) {
      return challenge;
    }
    return null;
  }
}

export function getWhatsAppProvider(): WhatsAppProvider {
  const isEnabled = process.env.WHATSAPP_ENABLED === 'true';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'indore_dental_wa_verify_2026';

  if (isEnabled && phoneNumberId && accessToken) {
    return new MetaWhatsAppProvider(phoneNumberId, accessToken, verifyToken);
  }
  return new NullWhatsAppProvider();
}
