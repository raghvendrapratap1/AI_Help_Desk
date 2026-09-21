import dotenv from 'dotenv';
dotenv.config();

export interface OutboundCallRequest {
  to: string;
  patientName: string;
  doctorName?: string;
  requirement?: string;
  leadId?: string;
}

export interface OutboundCallResponse {
  success: boolean;
  callId?: string;
  status?: string;
  error?: string;
  raw?: any;
}

/**
 * Format phone to E.164 standard (e.g. +919691395507)
 */
export function formatE164Phone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (rawPhone.startsWith('+')) {
    return '+' + digits;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

/**
 * Trigger Outbound Phone Call via Vapi AI
 */
export async function triggerVapiOutboundCall(params: OutboundCallRequest): Promise<OutboundCallResponse> {
  const apiKey = process.env.VAPI_PRIVATE_API_KEY;
  const assistantId = process.env.VAPI_ASSISTANT_ID;
  const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

  if (!apiKey || !assistantId || !phoneNumberId) {
    const missing = [];
    if (!apiKey) missing.push('VAPI_PRIVATE_API_KEY');
    if (!assistantId) missing.push('VAPI_ASSISTANT_ID');
    if (!phoneNumberId) missing.push('VAPI_PHONE_NUMBER_ID');
    console.warn(`[VAPI OUTBOUND] Cannot place call: Missing credentials (${missing.join(', ')})`);
    return {
      success: false,
      error: `Missing Vapi configuration: ${missing.join(', ')}`
    };
  }

  const e164Number = formatE164Phone(params.to);

  console.log(`[VAPI OUTBOUND] Placing call to ${e164Number} (${params.patientName}) via Assistant ${assistantId}`);

  try {
    const payload = {
      assistantId,
      phoneNumberId,
      customer: {
        number: e164Number,
        name: params.patientName
      },
      assistantOverrides: {
        variableValues: {
          patientName: params.patientName,
          doctorName: params.doctorName || 'Dr. Sandesh Jain',
          appointmentDate: '2026-09-07',
          appointmentTime: '11:00 AM',
          reason: params.requirement || 'Clinical consultation follow-up'
        }
      }
    };

    const res = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseData: any = await res.json();

    if (!res.ok) {
      console.error('[VAPI OUTBOUND ERROR RESPONSE]', responseData);
      return {
        success: false,
        error: responseData.message || responseData.error || `HTTP ${res.status}: Failed to initiate call`,
        raw: responseData
      };
    }

    console.log(`[VAPI OUTBOUND SUCCESS] Call ID: ${responseData.id} | Status: ${responseData.status}`);
    return {
      success: true,
      callId: responseData.id,
      status: responseData.status,
      raw: responseData
    };
  } catch (err: any) {
    console.error('[VAPI OUTBOUND EXCEPTION]', err);
    return {
      success: false,
      error: err.message || 'Network error connecting to Vapi API'
    };
  }
}
