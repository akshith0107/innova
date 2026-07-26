/**
 * 10-Category End-to-End Regression Test Suite
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

async function run10CategoryE2ERegression() {
  console.log("==================================================");
  console.log("🛡️ RUNNING 10-CATEGORY END-TO-END REGRESSION SUITE");
  console.log(`Target Backend: http://${API_HOST}:${API_PORT}/v1`);
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  const categories = [
    { cat: "1. Obviously True", text: "The Earth orbits the Sun." },
    { cat: "2. Obviously False", text: "An apple can fly to the Moon every Friday." },
    { cat: "3. Numerical Claim", text: "India has 35 states." },
    { cat: "4. Historical Claim", text: "George Washington was the first President of the United States." },
    { cat: "5. Scientific Claim", text: "Water boils at 100 degrees Celsius at standard atmospheric pressure." },
    { cat: "6. Medical Claim", text: "Drinking bleach cures all viral infections." },
    { cat: "7. Ambiguous Claim", text: "Technology changes human life." },
    { cat: "8. Insufficient Evidence", text: "Extraterrestrials visited Atlantis in 4000 BC." },
    { cat: "9. Mixed Response", text: "The Earth orbits the Sun, but Australia's capital is Sydney." },
    { cat: "10. Opinion Statement", text: "Vanilla is the best ice cream flavor." }
  ];

  for (const item of categories) {
    try {
      const res = await makePostRequest("/v1/verify", {
        query: "Verify 10-Category Suite",
        text: item.text,
        llm_response: item.text,
        llm_platform: "chatgpt"
      });

      if (res.statusCode === 200 && res.body.verification_id > 0) {
        console.log(`✅ [PASS] ${item.cat}: Queued verification ID ${res.body.verification_id}`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${item.cat}: Failed - Status ${res.statusCode}`);
        failed++;
      }
    } catch (e: any) {
      console.error(`❌ [FAIL] ${item.cat}: Error - ${e.message}`);
      failed++;
    }
  }

  console.log("\n==================================================");
  console.log(`🎯 10-CATEGORY E2E TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

run10CategoryE2ERegression().catch(console.error);
