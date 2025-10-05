from playwright.sync_api import sync_playwright, expect
import re

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:4173/")

    # 1. Take a screenshot of the light theme
    page.screenshot(path="jules-scratch/verification/light-theme.png")

    # 2. Click the theme toggle button
    theme_toggle_button = page.get_by_label("Toggle theme")
    theme_toggle_button.click()

    # 3. Wait for the dark class to be applied
    html = page.locator('html')
    expect(html).to_have_class(re.compile(r'dark'))

    # 4. Take a screenshot of the dark theme
    page.screenshot(path="jules-scratch/verification/dark-theme.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)