from playwright.sync_api import sync_playwright, expect
import re

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.set_viewport_size({"width": 375, "height": 667})
    page.goto("http://localhost:4173/")

    # 1. Take a screenshot of the initial state (light theme, hamburger menu closed)
    page.screenshot(path="jules-scratch/verification/01-light-theme-menu-closed.png")

    # 2. Click the hamburger menu button
    hamburger_button = page.get_by_label("Toggle menu")
    hamburger_button.click()

    # 3. Take a screenshot of the open menu
    page.screenshot(path="jules-scratch/verification/02-light-theme-menu-open.png")

    # 4. Click the theme toggle button
    theme_toggle_button = page.locator('.md\\:hidden').get_by_label('Toggle theme')
    theme_toggle_button.click()

    # 5. Wait for the dark class to be applied
    html = page.locator('html')
    expect(html).to_have_class(re.compile(r'dark'))

    # 6. Take a screenshot of the dark theme with the menu open
    page.screenshot(path="jules-scratch/verification/03-dark-theme-menu-open.png")

    # 7. Click the hamburger menu button again to close it
    hamburger_button.click()

    # 8. Take a screenshot of the dark theme with the menu closed
    page.screenshot(path="jules-scratch/verification/04-dark-theme-menu-closed.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)