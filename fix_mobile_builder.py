# fix_mobile_builder.py

with open("frontend/src/pages/ResumeBuilder.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# ── Fix 1: Main grid layout - make responsive ──
old_grid = '''      <div style={{ display: "grid", gridTemplateColumns: "480px 1fr", height: "calc(100vh - 56px)" }}>
        {/* LEFT */}
        <div style={{ overflowY: "auto", padding: "24px 22px", borderRight: "1px solid #e2e8f0", background: "#fff" }}>'''

new_grid = '''      <div className="rb-main-grid" style={{ display: "grid", gridTemplateColumns: "480px 1fr", height: "calc(100vh - 56px)" }}>
        {/* LEFT - hide on mobile when previewing */}
        <div className={mobileView === "preview" ? "rb-panel-hidden" : "rb-panel-left"} style={{ overflowY: "auto", padding: "24px 22px", borderRight: "1px solid #e2e8f0", background: "#fff" }}>'''

if old_grid in content:
    content = content.replace(old_grid, new_grid)
    print("✅ Fix 1: Main grid made responsive")
else:
    print("❌ Fix 1 failed")

# ── Fix 2: Right panel - hide on mobile when editing ──
old_right = '''        </div>
      </div>
    </div>
  );'''

new_right = '''        </div>
      </div>
    </div>
  );'''

# ── Fix 3: Add mobileView state after existing useState declarations ──
old_state = "  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);"
new_state = '''  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [mobileView, setMobileView] = useState("edit"); // "edit" or "preview"'''

if old_state in content:
    content = content.replace(old_state, new_state)
    print("✅ Fix 2: mobileView state added")
else:
    print("❌ Fix 2 failed")

# ── Fix 4: Add mobile toggle bar after the top navbar closes ──
old_after_nav = '''      <div className="rb-main-grid" style={{ display: "grid", gridTemplateColumns: "480px 1fr", height: "calc(100vh - 56px)" }}>'''

new_after_nav = '''      {/* Mobile toggle bar - only shows on small screens */}
      <div className="rb-mobile-toggle">
        <button
          onClick={() => setMobileView("edit")}
          style={{
            flex: 1, padding: "10px", border: "none", borderRadius: 8,
            background: mobileView === "edit" ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
            color: mobileView === "edit" ? "#fff" : "#64748b",
            fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s"
          }}>
          ✏️ Edit
        </button>
        <button
          onClick={() => setMobileView("preview")}
          style={{
            flex: 1, padding: "10px", border: "none", borderRadius: 8,
            background: mobileView === "preview" ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
            color: mobileView === "preview" ? "#fff" : "#64748b",
            fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s"
          }}>
          👁️ Preview
        </button>
      </div>

      <div className="rb-main-grid" style={{ display: "grid", gridTemplateColumns: "480px 1fr", height: "calc(100vh - 56px)" }}>'''

if old_after_nav in content:
    content = content.replace(old_after_nav, new_after_nav)
    print("✅ Fix 3: Mobile toggle bar added")
else:
    print("❌ Fix 3 failed")

# ── Fix 5: Right panel wrapper - hide on mobile when editing ──
old_right_panel = '''        </div>
      </div>
    </div>
  );'''

# Find the right panel div (after left panel closes)
old_right_div = '''        </div>
        {/* RIGHT - resume preview */}'''

# Let's find what wraps the right preview panel
# From line 3162: the right panel ends with </div></div></div>
# We need to add className to the right panel div

# Search for the preview panel opening
import re

# Find the second major div inside rb-main-grid (the right panel)
# It comes after the left panel's closing </div>
old_right_open = '''        </div>
        <div style={{ overflowY: "auto", background: "#f1f5f9", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px" }}>'''

new_right_open = '''        </div>
        <div className={mobileView === "edit" ? "rb-panel-hidden" : "rb-panel-right"} style={{ overflowY: "auto", background: "#f1f5f9", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px" }}>'''

if old_right_open in content:
    content = content.replace(old_right_open, new_right_open)
    print("✅ Fix 4: Right preview panel responsive")
else:
    print("⚠️  Fix 4: searching for right panel...")
    # Try to find it
    idx = content.find("rb-main-grid")
    snippet = content[content.find("rb-main-grid"):content.find("rb-main-grid")+2000]
    for i, line in enumerate(snippet.split("\n")[5:25], 1):
        print(f"  {i}: {line[:80]}")

# ── Fix 6: Add responsive CSS ──
old_css = '''  const btn = {'''

new_css = '''  // Inject responsive styles
  if (typeof document !== "undefined" && !document.getElementById("rb-responsive-styles")) {
    const styleEl = document.createElement("style");
    styleEl.id = "rb-responsive-styles";
    styleEl.textContent = `
      .rb-mobile-toggle {
        display: none;
        gap: 4px;
        padding: 8px 16px;
        background: #fff;
        border-bottom: 1px solid #e2e8f0;
      }
      @media (max-width: 768px) {
        .rb-mobile-toggle { display: flex !important; }
        .rb-main-grid { grid-template-columns: 1fr !important; height: auto !important; }
        .rb-panel-hidden { display: none !important; }
        .rb-panel-left { display: block !important; height: calc(100vh - 112px); overflow-y: auto; }
        .rb-panel-right { display: block !important; min-height: calc(100vh - 112px); padding: 16px !important; }
        .rb-inp { font-size: 16px !important; }
        .rb-tab { padding: 6px 8px !important; font-size: 11px !important; }
      }
    `;
    document.head.appendChild(styleEl);
  }

  const btn = {'''

if old_css in content:
    content = content.replace(old_css, new_css)
    print("✅ Fix 5: Responsive CSS injected")
else:
    print("❌ Fix 5 failed - searching for btn style...")
    for i, line in enumerate(content.split("\n"), 1):
        if "const btn = {" in line:
            print(f"  Line {i}: {line.strip()}")

with open("frontend/src/pages/ResumeBuilder.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("✅ ResumeBuilder.jsx saved")