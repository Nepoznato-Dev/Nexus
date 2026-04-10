import os
import sys
import unittest
from unittest.mock import AsyncMock, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai.knowledge_router import run_knowledge_turn
from ai.knowledge_store import build_knowledge_snapshot


class KnowledgeRouterTests(unittest.IsolatedAsyncioTestCase):
    def test_build_knowledge_snapshot_returns_shape(self):
        snapshot = build_knowledge_snapshot("Find ALLOY architecture and performance monitoring details.")

        self.assertIn("keywords", snapshot)
        self.assertIn("sourceCount", snapshot)
        self.assertIn("sources", snapshot)
        self.assertIn("hasCoverage", snapshot)
        self.assertTrue(isinstance(snapshot["keywords"], list))
        self.assertTrue(isinstance(snapshot["sources"], list))

    async def test_run_knowledge_turn_enriches_payload_and_result(self):
        payload = {
            "message": "How should ALLOY handle performance metrics?",
            "mode": "plus",
            "toolState": {},
            "context": {"sources": ["existing source"]},
            "fluxTags": [],
            "deviceProfile": {},
            "siteState": {},
        }

        with patch(
            "ai.knowledge_router.run_ai_turn",
            new=AsyncMock(return_value={
                "response": "Use browser metrics for collection and Python for policy.",
                "metadata": {},
                "transparencyReport": {},
            }),
        ) as mocked:
            result = await run_knowledge_turn(payload)

        self.assertEqual(mocked.await_count, 1)
        called_payload = mocked.await_args.args[0]
        self.assertIn("knowledgeSnapshot", called_payload["context"])
        self.assertTrue(len(called_payload["context"]["sources"]) >= 1)
        self.assertIn("knowledgeSnapshot", result["metadata"])
        self.assertIn("knowledgeSnapshot", result["transparencyReport"])


if __name__ == "__main__":
    unittest.main()