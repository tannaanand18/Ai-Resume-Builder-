# fix_mobile_final.py

with open("frontend/src/pages/ResumeBuilder.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# ── Fix 1: Add className to right panel div (line 3182) ──
old_right = '        {/* RIGHT — Live Preview */}\n        <div style={{ overflowY: "auto", background: "linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)", padding: "24px 0", display: "...'

# Use exact match
old_right_exact = '        {/* RIGHT — Live Preview */}\n        <div style={{ overflowY: "auto", background: "linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)",'
new_right_exact = '        {/* RIGHT — Live Preview */}\n        <div className={mobileView === "edit" ? "rb-panel-hidden" : "rb-panel-right"} style={{ overflowY: "auto", background: "linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)",'

if old_right_exact in content:
    content = content.replace(old_right_exact, new_right_exact)
    print("✅ Fix 1: Right panel className added")
else:
    print("❌ Fix 1 failed - searching...")
    for i, line in enumerate(content.split("\n"), 1):
        if "RIGHT" in line and "Live Preview" in line:
            print(f"  Line {i}: {line.strip()}")

# ── Fix 2: Replace CSS with complete responsive styles ──
old_css = '''      @media (max-width: 768px) {
        .rb-mobile-toggle { display: flex !important; }
        .rb-main-grid { grid-template-columns: 1fr !important; height: auto !important; }
        .rb-panel-hidden { display: none !important; }
        .rb-panel-left { display: block !important; height: calc(100vh - 112px); overflow-y: auto; }
        .rb-panel-right { display: block !important; min-height: calc(100vh - 112px); padding: 16px !important; }
        .rb-inp { font-size: 16px !important; }
        .rb-tab { padding: 6px 8px !important; font-size: 11px !important; }
      }'''

new_css = '''      @media (max-width: 768px) {
        .rb-mobile-toggle { display: flex !important; }
        .rb-main-grid { grid-template-columns: 1fr !important; height: auto !important; }
        .rb-panel-hidden { display: none !important; }
        .rb-panel-left { display: block !important; height: calc(100vh - 112px); overflow-y: auto; width: 100% !important; }
        .rb-panel-right { display: flex !important; flex-direction: column !important; align-items: center !important; width: 100% !important; min-height: calc(100vh - 112px); padding: 12px 0 !important; overflow-y: auto !important; }
        .rb-inp { font-size: 16px !important; }
        .rb-tab { padding: 6px 4px !important; font-size: 10px !important; }
        .rb-navbar-right { gap: 4px !important; }
        .rb-navbar-right .rb-btn-text { display: none !important; }
        .rb-preview-canvas { width: 100% !important; height: auto !important; transform: none !important; overflow: visible !important; }
      }'''

if old_css in content:
    content = content.replace(old_css, new_css)
    print("✅ Fix 2: Responsive CSS updated")
else:
    print("❌ Fix 2 failed")

# ── Fix 3: Make navbar right side responsive ──
old_nav_right = '        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>'
new_nav_right = '        <div className="rb-navbar-right" style={{ display: "flex", gap: 8, alignItems: "center" }}>'

# Only replace the first occurrence (navbar)
if old_nav_right in content:
    content = content.replace(old_nav_right, new_nav_right, 1)
    print("✅ Fix 3: Navbar right side className added")
else:
    print("❌ Fix 3 failed")

# ── Fix 4: Make A4 canvas scale to fit mobile screen ──
old_canvas = '''            style={{
              background: "#fff",
              width: "210mm",
              height: "297mm",
              overflow: "hidden",
              boxSizing: "border-box",
              position: "relative",
              boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact"
            }}'''

new_canvas = '''className="rb-preview-canvas"
            style={{
              background: "#fff",
              width: "210mm",
              height: "297mm",
              overflow: "hidden",
              boxSizing: "border-box",
              position: "relative",
              boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
              transformOrigin: "top center",
            }}'''

if old_canvas in content:
    content = content.replace(old_canvas, new_canvas)
    print("✅ Fix 4: Canvas className added")
else:
    print("❌ Fix 4 failed")

# ── Fix 5: Add inline script to scale canvas on mobile ──
old_toggle = '''      {/* Mobile toggle bar - only shows on small screens */}
      <div className="rb-mobile-toggle">'''

new_toggle = '''      {/* Mobile toggle bar - only shows on small screens */}
      <div className="rb-mobile-toggle">'''

# ── Fix 6: Add useEffect to scale preview canvas on mobile ──
old_useeffect_marker = "  const [mobileView, setMobileView] = useState(\"edit\"); // \"edit\" or \"preview\""

new_useeffect_marker = '''  const [mobileView, setMobileView] = useState("edit"); // "edit" or "preview"

  // Scale A4 canvas to fit mobile screen
  useEffect(() => {
    const scaleCanvas = () => {
      const canvas = document.querySelector(".rb-preview-canvas");
      if (!canvas) return;
      if (window.innerWidth <= 768) {
        const screenW = window.innerWidth - 24;
        const canvasW = 794; // 210mm in px
        const scale = screenW / canvasW;
        canvas.style.transform = `scale(${scale})`;
        canvas.style.transformOrigin = "top center";
        canvas.style.marginBottom = `-${794 * (1 - scale)}px`;
      } else {
        canvas.style.transform = "none";
        canvas.style.marginBottom = "0";
      }
    };
    scaleCanvas();
    window.addEventListener("resize", scaleCanvas);
    return () => window.removeEventListener("resize", scaleCanvas);
  }, [mobileView]);'''

if old_useeffect_marker in content:
    content = content.replace(old_useeffect_marker, new_useeffect_marker)
    print("✅ Fix 5: Canvas scale useEffect added")
else:
    print("❌ Fix 5 failed")

# ── Fix 7: Navbar buttons - add text spans for hiding on mobile ──
old_share_btn = '''              Share
            </button>'''
new_share_btn = '''              <span className="rb-btn-text">Share</span>
            </button>'''

if old_share_btn in content:
    content = content.replace(old_share_btn, new_share_btn, 1)
    print("✅ Fix 6: Share button text wrapped")
else:
    print("⚠️  Fix 6 skipped")

old_dl_btn = '''            Download PDF
          </button>'''
new_dl_btn = '''            <span className="rb-btn-text">Download PDF</span>
          </button>'''

if old_dl_btn in content:
    content = content.replace(old_dl_btn, new_dl_btn, 1)
    print("✅ Fix 7: Download PDF button text wrapped")
else:
    print("⚠️  Fix 7 skipped")

with open("frontend/src/pages/ResumeBuilder.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("\n✅ ResumeBuilder.jsx saved")