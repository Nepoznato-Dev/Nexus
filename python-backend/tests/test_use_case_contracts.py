import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai.use_case_contracts import apply_use_case_contract


class UseCaseContractTests(unittest.TestCase):
    def test_code_writing_contract_applies(self):
        result = apply_use_case_contract(
            use_case="code-writing",
            message="Debug this API timeout error in the Python function.",
            response="Start by reproducing the bug.",
            evidence=[],
        )

        self.assertTrue(result["applied"])
        self.assertEqual(result["contract"], "code-writing-v1")
        self.assertIn("Root cause focus:", result["output"])
        self.assertIn("Action plan:", result["output"])
        self.assertIn("Validation:", result["output"])

    def test_mod_log_contract_applies(self):
        result = apply_use_case_contract(
            use_case="mod-log-analysis",
            message="Read this mod log stack trace and find crash cause.",
            response="The issue appears during startup.",
            evidence=[{"text": "NullPointerException at ModLoader.init"}],
        )

        self.assertTrue(result["applied"])
        self.assertEqual(result["contract"], "mod-log-analysis-v1")
        self.assertIn("Observed signals:", result["output"])
        self.assertIn("Likely root cause:", result["output"])
        self.assertIn("Next diagnostics:", result["output"])

    def test_non_specialized_use_case_passthrough(self):
        result = apply_use_case_contract(
            use_case="feature-search",
            message="Where is the setting?",
            response="Open settings and search for performance.",
            evidence=[],
        )

        self.assertFalse(result["applied"])
        self.assertEqual(result["contract"], "none")
        self.assertEqual(result["output"], "Open settings and search for performance.")


if __name__ == "__main__":
    unittest.main()