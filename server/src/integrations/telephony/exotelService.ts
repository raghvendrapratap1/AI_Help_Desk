import dotenv from 'dotenv';
import { Conversation } from '../../models/Conversation.js';
import { Lead } from '../../models/Lead.js';

dotenv.config();

export interface ExotelCallOptions {
  from?: string;
  to: string;
  callerId?: string;
  callType?: 'trans' | 'promo';
  customField?: string;
  statusCallback?: string;
  leadId?: string;
  patientName?: string;
  requirement?: string;
  doctorName?: string;
}

export interface ExotelCallResponse {
  success: boolean;
  callSid?: string;
  status: string;
  data?: any;
  error?: string;
  mode: 'live_exotel' | 'mock_simulation';
}

export function formatIndianPhoneForExotel(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) {
    return '0' + digits;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return '0' + digits.slice(2);
  }
  return digits;
}

export async function triggerExotelOutboundCall(options: ExotelCallOptions): Promise<ExotelCallResponse> {
  const accountSid = process.env.EXOTEL_ACCOUNT_SID;
  const apiKey = process.env.EXOTEL_API_KEY;
  const apiToken = process.env.EXOTEL_API_TOKEN;
  const subdomain = process.env.EXOTEL_SUBDOMAIN || 'api.exotel.com';
  const callerId = options.callerId || process.env.EXOTEL_CALLER_ID || '08047101234';

  const cleanTo = formatIndianPhoneForExotel(options.to);

  const hasLiveCredentials = Boolean(
    accountSid &&
    apiKey &&
    apiToken &&
    accountSid !== 'your_exotel_sid_here' &&
    apiKey !== 'your_exotel_api_key_here'
  );

  console.log('\n================== [EXOTEL OUTBOUND CALL TRIGGER] ==================');
  console.log('To:       ', options.to, '(Exotel format:', cleanTo, ')');
  console.log('CallerId: ', callerId);
  console.log('Patient:  ', options.patientName || 'Patient');
  console.log('Lead ID:  ', options.leadId || 'N/A');
  console.log('Mode:     ', hasLiveCredentials ? 'LIVE EXOTEL API' : 'MOCK SIMULATION (Credentials not supplied)');
  console.log('====================================================================\n');

  if (!hasLiveCredentials) {
    const simulatedSid = 'exo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    console.log('[EXOTEL SIMULATION] Call connected to Indian PSTN subscriber', cleanTo, '. Sid:', simulatedSid);

    return {
      success: true,
      callSid: simulatedSid,
      status: 'queued',
      mode: 'mock_simulation',
      data: {
        Call: {
          Sid: simulatedSid,
          AccountSid: accountSid || 'EXOTEL_MOCK_ACCOUNT',
          To: cleanTo,
          From: callerId,
          Status: 'queued',
          StartTime: new Date().toISOString(),
          Direction: 'outbound-api'
        }
      }
    };
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiToken}`).toString('base64');
    const url = `https://${subdomain}/v1/Accounts/${accountSid}/Calls/connect.json`;

    const bodyParams = new URLSearchParams();
    bodyParams.append('From', cleanTo);
    bodyParams.append('To', callerId);
    bodyParams.append('CallerId', callerId);
    bodyParams.append('CallType', options.callType || 'trans');
    if (options.customField || options.leadId) {
      bodyParams.append('CustomField', options.customField || options.leadId || '');
    }
    if (options.statusCallback) {
      bodyParams.append('StatusCallback', options.statusCallback);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyParams.toString()
    });

    const responseJson: any = await response.json();

    if (!response.ok) {
      console.error('[EXOTEL API ERROR]', responseJson);
      return {
        success: false,
        status: 'failed',
        error: (responseJson && responseJson.RestException && responseJson.RestException.Message) || ('Exotel HTTP ' + response.status),
        mode: 'live_exotel',
        data: responseJson
      };
    }

    const callSid = responseJson && responseJson.Call && responseJson.Call.Sid;
    return {
      success: true,
      callSid,
      status: (responseJson && responseJson.Call && responseJson.Call.Status) || 'queued',
      mode: 'live_exotel',
      data: responseJson
    };
  } catch (err: any) {
    console.error('[EXOTEL DISPATCH EXCEPTION]', err);
    return {
      success: false,
      status: 'failed',
      error: err.message,
      mode: 'live_exotel'
    };
  }
}

export async function handleExotelPassthruCallback(queryOrBody: any) {
  const callSid = queryOrBody.CallSid || queryOrBody.callSid;
  const from = queryOrBody.From || queryOrBody.from;
  const to = queryOrBody.To || queryOrBody.to;
  const digits = queryOrBody.Digits;
  const customField = queryOrBody.CustomField;

  console.log('[EXOTEL PASSTHRU CALLBACK] CallSid:', callSid, '| From:', from, '| Digits:', digits, '| CustomField:', customField);

  const cleanPhone = (from || '').replace(/\D/g, '').slice(-10);
  if (cleanPhone) {
    const leadFilter = customField ? [{ _id: customField }, { phone: cleanPhone }] : [{ phone: cleanPhone }];
    const lead = await Lead.findOne({ [String.fromCharCode(36) + 'or']: leadFilter });

    if (lead) {
      lead.status = 'Contacted';
      lead.notes.push({
        content: 'Exotel PSTN Call connected (CallSid: ' + callSid + '). Patient responded to follow-up call.',
        author: 'Exotel Telephony'
      } as any);
      await lead.save();
    }
  }

  return {
    status: 200,
    text: 'OK'
  };
}