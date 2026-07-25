/**
 * Comprehensive Integration Test Suite for PRAMAAN Frontend ↔ Backend Integration
 */

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000/v1";

async function runIntegrationTests() {
  console.log("==================================================");
  console.log("🧪 STARTING PRAMAAN INTEGRATION TEST SUITE");
  console.log(`Target Backend: ${API_BASE_URL}`);
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
      console.error(`❌ [FAIL] ${name} - Exception: ${e.message}`);
      failed++;
    }
  }

  // 1. Health API Test
  await assertTest("Health Endpoint Status (GET /v1/health)", async () => {
    const res = await fetch(`${API_BASE_URL}/health`);
    const data = await res.json();
    return res.status === 200 && data.status === "healthy";
  });

  // 2. Submit Verification Pipeline Test
  let verificationId = "";
  await assertTest("Submit Verification Pipeline (POST /v1/verify)", async () => {
    const res = await fetch(`${API_BASE_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Albert Einstein developed the theory of general relativity in 1915.",
        platform: "chatgpt"
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.session_id && data.overall_trust_score) {
      verificationId = data.session_id;
      return true;
    }
    return false;
  });

  console.log("\n==================================================");
  console.log(`🎯 INTEGRATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runIntegrationTests().catch(console.error);
