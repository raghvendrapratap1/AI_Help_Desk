import dotenv from 'dotenv';

dotenv.config();

export interface CallParams {
  to: string;
  from?: string;
  clinicId: string;
  metadata?: Record<string, any>;
}

export interface CallResult {
  callId: string;
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed';
  provider: 'null' | 'exotel' | 'vapi';
}

export interface TelephonyProvider {
  makeCall(params: CallParams): Promise<CallResult>;
  receiveCall(params: { callId: string; from: string; to: string }): Promise<any>;
  transferCall(callId: string, targetNumber: string): Promise<any>;
  getCallStatus(callId: string): Promise<string>;
  getRecording(callId: string): Promise<string | null>;
  handleWebhook(payload: any, signature?: string): Promise<any>;
}

/**
 * NullTelephonyProvider
 * Default safe in-process mock for development and zero-cost operation.
 * Logs all calls and webhook actions without requiring paid Exotel/Twilio numbers.
 */
export class NullTelephonyProvider implements TelephonyProvider {
  async makeCall(params: CallParams): Promise<CallResult> {
    const callId = `mock_call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`\n================== [OUTGOING VOICE CALL DISPATCH] ==================`);
    console.log(`Provider: NullTelephonyProvider (TELEPHONY_ENABLED=false)`);
    console.log(`Call ID:  ${callId}`);
    console.log(`To:       ${params.to}`);
    console.log(`ClinicID: ${params.clinicId}`);
    console.log(`Metadata:`, params.metadata || {});
    console.log(`====================================================================\n`);
    return { callId, status: 'initiated', provider: 'null' };
  }

  async receiveCall(params: { callId: string; from: string; to: string }): Promise<any> {
    console.log(`[NULL TELEPHONY] Simulated incoming call from ${params.from} to ${params.to}`);
    return { accepted: true, callId: params.callId };
  }

  async transferCall(callId: string, targetNumber: string): Promise<any> {
    console.log(`[NULL TELEPHONY] Transferring call ${callId} to ${targetNumber}`);
    return { transferred: true, targetNumber };
  }

  async getCallStatus(callId: string): Promise<string> {
    return 'completed';
  }

  async getRecording(callId: string): Promise<string | null> {
    return `https://mock-recordings.example.com/${callId}.mp3`;
  }

  async handleWebhook(payload: any, signature?: string): Promise<any> {
    console.log(`[NULL TELEPHONY] Handling webhook payload:`, payload);
    return { handled: true, providerCallId: payload.CallSid || payload.callId || `call_${Date.now()}` };
  }
}

/**
 * ExotelProvider
 * Real India-first telephony provider integration.
 * Activated ONLY when TELEPHONY_ENABLED=true and credentials are provided.
 */
export class ExotelProvider implements TelephonyProvider {
  private apiKey: string;
  private apiToken: string;
  private accountSid: string;
  private callerId: string;

  constructor() {
    this.apiKey = process.env.EXOTEL_API_KEY || '';
    this.apiToken = process.env.EXOTEL_API_TOKEN || '';
    this.accountSid = process.env.EXOTEL_ACCOUNT_SID || '';
    this.callerId = process.env.EXOTEL_CALLER_ID || '+919827012345';
  }

  async makeCall(params: CallParams): Promise<CallResult> {
    console.log(`[EXOTEL] Initiating outbound voice call to ${params.to} via account ${this.accountSid}`);
    const { triggerExotelOutboundCall } = await import('./exotelService.js');
    const result = await triggerExotelOutboundCall({
      to: params.to,
      leadId: params.metadata?.leadId,
      requirement: params.metadata?.reason,
      callerId: this.callerId
    });
    return {
      callId: result.callSid || `exo_call_${Date.now()}`,
      status: result.status === 'failed' ? 'failed' : 'initiated',
      provider: 'exotel'
    };
  }

  async receiveCall(params: { callId: string; from: string; to: string }): Promise<any> {
    return { accepted: true, callId: params.callId, provider: 'exotel' };
  }

  async transferCall(callId: string, targetNumber: string): Promise<any> {
    return { transferred: true, targetNumber, provider: 'exotel' };
  }

  async getCallStatus(callId: string): Promise<string> {
    return 'in-progress';
  }

  async getRecording(callId: string): Promise<string | null> {
    return null;
  }

  async handleWebhook(payload: any, signature?: string): Promise<any> {
    return { handled: true, providerCallId: payload.CallSid };
  }
}

/**
 * Provider factory
 */
export const getTelephonyProvider = (): TelephonyProvider => {
  const isEnabled = process.env.TELEPHONY_ENABLED === 'true';
  if (isEnabled && process.env.EXOTEL_API_KEY) {
    return new ExotelProvider();
  }
  return new NullTelephonyProvider();
};
