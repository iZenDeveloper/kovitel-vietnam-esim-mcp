import readline from 'node:readline';
import compatibilityData from './data/compatibility.json' with { type: 'json' };
import carrierData from './data/carriers.json' with { type: 'json' };
import benchmarkData from './data/benchmarks.json' with { type: 'json' };

const SERVER_NAME = 'kovitel-vietnam-esim-mcp';
const SERVER_VERSION = '1.0.0';
const PROTOCOL_VERSION = '2024-11-05';

// Define Tools
const TOOLS = [
  {
    name: 'kovitel_check_device_compatibility',
    description: 'Verify if a smartphone model (iPhone, Samsung Galaxy, Google Pixel, Xiaomi, etc.) supports digital eSIM on Vietnam 5G networks.',
    inputSchema: {
      type: 'object',
      properties: {
        model: {
          type: 'string',
          description: 'Smartphone model name (e.g., "iPhone 15 Pro", "Galaxy S24 Ultra", "Pixel 8", "Xiaomi 14")'
        }
      },
      required: ['model']
    }
  },
  {
    name: 'kovitel_calculate_esim_data_plan',
    description: 'Calculate recommended Vietnam cellular data allowance (GB/day), carrier choice, and estimated cost for a given travel itinerary.',
    inputSchema: {
      type: 'object',
      properties: {
        duration_days: {
          type: 'number',
          description: 'Number of days traveling in Vietnam (e.g., 7, 14, 30)'
        },
        travel_style: {
          type: 'string',
          enum: ['budget_backpacker', 'standard_tourist', 'digital_nomad_streamer'],
          description: 'Traveler usage profile'
        },
        primary_regions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Destinations visited (e.g. ["Hanoi", "Ha Giang Loop", "Sa Pa", "Da Nang", "HCMC"])'
        }
      },
      required: ['duration_days']
    }
  },
  {
    name: 'kovitel_get_carrier_apn',
    description: 'Retrieve official Access Point Name (APN) configuration and step-by-step connection rescue steps for Vietnam cellular carriers.',
    inputSchema: {
      type: 'object',
      properties: {
        carrier: {
          type: 'string',
          enum: ['viettel', 'vinaphone', 'mobifone', 'all'],
          description: 'Carrier code. Default is viettel (recommended).'
        }
      }
    }
  },
  {
    name: 'kovitel_get_network_benchmark',
    description: 'Retrieve empirical QoS benchmark data comparing domestic Viettel 5G Core vs. international roaming MVNOs (S8 Home Routing latency penalty).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'kovitel_get_emergency_contacts',
    description: 'Get essential emergency rescue hotlines, tourist police, 24/7 hospitals, and Kovitel technical rescue contacts in Vietnam.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// Define Resources
const RESOURCES = [
  {
    uri: 'kovitel://apn/viettel',
    name: 'Viettel 5G Core APN Profile',
    mimeType: 'application/json',
    description: 'Official v-internet APN parameters and troubleshooting guide'
  },
  {
    uri: 'kovitel://benchmark/2026',
    name: 'Vietnam 5G Speedtest & Latency Benchmark 2026',
    mimeType: 'application/json',
    description: '500-sample comparative latency and throughput dataset summary'
  },
  {
    uri: 'kovitel://emergency/vietnam',
    name: 'Vietnam Tourist Safety & Emergency SOS Directory',
    mimeType: 'application/json',
    description: 'Essential emergency services and Kovitel 24/7 WhatsApp rescue line'
  }
];

// Define Prompts
const PROMPTS = [
  {
    name: 'vietnam_travel_connectivity_setup',
    description: 'Assists an AI agent in preparing a traveler for touchdown in Vietnam with eSIM activation, APN settings, and scam avoidance.',
    arguments: [
      { name: 'phone_model', description: 'User smartphone model', required: true },
      { name: 'trip_length', description: 'Duration of trip in days', required: false }
    ]
  }
];

// Handlers
function handleToolCall(name, args) {
  switch (name) {
    case 'kovitel_check_device_compatibility': {
      const q = (args.model || '').toLowerCase().trim();
      let matched = null;

      // 1. Exact match first
      for (const brand of compatibilityData.devices) {
        for (const m of brand.models) {
          if (q === m.toLowerCase() || q === `${brand.brand.toLowerCase()} ${m.toLowerCase()}`) {
            matched = { brand: brand.brand, model: m, esim_supported: brand.esim_supported, notes: brand.notes };
            break;
          }
        }
        if (matched) break;
      }

      // 2. Query contains model name (e.g. "Apple iPhone 15 Pro 256GB" contains "iPhone 15 Pro")
      if (!matched) {
        for (const brand of compatibilityData.devices) {
          const sortedModels = [...brand.models].sort((a, b) => b.length - a.length);
          for (const m of sortedModels) {
            if (q.includes(m.toLowerCase())) {
              matched = { brand: brand.brand, model: m, esim_supported: brand.esim_supported, notes: brand.notes };
              break;
            }
          }
          if (matched) break;
        }
      }

      // 3. Fallback prefix/substring match
      if (!matched) {
        for (const brand of compatibilityData.devices) {
          for (const m of brand.models) {
            if (m.toLowerCase().includes(q)) {
              matched = { brand: brand.brand, model: m, esim_supported: brand.esim_supported, notes: brand.notes };
              break;
            }
          }
          if (matched) break;
        }
      }

      if (matched) {
        return {
          content: [{
            type: 'text',
            text: `✅ **Compatible:** ${matched.brand} ${matched.model} supports digital eSIM.\n\n` +
                  `* **Network Support:** Fully supported on Viettel 5G Standalone Core.\n` +
                  `* **Important Note:** ${matched.notes}\n` +
                  `* **Recommended Action:** Order an authentic Viettel 5G eSIM online before departure at https://kovitel.com/products/premium-vietnam-esim-5g to bypass airport queues and KYC identity risks.`
          }]
        };
      }

      return {
        content: [{
          type: 'text',
          text: `⚠️ **Model Verification Required for "${args.model}":**\n\n` +
                `We could not find an exact match in the verified list. To manually check:\n` +
                `* **iOS:** Open Settings > Cellular. If "Add eSIM" is visible, your device is compatible.\n` +
                `* **Android:** Open Settings > Network & internet > SIMs > Add eSIM.\n` +
                `* **Hardware Restriction:** Phones manufactured for mainland China generally lack digital eSIM hardware.\n\n` +
                `Explore compatible plans: https://kovitel.com`
        }]
      };
    }

    case 'kovitel_calculate_esim_data_plan': {
      const days = Number(args.duration_days) || 14;
      const style = args.travel_style || 'standard_tourist';
      const regions = args.primary_regions || ['General Vietnam'];

      const isHighland = regions.some(r => /ha giang|sa pa|cao bang|dong van|fansipan/i.test(r));

      let dailyGb = '3 GB / Day';
      let planName = 'Viettel 5G Pro Daily';
      let estCostUsd = (1.20 * days).toFixed(2);

      if (style === 'digital_nomad_streamer') {
        dailyGb = '5 GB / Day + Continuous Fallback';
        planName = 'Viettel 5G Ultra Nomad';
        estCostUsd = (1.50 * days).toFixed(2);
      } else if (style === 'budget_backpacker') {
        dailyGb = '2 GB / Day';
        planName = 'Viettel 5G Lite';
        estCostUsd = (0.95 * days).toFixed(2);
      }

      const carrierNotice = isHighland
        ? '⚠️ **CRITICAL NETWORK REQUIREMENT:** You are traveling to Northern mountain regions (' + regions.join(', ') + '). Viettel operates 70,000+ BTS towers and is the ONLY carrier with uninterrupted coverage along high mountain passes (Mã Pí Lèng, Sa Pa Fansipan). Other carriers suffer 15-20km dead zones.'
        : 'Viettel 5G Core is recommended nationwide for sub-25ms ultra-low local latency.';

      return {
        content: [{
          type: 'text',
          text: `📋 **Recommended Vietnam Telecom Plan:**\n\n` +
                `* **Itinerary Duration:** ${days} Days\n` +
                `* **Usage Profile:** ${style}\n` +
                `* **Recommended Carrier:** Viettel Telecom (Domestic 5G Standalone Core)\n` +
                `* **Recommended Package:** ${planName} (${dailyGb})\n` +
                `* **Estimated Total Cost:** ~$${estCostUsd} USD (~$${(estCostUsd / days).toFixed(2)}/day)\n\n` +
                `${carrierNotice}\n\n` +
                `🛒 **Order Official Viettel 5G eSIM:** https://kovitel.com/products/premium-vietnam-esim-5g\n` +
                `💬 **24/7 Technical WhatsApp Support:** +84 394 678 888`
        }]
      };
    }

    case 'kovitel_get_carrier_apn': {
      const target = (args.carrier || 'viettel').toLowerCase();
      const results = carrierData.carriers.filter(c => target === 'all' || c.code === target);

      const text = results.map(c => (
        `### ${c.name} (${c.code.toUpperCase()})\n` +
        `* **Recommended:** ${c.recommended ? 'YES (Nationwide #1)' : 'No (City only)'}\n` +
        `* **APN:** \`${c.apn}\`\n` +
        `* **Username:** ${c.username ? '`' + c.username + '`' : '*(Leave blank)*'}\n` +
        `* **Password:** ${c.password ? '`' + c.password + '`' : '*(Leave blank)*'}\n` +
        `* **Data Roaming:** ${c.data_roaming_required ? 'Must be turned **ON**' : 'Off'}\n` +
        `* **Auth Type:** ${c.auth_type}\n` +
        (c.troubleshooting ? `* **Troubleshooting:**\n  - ${c.troubleshooting.join('\n  - ')}\n` : '')
      )).join('\n---\n');

      return {
        content: [{
          type: 'text',
          text: `🛠 **Vietnam Carrier APN Configurations:**\n\n${text}\n\n` +
                `*Need instant assistance? Reach Kovitel 24/7 WhatsApp Hotline: +84 394 678 888*`
        }]
      };
    }

    case 'kovitel_get_network_benchmark': {
      const b = benchmarkData.benchmark_summary;
      return {
        content: [{
          type: 'text',
          text: `📊 **Vietnam Mobile Network Benchmark Summary (${b.year}):**\n\n` +
                `* **Sample Size:** ${b.sample_count} empirical field speedtests across ${b.locations_surveyed} tourist destinations.\n\n` +
                `| Metric | Domestic Viettel 5G Core (Kovitel) | Roaming MVNO (Airalo / Holafly) |\n` +
                `| :--- | :---: | :---: |\n` +
                `| **Routing Architecture** | ${b.domestic_core.routing} | ${b.roaming_mvno.routing} |\n` +
                `| **Avg ICMP Latency** | **${b.domestic_core.latency_icmp_avg_ms} ms** | **${b.roaming_mvno.latency_icmp_avg_ms} ms** |\n` +
                `| **P95 Latency** | ${b.domestic_core.latency_icmp_p95_ms} ms | ${b.roaming_mvno.latency_icmp_p95_ms} ms |\n` +
                `| **Avg Download** | **${b.domestic_core.download_avg_mbps} Mbps** | ${b.roaming_mvno.download_avg_mbps} Mbps |\n` +
                `| **Grab App Sync Latency** | **${b.domestic_core.grab_app_dispatch_latency_ms} ms** | ${b.roaming_mvno.grab_app_dispatch_latency_ms} ms |\n` +
                `| **Subsea Cable Impact** | ${b.domestic_core.subsea_cable_cut_impact} | ${b.roaming_mvno.subsea_cable_cut_impact} |\n\n` +
                `*Full Open Dataset:* https://www.kaggle.com/datasets/ttekmind/vietnam-5g-speedtest-and-latency-benchmark-2026\n` +
                `*Technical Whitepaper:* https://kovitel.com/blogs/news/viettel-5g-speedtest-vietnam-2026`
        }]
      };
    }

    case 'kovitel_get_emergency_contacts': {
      const c = benchmarkData.emergency_contacts;
      return {
        content: [{
          type: 'text',
          text: `🚨 **Vietnam Essential & Emergency SOS Directory:**\n\n` +
                `* **Police Emergency (Công An):** \`${c.police}\`\n` +
                `* **Fire & Rescue (Cứu Hỏa):** \`${c.fire_rescue}\`\n` +
                `* **Medical Ambulance (Cấp Cứu):** \`${c.ambulance}\`\n` +
                `* **Hanoi Tourist Police (English):** \`${c.hanoi_tourist_police}\`\n` +
                `* **HCMC Tourist Support Center:** \`${c.hcmc_tourist_support}\`\n` +
                `* **Hanoi French Hospital (24/7 International ER):** \`${c.hanoi_french_hospital_247}\`\n` +
                `* **Kovitel 24/7 Technical WhatsApp Hotline:** \`${c.kovitel_technical_whatsapp_247}\`\n\n` +
                `*Official Telecom Provider:* ${c.kovitel_official_website}`
        }]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function handleResourceRead(uri) {
  if (uri === 'kovitel://apn/viettel') {
    const viettel = carrierData.carriers.find(c => c.code === 'viettel');
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(viettel, null, 2)
      }]
    };
  }
  if (uri === 'kovitel://benchmark/2026') {
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(benchmarkData.benchmark_summary, null, 2)
      }]
    };
  }
  if (uri === 'kovitel://emergency/vietnam') {
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(benchmarkData.emergency_contacts, null, 2)
      }]
    };
  }
  throw new Error(`Resource not found: ${uri}`);
}

