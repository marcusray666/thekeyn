// Ultra-aggressive border removal
(function() {
  function nukeBorders() {
    const all = document.querySelectorAll('*');
    all.forEach(el => {
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) {
        el.style.setProperty('border', '0px solid transparent', 'important');
        el.style.setProperty('border-width', '0px', 'important');
        el.style.setProperty('border-style', 'none', 'important');
        el.style.setProperty('outline', '0px solid transparent', 'important');
        el.style.setProperty('outline-width', '0px', 'important');
        el.style.setProperty('outline-style', 'none', 'important');
        el.style.setProperty('box-shadow', 'none', 'important');
        
        // Remove Tailwind classes
        if (el.className) {
          el.className = el.className.replace(/border[-\w]*/g, '').replace(/ring[-\w]*/g, '').trim();
        }
      }
    });
  }
  
  // Execute aggressively
  nukeBorders();
  new MutationObserver(nukeBorders).observe(document.body, { childList: true, subtree: true, attributes: true });
  setInterval(nukeBorders, 50);
  
  // Override on load
  window.addEventListener('load', nukeBorders);
  document.addEventListener('DOMContentLoaded', nukeBorders);
})();