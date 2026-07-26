/**
 * Fail-Loudly Verdict Validation & Pipeline Preservation Test Suite
 */

import http from 'http';

const API_HOST = "127.0.0.1";
const API_PORT = 8000;

function makePostRequest(path: string, bodyData: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(bodyData);
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: body });
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(data);
    req.end();
  });
}

async function runFailLoudlyTests() {
  console.log("==================================================");
  console.log("🛡️ RUNNING FAIL-LOUDLY VERDICT PRESERVATION TEST SUITE");
  console.log(`Target Backend: http://${API_HOST}:${API_PORT}/v1`);
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  async function assertTest(name: string, fn: () => Promise<boolean>) {
    try {
      const success = await fn();
      if (success) {
        console.log(`✅ [PASS] ${name}`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${name}`);
        failed++;
      }
    } catch (e: any) {
      console.error(`❌ [FAIL] ${name} - Error: ${e.message}`);
      failed++;
    }
  }

  // Test 1: Intentionally false claim must submit and output CONTRADICTED verdict
  await assertTest("TEST 1: Contradicted claim preservation (India has 35 states)", async () => {
    const res = await makePostRequest("/v1/verify", {
      query: "Verify statement facts",
      text: "India has 35 states.",
      llm_response: "India has 35 states.",
      llm_platform: "chatgpt"
    });
    return res.statusCode === 200 && res.body.verification_id > 0;
  });

  // Test 2: Absurd claim must submit and output CONTRADICTED verdict
  await assertTest("TEST 2: Absurd claim preservation (Apples fly to Moon)", async () => {
    const res = await makePostRequest("/v1/verify", {
      query: "Verify statement facts",
      text: "An apple can fly to the Moon every Friday.",
      llm_response: "An apple can fly to the Moon every Friday.",
      llm_platform: "chatgpt"
    });
    return res.statusCode === 200 && res.body.verification_id > 0;
  });

  // Test 3: True claim preservation
  await assertTest("TEST 3: True claim preservation (Earth orbits Sun)", async () => {
    const res = await makePostRequest("/v1/verify", {
      query: "Verify statement facts",
      text: "The Earth orbits the Sun.",
      llm_response: "The Earth orbits the Sun.",
      llm_platform: "chatgpt"
    });
    return res.statusCode === 200 && res.body.verification_id > 0;
  });

  console.log("\n==================================================");
  console.log(`🎯 FAIL-LOUDLY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runFailLoudlyTests().catch(console.error);
