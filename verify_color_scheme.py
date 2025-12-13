from playwright.sync_api import sync_playwright

def verify_color_scheme(page):
    page.goto("http://localhost:3000")

    # Handle Landing Page
    try:
        page.wait_for_load_state("networkidle")

        if page.is_visible("text=Create New Floorplan"):
             print("Found Landing Page")
             page.click("text=Create New Floorplan")

             # Dialog
             print("Waiting for New Project Dialog")
             page.wait_for_selector("text=New Project", timeout=5000)

             # Fill input. Assuming it's the first input.
             page.fill("input", "Test Project")

             print("Creating Project")
             page.click("button:has-text('Create Project')")
    except Exception as e:
        print(f"Navigation setup warning: {e}")

    # Now we should be in the editor
    print("Waiting for TopToolbar")
    page.wait_for_selector("text=File", timeout=10000)

    # Add a room so we can see colors
    print("Adding Room")
    if page.is_visible("button:has-text('Bedroom')"):
        page.click("button:has-text('Bedroom')")
    elif page.is_visible("text=Add Room"):
         page.click("text=Add Room")

    # 2. Click "Edit"
    print("Clicking Edit")
    page.click("button:has-text('Edit')")

    # 3. Click "Color Scheme..."
    print("Clicking Color Scheme...")
    page.click("text=Color Scheme...")

    # 4. Wait for dialog
    print("Waiting for Color Scheme Dialog")
    page.wait_for_selector("text=Color Schemes")

    # Screenshot Dialog
    page.screenshot(path="/home/jules/verification/color_scheme_dialog.png")

    # 5. Select "Modern"
    print("Selecting Modern Scheme")
    page.click("text=Standard") # Open dropdown
    page.click("text=Modern")   # Select option

    # 7. Apply
    print("Applying Scheme")
    page.click("button:has-text('Apply Scheme')")

    # 8. Switch to 2D Editor
    print("Switching to 2D Editor")
    page.click("button:has-text('View')")
    page.click("text=2D Editor")

    # Wait for canvas
    page.wait_for_selector("[data-testid='canvas-viewport']", timeout=5000)

    # Screenshot Canvas
    page.screenshot(path="/home/jules/verification/canvas_modern_scheme.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 720})
        try:
            verify_color_scheme(page)
            print("Verification script ran successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
