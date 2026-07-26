"""Parser Robustness & Evidence Safety Invariants Python Unit Test Suite"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath("backend"))

from app.agents.judge import parse_robust_json, validate_verdict_invariants, JudgeVerdictSchema

def run_parser_robustness_tests():
    print("==================================================")
    print("RUNNING PARSER ROBUSTNESS & INVARIANT TEST SUITE")
    print("==================================================\n")

    passed = 0
    failed = 0

    def assert_test(name, fn):
        nonlocal passed, failed
        try:
            if fn():
                print(f"[PASS] {name}")
                passed += 1
            else:
                print(f"[FAIL] {name}")
                failed += 1
        except Exception as e:
            print(f"[FAIL] {name} - Exception: {e}")
            failed += 1

    # Test 1: Markdown code block wrapped JSON
    def test_markdown_json():
        raw = "```json\n{\n  \"verdict\": \"CONTRADICTED\",\n  \"confidence\": 0.95,\n  \"reasoning\": \"Disproven claim.\"\n}\n```"
        parsed = parse_robust_json(raw)
        return parsed["verdict"] == "CONTRADICTED" and parsed["confidence"] == 0.95
    assert_test("1. Markdown ```json ... ``` code block parsing", test_markdown_json)

    # Test 2: Trailing comma handling
    def test_trailing_comma():
        raw = "{\n  \"verdict\": \"SUPPORTED\",\n  \"confidence\": 0.85,\n  \"reasoning\": \"Valid facts\",\n}"
        parsed = parse_robust_json(raw)
        return parsed["verdict"] == "SUPPORTED"
    assert_test("2. Trailing comma inside JSON object", test_trailing_comma)

    # Test 3: Confidence score bounds validation
    def test_confidence_bounds():
        try:
            JudgeVerdictSchema(
                verdict="SUPPORTED",
                confidence=1.5,
                reasoning="Invalid high confidence"
            )
            return False
        except Exception:
            return True
    assert_test("3. Reject confidence > 1.0 (1.5 raises error)", test_confidence_bounds)

    # Test 4: Percentage string confidence validation
    def test_percentage_confidence():
        v = JudgeVerdictSchema(
            verdict="SUPPORTED",
            confidence="95%",
            reasoning="Valid percentage string"
        )
        return v.confidence == 0.95
    assert_test("4. Normalize percentage string '95%' to float 0.95", test_percentage_confidence)

    # Test 5: Invariant violation - SUPPORTED with 0 supporting evidence
    def test_supported_zero_evidence():
        try:
            validate_verdict_invariants("SUPPORTED", 0.95, [], [], "An apple can fly")
            return False
        except ValueError as e:
            return "0 supporting evidence" in str(e)
    assert_test("5. Invariant Violation: SUPPORTED with 0 supporting evidence rejected", test_supported_zero_evidence)

    # Test 6: Invariant violation - Absurd claim SUPPORTED rejected
    def test_absurd_claim_invariant():
        try:
            validate_verdict_invariants("SUPPORTED", 0.95, [{"text": "mock"}], [], "Apples fly to the moon")
            return False
        except ValueError as e:
            return "CANNOT be evaluated as SUPPORTED" in str(e)
    assert_test("6. Invariant Violation: Absurd claim evaluated as SUPPORTED rejected", test_absurd_claim_invariant)

    print("\n==================================================")
    print(f"PARSER & INVARIANT TEST RESULTS: {passed} PASSED, {failed} FAILED")
    print("==================================================")

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_parser_robustness_tests()
