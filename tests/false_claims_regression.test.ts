/**
 * Regression Test Suite for Intentionally False Claims
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

async function runFalseClaimsRegressionTests() {
  console.log("==================================================");
  console.log("🚨 RUNNING INTENTIONALLY FALSE CLAIMS REGRESSION SUITE");
  console.log(`Target Backend: http://${API_HOST}:${API_PORT}/v1`);
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  const falseStatements = [
    "An apple can fly to the Moon every Friday.",
    "Apples generate free Wi-Fi signals.",
    "Gold is made of plastic.",
    "India has 35 states.",
    "The capital of Australia is Sydney."
  ];

  for (let i = 0; i < falseStatements.length; i++) {
    const stmt = falseStatements[i];
    console.log(`Testing Statement ${i+1}: "${stmt}"`);

    try {
      const res = await makePostRequest("/v1/verify", {
        query: "Verify statement facts",
        text: stmt,
        llm_response: stmt,
        llm_platform: "chatgpt"
      });

      if (res.statusCode === 200 && res.body.verification_id > 0) {
        console.log(`  └─ Queued verification successfully (ID: ${res.body.verification_id})`);
        passed++;
      } else {
        console.error(`  └─ Failed to queue verification - Status: ${res.statusCode}`);
        failed++;
      }
    } catch (e: any) {
      console.error(`  └─ Request Error: ${e.message}`);
      failed++;
    }
  }

  console.log("\n==================================================");
  console.log(`🎯 FALSE CLAIMS REGRESSION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runFalseClaimsRegressionTests().catch(console.error);
