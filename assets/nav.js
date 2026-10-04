/* nav.js — mobile burger menu (shared by index & project pages) */
(function () {
  "use strict";
  function init() {
    var burger = document.getElementById("burger");
    var menu = document.getElementById("mobile-menu");
    if (!burger || !menu) return;

    function setOpen(open) {
      menu.classList.toggle("open", open);
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.classList.toggle("menu-open", open);
      try {
        if (window.KIA_MOTION && window.KIA_MOTION.lenis) {
          if (open) window.KIA_MOTION.lenis.stop(); else window.KIA_MOTION.lenis.start();
        }
      } catch (e) { }
      if (window.KIA_SFX) window.KIA_SFX.blip();
    }

    burger.addEventListener("click", function () {
      setOpen(!menu.classList.contains("open"));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
      else if (e.target === menu) setOpen(false); /* backdrop tap closes */
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) setOpen(false);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
