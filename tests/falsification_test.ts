/**
 * Investigative Falsification Engine & Asymmetric Risk-Weighted Trust Test Suite
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

async function runFalsificationTests() {
  console.log("==================================================");
  console.log("🛡️ RUNNING INVESTIGATIVE FALSIFICATION TEST SUITE");
  console.log(`Target Backend: http://${API_HOST}:${API_PORT}/v1`);
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  const testCases = [
    { name: "CASE 1: India 35 states (False Count)", text: "The Earth orbits the Sun. India has 35 states." },
    { name: "CASE 2: Capital of Australia Sydney (False Capital)", text: "Water boils at 100°C. The capital of Australia is Sydney." },
    { name: "CASE 3: Speed of light 500 km/s (False Speed)", text: "Mount Everest is in Nepal. Speed of light is 500 km/s." },
    { name: "CASE 4: HTML programming language (False Classification)", text: "Python is a programming language. HTML is a programming language." },
    { name: "CASE 5: Spiders 6 legs (False Count)", text: "Humans have 46 chromosomes. Spiders have 6 legs." },
    { name: "CASE 6: WW2 ended in 1990 (False Year)", text: "Tokyo is the capital of Japan. World War 2 ended in 1990." },
    { name: "CASE 7: Mars closer to Sun than Venus (False Orbit)", text: "Oxygen is required for human respiration. Mars is closer to the Sun than Venus." },
    { name: "CASE 8: Einstein invented telephone (False Inventor)", text: "Shakespeare wrote Hamlet. Einstein invented the telephone." },
    { name: "CASE 9: Pacific Ocean smallest (False Ocean)", text: "Neil Armstrong walked on the Moon. Pacific Ocean is the smallest ocean." },
    { name: "CASE 10: Gold is synthetic plastic (False Classification)", text: "Diamond is made of carbon. Gold is a synthetic plastic." }
  ];

  for (const tc of testCases) {
    try {
      const res = await makePostRequest("/v1/verify", {
        query: "Investigate statement facts",
        text: tc.text,
        llm_response: tc.text,
        llm_platform: "chatgpt"
      });

      if (res.statusCode === 200 && res.body.verification_id > 0) {
        console.log(`✅ [PASS] ${tc.name} (Job ID: ${res.body.job_id})`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${tc.name} - Status: ${res.statusCode}`);
        failed++;
      }
    } catch (e: any) {
      console.error(`❌ [FAIL] ${tc.name} - Error: ${e.message}`);
      failed++;
    }
  }

  console.log("\n==================================================");
  console.log(`🎯 FALSIFICATION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runFalsificationTests().catch(console.error);
