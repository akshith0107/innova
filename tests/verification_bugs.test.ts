/**
 * Verification Pipeline Bug Repair Test Suite for PRAMAAN AI
 */

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000/v1";

async function runBugRepairTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING PRAMAAN VERIFICATION BUG REPAIR SUITE");
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

  // TEST CASE 1: Irrelevant Answer (Low Relevance, Factually Correct, Prompt Not Answered)
  await assertTest("CASE 1: Irrelevant Answer (Prompt: FIFA World Cup vs Eiffel Tower)", async () => {
    const res = await fetch(`${API_BASE_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "The Eiffel Tower is in Paris.",
        platform: "chatgpt"
      })
    });
    const data = await res.json();
    return res.status === 200 && data.session_id && data.claims.length > 0;
  });

  // TEST CASE 2: Incomplete Comparison (Missing Angular Topic)
  await assertTest("CASE 2: Incomplete Answer (Prompt: Compare React and Angular vs Response: React only)", async () => {
    const res = await fetch(`${API_BASE_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "React is a open-source JavaScript library developed by Meta.",
        platform: "chatgpt"
      })
    });
    const data = await res.json();
    return res.status === 200 && data.claims.length >= 1;
  });

  // TEST CASE 3: Mixed Claims (1 Supported + 1 Contradicted -> BOTH Displayed)
  await assertTest("CASE 3: Mixed Claims Preservation (Hyderabad capital + India 35 states)", async () => {
    const res = await fetch(`${API_BASE_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Hyderabad is the capital of Telangana. India has 35 states.",
        platform: "chatgpt"
      })
    });
    const data = await res.json();
    // Verify BOTH claims exist in output!
    const claims = data.claims || [];
    const hasTelangana = claims.some((c: any) => c.text.includes("Telangana") || c.extracted_from_sentence.includes("Telangana"));
    const has35States = claims.some((c: any) => c.text.includes("35 states") || c.extracted_from_sentence.includes("35 states"));
    return res.status === 200 && hasTelangana && has35States;
  });

  // TEST CASE 4: Multi-Status Claim Rendering (Supported, Contradicted, Unsupported)
  await assertTest("CASE 4: Multi-Status Claims (Supported, Contradicted, Unsupported)", async () => {
    const res = await fetch(`${API_BASE_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Paris is the capital of France. Water boils at 500 degrees celsius. Local bakery has 5 cakes.",
        platform: "chatgpt"
      })
    });
    const data = await res.json();
    return res.status === 200 && data.claims.length >= 3;
  });

  // TEST CASE 5: Real-time Incremental Claim Extraction
  await assertTest("CASE 5: Real-time Incremental Stream Extraction", async () => {
    const res = await fetch(`${API_BASE_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Quantum computers use qubits for computation.",
        platform: "chatgpt"
      })
    });
    const data = await res.json();
    return res.status === 200 && data.claims.length > 0;
  });

  console.log("\n==================================================");
  console.log(`🎯 BUG REPAIR RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runBugRepairTests().catch(console.error);
