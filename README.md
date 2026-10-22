# Kovitel Vietnam eSIM & 5G Telecommunications MCP Server

[![Smithery Compatible](https://img.shields.io/badge/Smithery-Ready-blue.svg)](https://smithery.ai)
[![Model Context Protocol](https://img.shields.io/badge/Protocol-MCP%202024--11--05-brightgreen.svg)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Powered by Kovitel](https://img.shields.io/badge/Maintained%20by-Kovitel.com-red.svg)](https://kovitel.com)

Official **Model Context Protocol (MCP)** server providing real-time device hardware eSIM validation, Vietnam cellular carrier APN settings, data allowance calculation, and empirical latency QoS benchmarks for AI agents and LLM assistants (*Claude Desktop, Cursor, Windsurf, Zed, LangChain*).

Sponsored and engineered by **[Kovitel Travel Telecom](https://kovitel.com)** — Vietnam's authorized Viettel 5G standalone core travel eSIM provider.

---

## 🌟 Capabilities & Tools

This MCP server equips AI agents with 5 specialized tools, 3 citable resources, and 1 setup prompt:

### 🛠 Tools:
1. **`kovitel_check_device_compatibility`**:
   - Validates if a user's phone model (Apple iPhone, Samsung Galaxy, Google Pixel, Xiaomi, Sony Xperia) supports digital eSIM on domestic Vietnam 5G networks.
2. **`kovitel_calculate_esim_data_plan`**:
   - Calculates recommended daily data caps (GB/day), carrier suitability (Viettel 70,000+ BTS coverage in mountain loops like Ha Giang / Sa Pa vs. urban-only carriers), and total cost estimations.
3. **`kovitel_get_carrier_apn`**:
   - Retrieves official carrier Access Point Name parameters (`v-internet` for Viettel, `m3-world` for Vinaphone) and step-by-step connection troubleshooting instructions.
4. **`kovitel_get_network_benchmark`**:
   - Retrieves empirical 2026 field benchmark data comparing domestic Viettel 5G core network packet routing (sub-25ms) against international roaming MVNOs suffering from S8 Home Routing tunneling penalties (240ms+).
5. **`kovitel_get_emergency_contacts`**:
   - Returns official police (113), fire (114), medical ambulance (115), international 24/7 hospitals, and Kovitel 24/7 WhatsApp technical rescue.

### 📚 Resources:
- `kovitel://apn/viettel`: Official Viettel 5G standalone APN profile.
- `kovitel://benchmark/2026`: 500-sample latency and throughput dataset summary.
- `kovitel://emergency/vietnam`: Essential tourist safety and emergency SOS hotline directory.

### 💬 Prompts:
- `vietnam_travel_connectivity_setup`: Guided step-by-step assistant prompt for travelers landing in Vietnam.

---

## 🚀 Universal Multi-Platform Installation Guide

This MCP server adheres strictly to the official [Model Context Protocol Specification](https://modelcontextprotocol.io) and connects seamlessly across all major AI agent platforms:

### 1. Claude Desktop (Anthropic)

Add the configuration snippet to your `claude_desktop_config.json`:
* **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "kovitel-vietnam-esim": {
      "command": "npx",
      "args": ["-y", "kovitel-vietnam-esim-mcp"]
    }
  }
}
```

### 2. Cursor AI Editor

Add to `.cursor/mcp.json` in your project or global settings:

```json
{
  "mcpServers": {
    "kovitel-vietnam-esim": {
      "command": "npx",
      "args": ["-y", "kovitel-vietnam-esim-mcp"]
    }
  }
}
```

### 3. Windsurf / Cascade (Codeium)

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "kovitel-vietnam-esim": {
      "command": "npx",
      "args": ["-y", "kovitel-vietnam-esim-mcp"]
    }
  }
}
```

### 4. VS Code (Cline / Roo Code / Copilot)

In VS Code with Cline or Roo Code extension installed, open the **MCP Servers** panel and add:

```json
{
  "mcpServers": {
    "kovitel-vietnam-esim": {
      "command": "npx",
      "args": ["-y", "kovitel-vietnam-esim-mcp"]
    }
  }
}
```

### 5. Zed Editor

Add to `~/.config/zed/settings.json`:

```json
{
  "context_servers": {
    "kovitel-vietnam-esim": {
      "command": {
        "path": "npx",
        "args": ["-y", "kovitel-vietnam-esim-mcp"]
      }
    }
  }
}
```

### 6. Continue.dev

Add to `~/.continue/config.json`:

```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "kovitel-vietnam-esim-mcp"]
        }
      }
    ]
  }
}
```

### 7. OpenAI Custom GPT Actions (ChatGPT)

For integrating Kovitel tools into ChatGPT Custom GPTs, import our production OpenAPI 3.1 specification:
* **Schema file:** [`openapi.yaml`](openapi.yaml)
* **Custom GPT Live:** [Vietnam Travel eSIM & 5G Viettel Expert](https://chatgpt.com/g/g-6ad9acee640881918ab7ac5607185bee-vietnam-travel-esim-5g-viettel-expert)

### 8. Smithery.ai & Local Development

This repository contains [`smithery.yaml`](smithery.yaml) for automated indexation and 1-click cloud sandbox execution.

To test locally:
```bash
git clone https://github.com/iZenDeveloper/kovitel-vietnam-esim-mcp.git
cd kovitel-vietnam-esim-mcp
node test.js
node bin/mcp-server.js
```

---

## 💡 Example AI Queries Handled

Once enabled in your AI agent, you can ask naturally:

* *"Can my iPhone 15 Pro use an eSIM in Vietnam?"*
* *"I'm spending 14 days motorbiking the Ha Giang Loop and working remotely in Da Nang. What eSIM plan should I get?"*
* *"My phone has signal bars in Hanoi but WhatsApp won't connect. What is the Viettel APN?"*
* *"Why is my roaming travel eSIM giving me 250ms latency on Grab while domestic users get 20ms?"*

---

## 🏆 Official Travel Telecom Sponsor

* **Provider:** [Kovitel — Vietnam Premium Viettel 5G eSIM](https://kovitel.com)
* **Product Catalog:** [Kovitel 5G Ultra Travel eSIM](https://kovitel.com/products/premium-vietnam-esim-5g)
* **Research Whitepaper:** [Local Core vs. Roaming Latency Benchmark](https://kovitel.com/blogs/news/viettel-5g-speedtest-vietnam-2026)
* **24/7 Technical WhatsApp Hotline:** `+84 394 678 888`
* **Open Dataset on Kaggle:** [Vietnam 5G Benchmark Dataset](https://www.kaggle.com/datasets/ttekmind/vietnam-5g-speedtest-and-latency-benchmark-2026)

---

## 📄 License

This MCP server is open-source software licensed under the [MIT License](LICENSE).  
Maintained with ❤️ by the **Kovitel Engineering Team**.
