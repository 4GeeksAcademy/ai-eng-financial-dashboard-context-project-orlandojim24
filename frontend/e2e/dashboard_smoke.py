import re

from playwright.sync_api import sync_playwright


def test_dashboard_renders_kpi_data() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            page = browser.new_page()

            page.goto("http://localhost:5173")
            page.wait_for_load_state("networkidle")

            assert page.title() == "Financial Overview"
            assert page.get_by_role("heading", name="Financial Overview").is_visible()

            kpi_section = page.get_by_role(
                "region", name="Key performance indicators"
            )
            expected_labels = [
                "Total Income",
                "Total Outcome",
                "Profit",
                "Profit Margin",
            ]

            for label in expected_labels:
                assert kpi_section.get_by_text(label, exact=True).is_visible()

            values = kpi_section.locator("p.text-3xl")
            assert values.count() == len(expected_labels)
            for index in range(values.count()):
                assert re.search(r"\d", values.nth(index).inner_text())
        finally:
            browser.close()
