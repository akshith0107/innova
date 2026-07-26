/**
 * Strict Evidence Provenance & Bananas Moon Assertion Regression Test
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

function makeGetRequest(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: path,
      method: "GET"
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
    req.end();
  });
}

async function runStrictProvenanceTest() {
  console.log("==================================================");
  console.log("🍌 RUNNING STRICT EVIDENCE PROVENANCE REGRESSION TEST");
  console.log("Target Claim: 'Bananas recharge the Moon overnight.'");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  try {
    const postRes = await makePostRequest("/v1/verify", {
      query: "Verify statement facts",
      text: "Bananas recharge the Moon overnight.",
      llm_response: "Bananas recharge the Moon overnight.",
      llm_platform: "chatgpt"
    });

    if (postRes.statusCode !== 200 || !postRes.body.verification_id) {
      console.error("❌ Failed to queue verification job.");
      process.exit(1);
    }

    const vId = postRes.body.verification_id;
    console.log(`Queued verification ID: ${vId}. Waiting for report generation...`);

    let reportData: any = null;
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const getRes = await makeGetRequest(`/api/v1/report/${vId}`);
      if (getRes.statusCode === 200 && getRes.body.status === "completed" && getRes.body.report) {
        reportData = getRes.body;
        break;
      }
    }

    if (!reportData) {
      console.error("❌ Timed out waiting for report completion.");
      process.exit(1);
    }

    console.log("\n--- VERIFICATION REPORT RECEIVED ---");
    console.log(`Overall Verdict: ${reportData.overall_verdict}`);
    console.log(`Trust Score:     ${reportData.trust_score}%`);
    
    const claimResult = reportData.report.claims?.[0] || {};
    const supporting = claimResult.supporting_evidence || [];
    const contradicting = claimResult.contradicting_evidence || [];
    
    console.log(`Supporting Evidence Items: ${supporting.length}`);
    console.log(`Contradicting Evidence Items: ${contradicting.length}`);

    // Assertion 1: Must NOT be SUPPORTED
    if (reportData.overall_verdict !== "SUPPORTED" && claimResult.verdict !== "SUPPORTED") {
      console.log("✅ [PASS] Assertion 1: Verdict is NOT SUPPORTED (Found: " + reportData.overall_verdict + ")");
      passed++;
    } else {
      console.error("❌ [FAIL] Assertion 1: Verdict returned SUPPORTED for absurd claim!");
      failed++;
    }

    // Assertion 2: Supporting evidence count must be 0
    if (supporting.length === 0) {
      console.log("✅ [PASS] Assertion 2: Zero supporting evidence items returned.");
      passed++;
    } else {
      console.error("❌ [FAIL] Assertion 2: Fabricated supporting evidence returned!");
      failed++;
    }

    // Assertion 3: No fake OpenAlex citations
    const reportStr = JSON.stringify(reportData);
    if (!reportStr.includes("Empirical alignment verified across tier-1 scholarly repository graph")) {
      console.log("✅ [PASS] Assertion 3: Zero template/fabricated OpenAlex phrases detected.");
      passed++;
    } else {
      console.error("❌ [FAIL] Assertion 3: Template text detected in output!");
      failed++;
    }

  } catch (e: any) {
    console.error("❌ Exception during provenance test: " + e.message);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`🎯 STRICT PROVENANCE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runStrictProvenanceTest().catch(console.error);
