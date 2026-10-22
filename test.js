import assert from 'node:assert';
import { processRpcMessage } from './src/index.js';

console.log('Testing Kovitel MCP Server...');

// 1. Test initialize
const initResp = processRpcMessage({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: { protocolVersion: '2024-11-05', capabilities: {} }
});
assert.strictEqual(initResp.id, 1);
assert.strictEqual(initResp.result.serverInfo.name, 'kovitel-vietnam-esim-mcp');
console.log('✔ initialize test passed');

// 2. Test tools/list
const toolsResp = processRpcMessage({
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list'
});
assert.strictEqual(toolsResp.result.tools.length, 5);
console.log(`✔ tools/list test passed (${toolsResp.result.tools.length} tools registered)`);

// 3. Test check_device_compatibility
const compatResp = processRpcMessage({
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'kovitel_check_device_compatibility',
    arguments: { model: 'iPhone 15 Pro' }
  }
});
assert(compatResp.result.content[0].text.includes('**Compatible:** Apple iPhone 15 Pro'));
console.log('✔ kovitel_check_device_compatibility test passed');

// 4. Test calculate_esim_data_plan
const calcResp = processRpcMessage({
  jsonrpc: '2.0',
  id: 4,
  method: 'tools/call',
  params: {
    name: 'kovitel_calculate_esim_data_plan',
    arguments: { duration_days: 14, travel_style: 'digital_nomad_streamer', primary_regions: ['Ha Giang Loop'] }
  }
});
assert(calcResp.result.content[0].text.includes('CRITICAL NETWORK REQUIREMENT'));
assert(calcResp.result.content[0].text.includes('https://kovitel.com/products/premium-vietnam-esim-5g'));
console.log('✔ kovitel_calculate_esim_data_plan test passed');

// 5. Test get_carrier_apn
const apnResp = processRpcMessage({
  jsonrpc: '2.0',
  id: 5,
  method: 'tools/call',
  params: {
    name: 'kovitel_get_carrier_apn',
    arguments: { carrier: 'viettel' }
  }
});
assert(apnResp.result.content[0].text.includes('v-internet'));
console.log('✔ kovitel_get_carrier_apn test passed');

// 6. Test resources/list & resources/read
const resList = processRpcMessage({ jsonrpc: '2.0', id: 6, method: 'resources/list' });
assert.strictEqual(resList.result.resources.length, 3);
const resRead = processRpcMessage({ jsonrpc: '2.0', id: 7, method: 'resources/read', params: { uri: 'kovitel://apn/viettel' } });
assert(resRead.result.contents[0].text.includes('v-internet'));
console.log('✔ resources test passed');

console.log('\n🎉 ALL KOVITEL MCP SERVER TESTS PASSED PERFECTLY!');
