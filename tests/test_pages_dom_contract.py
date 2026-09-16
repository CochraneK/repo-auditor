from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class PagesDomContractTest(unittest.TestCase):
    def test_root_app_references_existing_dom_ids(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        js = (ROOT / "app.js").read_text(encoding="utf-8")

        ids = set(re.findall(r'id="([^"]+)"', html))
        refs = set(re.findall(r'\$\("([^"]+)"\)', js))
        missing = sorted(refs - ids)

        self.assertEqual(
            missing,
            [],
            "app.js references DOM ids missing from index.html: " + ", ".join(missing),
        )


if __name__ == "__main__":
    unittest.main()
