from playwright.sync_api import sync_playwright

def verify_connections(page):
    page.goto('http://localhost:3000')

    # Wait for the app to load
    page.wait_for_selector('body')

    # Add a room to the table (Quick Start)
    # The app likely starts with a table. We need to add two rooms.
    # Assuming there's a button "Add Room"

    # Wait for add room button
    page.get_by_role("button", name="Add Room").click()
    page.get_by_role("button", name="Add Room").click()

    # Now we have two rooms. Default positions might be overlapping or side-by-side depending on logic.
    # We need to switch to 2D Canvas view to see connections.

    # Click View menu
    # The View menu might be a dropdown or button group.
    # Based on my memory of codebase, it's a dropdown or toolbar.
    # Let's try to find "View" button.
    # Wait, the memory says: "Playwright selectors for the 'View' toolbar button require `exact: true` to prevent conflict with the 'View 3D' button."

    page.get_by_role("button", name="View", exact=True).click()

    # Click "2D Editor" in dropdown
    page.get_by_role("menuitem", name="2D Editor").click()

    # Now we should be in canvas mode.
    # We need to enable "Show Connections" if it's not enabled by default.
    # It says "Default: off" in the doc I read.
    # So we need to find "Show Connections" toggle.
    # It might be in the View menu again?
    # Or in the toolbar.

    page.get_by_role("button", name="View", exact=True).click()
    # Check "Show Connections"
    page.get_by_role("menuitemcheckbox", name="Show Connections").click()

    # Click away to close menu? Or it closes on click.
    # Let's click the canvas just in case.
    page.mouse.click(100, 100)

    # Now we should see connections if rooms are adjacent.
    # Default room placement: "places them after the last room with a gap"
    # If they have a gap, they are NOT adjacent.
    # We need to move them closer.
    # This is hard to do blindly with drag and drop on canvas without knowing coordinates.
    # BUT we can edit the table coordinates!

    # Switch back to Table View? Or is table always visible?
    # "Application views (Table, Canvas, 3D) are rendered mutually exclusively"

    # So go back to table.
    page.get_by_role("button", name="View", exact=True).click()
    page.get_by_role("menuitem", name="Room Input Table").click()

    # Edit Room 2 position.
    # Room 1 is likely at 0,0, 4x4.
    # Room 2 is likely at 4.2,0 or something (gap).
    # We want Room 2 at 4,0.

    # Find the row for Room 2.
    # The table has cells.
    # We need to find the X position cell for the second row.
    # This might be tricky.
    # Let's assume the rows are rendered.
    # We can try to find an input with value matching the default X position of Room 2?
    # Or just use the fact that it's the second room.

    # Let's try to select the cell by column index if possible, or label?
    # Table might not have labels on cells.
    # But `RoomTableRow` likely has inputs.

    # Alternatively, we can use the "Link Rooms" manual connection feature!
    # "Select two rooms -> Click Link Rooms"
    # This is in "Properties Panel" -> "MultiSelectionPanel".

    # So:
    # 1. Select Room 1 (click row)
    # 2. Ctrl+Click Room 2 (click row)
    # 3. Look at properties panel (right side).
    # 4. Click "Link Rooms".

    # Select Room 1
    # We can click the name cell "Room 1".
    page.get_by_text("Room 1", exact=True).click()

    # Ctrl+Click Room 2
    page.keyboard.down("Control")
    page.get_by_text("Room 2", exact=True).click()
    page.keyboard.up("Control")

    # Now look for "Link Rooms" button in properties panel.
    page.get_by_role("button", name="Link Rooms").click()

    # Now switch to 2D view to see the manual connection.
    page.get_by_role("button", name="View", exact=True).click()
    page.get_by_role("menuitem", name="2D Editor").click()

    # Enable connections again (state might persist but check just in case, or we do it now)
    page.get_by_role("button", name="View", exact=True).click()
    # It's a checkbox, we need to see if it's checked.
    # If it's already checked, clicking it might uncheck it.
    # We can check aria-checked?
    # Or just click it if we didn't click it before (we did click it before but then switched views... store persists?)
    # "Table sorting preferences ... are persisted in useUIStore"
    # "uiStore includes a non-persisted hoveredRoomId"
    # View settings like "Show Connections" might be persisted or not.
    # Let's assume we need to check it.
    # We can check the attribute.

    # Wait, in the first attempt above, we switched to Canvas, enabled it, then switched to Table.
    # If state is global/persisted, it should be still on.

    # Take screenshot of the canvas.
    page.wait_for_timeout(1000) # Wait for render
    page.screenshot(path='/home/jules/verification/adjacency_verification.png')

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_connections(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path='/home/jules/verification/error.png')
        finally:
            browser.close()
