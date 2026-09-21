import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.VAPI_PRIVATE_API_KEY;
const assistantId = process.env.VAPI_ASSISTANT_ID;
const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

const targetUrl = process.argv[2] || process.env.VAPI_SERVER_URL;

if (!apiKey) {
  console.error('Error: VAPI_PRIVATE_API_KEY not found in environment.');
  process.exit(1);
}

if (!targetUrl) {
  console.log('Usage: npm run sync-vapi <public-https-url>');
  console.log('Example: npm run sync-vapi https://your-tunnel.trycloudflare.com/api/vapi-webhook');
  process.exit(1);
}

const webhookUrl = targetUrl.endsWith('/api/vapi-webhook') ? targetUrl : `${targetUrl.replace(/\/$/, '')}/api/vapi-webhook`;

async function sync() {
  console.log(`[SYNC VAPI] Setting Webhook URL across Vapi components to: ${webhookUrl}`);

  // 1. Update Tools
  const toolIds = [
    '8d058b0b-61a2-4606-afa9-7c65465b7b33',
    '3c89c0a3-cd64-4293-a9ee-75a39a8d9bc3'
  ];
  for (const toolId of toolIds) {
    try {
      const toolRes = await fetch(`https://api.vapi.ai/tool/${toolId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ server: { url: webhookUrl, timeoutSeconds: 20 } })
      });
      const toolData: any = await toolRes.json();
      console.log(`✓ Tool ${toolId} (${toolData.name || 'tool'}) Server URL updated:`, toolData.server?.url || toolData.id);
    } catch (e: any) {
      console.error(`Tool ${toolId} update failed:`, e.message);
    }
  }

  // 2. Update Assistant
  if (assistantId) {
    try {
      const asstRes = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverUrl: webhookUrl,
          serverMessages: ['end-of-call-report', 'status-update', 'tool-calls']
        })
      });
      const asstData: any = await asstRes.json();
      console.log('✓ Assistant Server URL updated:', asstData.serverUrl || asstData.id);
    } catch (e: any) {
      console.error('Assistant update failed:', e.message);
    }
  }

  // 3. Update Phone Number
  if (phoneNumberId) {
    try {
      const phoneRes = await fetch(`https://api.vapi.ai/phone-number/${phoneNumberId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ server: { url: webhookUrl, timeoutSeconds: 20 } })
      });
      const phoneData: any = await phoneRes.json();
      console.log('✓ Phone Number Server URL updated:', phoneData.server?.url || phoneData.id);
    } catch (e: any) {
      console.error('Phone Number update failed:', e.message);
    }
  }

  console.log('[SYNC VAPI] All components synchronized with your live server!');
}

sync();