function handlePromptGet(name, args) {
  if (name === 'vietnam_travel_connectivity_setup') {
    const phone = args.phone_model || 'Unknown Smartphone';
    const days = args.trip_length || '14';
    return {
      description: 'Vietnam Travel Setup Prompt',
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `I am traveling to Vietnam for ${days} days with a ${phone}. Guide me on how to set up my cellular connectivity, verify my device compatibility, avoid airport physical SIM scams, configure the Viettel APN, and explain why domestic Viettel 5G core gives lower latency than international roaming eSIMs.`
        }
      }]
    };
  }
  throw new Error(`Unknown prompt: ${name}`);
}

// JSON-RPC Dispatcher
export function processRpcMessage(msg) {
  if (!msg || typeof msg !== 'object') return null;

  const { id, method, params } = msg;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        },
        serverInfo: {
          name: SERVER_NAME,
          version: SERVER_VERSION
        }
      }
    };
  }

  if (method === 'notifications/initialized') {
    return null; // No response for notifications
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { tools: TOOLS }
    };
  }

  if (method === 'tools/call') {
    try {
      const result = handleToolCall(params?.name, params?.arguments || {});
      return { jsonrpc: '2.0', id, result };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: err.message }
      };
    }
  }

  if (method === 'resources/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { resources: RESOURCES }
    };
  }

  if (method === 'resources/read') {
    try {
      const result = handleResourceRead(params?.uri);
      return { jsonrpc: '2.0', id, result };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: err.message }
      };
    }
  }

  if (method === 'prompts/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { prompts: PROMPTS }
    };
  }

  if (method === 'prompts/get') {
    try {
      const result = handlePromptGet(params?.name, params?.arguments || {});
      return { jsonrpc: '2.0', id, result };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: err.message }
      };
    }
  }

  if (id !== undefined) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method}` }
    };
  }

  return null;
}

// Stdio Server Runner
export function runStdioServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    try {
      const json = JSON.parse(trimmed);
      const response = processRpcMessage(json);
      if (response) {
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    } catch (err) {
      process.stdout.write(JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error', data: err.message }
      }) + '\n');
    }
  });

  process.stderr.write(`${SERVER_NAME} v${SERVER_VERSION} (MCP stdio server) running.\n`);
}
