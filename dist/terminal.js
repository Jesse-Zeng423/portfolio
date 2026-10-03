const themeInput = document.querySelector(".theme-picker input");
const themeKey = "portfolio-theme-color";
const defaultTheme = "#b0d8be";

function applyTheme(color) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return;
  const rgb = [1, 3, 5].map(
    (offset) => parseInt(color.slice(offset, offset + 2), 16) / 255,
  );
  const max = Math.max(...rgb),
    min = Math.min(...rgb),
    delta = max - min;
  const lightness = (max + min) / 2;
  const saturation = delta
    ? (delta / (1 - Math.abs(2 * lightness - 1))) * 100
    : 0;
  let hue = 0;
  if (delta) {
    const index = rgb.indexOf(max);
    hue =
      [
        (rgb[1] - rgb[2]) / delta,
        (rgb[2] - rgb[0]) / delta + 2,
        (rgb[0] - rgb[1]) / delta + 4,
      ][index] * 60;
    if (hue < 0) hue += 360;
  }
  // Keep surfaces dark and labels bright for every selected hue.
  const tone = (cap, light) =>
    `hsl(${hue} ${Math.min(saturation, cap)}% ${light}%)`;
  const tokens = {
    "--bg": tone(10, 10),
    "--outside": tone(10, 7),
    "--ink": tone(12, 89),
    "--muted": tone(12, 68),
    "--line": tone(16, 25),
    "--accent": tone(60, 79),
    "--wash": tone(20, 15),
    "--frame": tone(20, 49),
    "--border": tone(20, 36),
    "--hover": tone(24, 22),
    "--outline": tone(20, 19),
    "--selection": tone(24, 32),
  };
  Object.entries(tokens).forEach(([name, value]) => {
    if (color.toLowerCase() === defaultTheme)
      document.documentElement.style.removeProperty(name);
    else document.documentElement.style.setProperty(name, value);
  });
  if (themeInput) themeInput.value = color;
}

if (themeInput) {
  try {
    const saved = localStorage.getItem(themeKey);
    if (saved) applyTheme(saved);
  } catch {
    /* The picker still works when browser storage is unavailable. */
  }
  themeInput.disabled = false;
  themeInput.addEventListener("input", () => {
    applyTheme(themeInput.value);
    try {
      localStorage.setItem(themeKey, themeInput.value);
    } catch {}
  });
}

const panels = [...document.querySelectorAll(".page-panel")];
const panelLinks = [...document.querySelectorAll("[data-panel-link]")];

if (panels.length) {
  function showPanel() {
    // Legacy evidence anchors also reveal the panel containing their target.
    const target = document.getElementById(window.location.hash.slice(1));
    const activePanel = target?.closest(".page-panel") || panels[0];
    panels.forEach((panel) => {
      panel.hidden = panel !== activePanel;
    });
    panelLinks.forEach((link) => {
      if (link.dataset.panelLink === activePanel.id) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    const disclosure = target?.closest("details");
    if (disclosure) disclosure.open = true;
    if (target && target !== activePanel) {
      target.scrollIntoView({ block: "nearest" });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }
  showPanel();
  window.addEventListener("hashchange", showPanel);
  panelLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      if (window.location.hash !== link.hash) {
        window.history.pushState(null, "", link.hash);
      }
      showPanel();
    });
  });
  window.addEventListener("popstate", showPanel);
}

// Keep old homepage bookmarks useful after moving sections to their own routes.
if (window.location.pathname === "/") {
  const legacyRoutes = { "#work": "/projects/", "#experience": "/experience/" };
  const destination = legacyRoutes[window.location.hash];
  if (destination) window.location.replace(destination);
}
