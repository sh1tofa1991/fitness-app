/**
 * Обёртка Lucide для статического сайта (https://lucide.dev)
 */
(function (global) {
  function toPascal(name) {
    return String(name)
      .split("-")
      .filter(Boolean)
      .map(function (s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
      })
      .join("");
  }

  function html(name, className, extraAttrs) {
    if (!global.lucide) return "";
    const key = toPascal(name);
    const node = global.lucide.icons[key];
    if (!node) {
      console.warn("[Lucide] icon not found:", name);
      return "";
    }
    const attrs = Object.assign({ "aria-hidden": "true" }, extraAttrs || {});
    if (className) attrs.class = className;
    const svg = global.lucide.createElement(node, attrs);
    return svg.outerHTML;
  }

  function init(root) {
    if (!global.lucide) return;
    global.lucide.createIcons({
      root: root || document,
      attrs: { "stroke-width": 2 },
    });
  }

  global.GymLucide = { html: html, init: init };
})(typeof window !== "undefined" ? window : this);
