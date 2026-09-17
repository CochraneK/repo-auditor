import json, unittest
from scripts.semantic_review import endpoint, extract_json

class SemanticReviewTests(unittest.TestCase):
    def test_openai_compatible_endpoint(self):
        self.assertEqual(endpoint('http://localhost:3001/v1'),'http://localhost:3001/v1/chat/completions')
        self.assertEqual(endpoint('https://example.test'),'https://example.test/v1/chat/completions')
    def test_json_and_fenced_json(self):
        self.assertEqual(extract_json('{"confidence":0.8}')['confidence'],0.8)
        self.assertEqual(extract_json('```json\n{"findings":[]}\n```')['findings'],[])
    def test_surrounding_text_fallback(self):
        self.assertEqual(extract_json('result: {"summary":"ok"} done')['summary'],'ok')

if __name__=='__main__':unittest.main()
