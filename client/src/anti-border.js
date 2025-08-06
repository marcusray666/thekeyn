// Anti-border runtime injection - executed after all CSS loads
(function() {
  function removeBorders() {
    // Get all elements
    const allElements = document.querySelectorAll('*');
    
    // Override computed styles
    allElements.forEach(el => {
      if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'SELECT') {
        el.style.setProperty('border', 'none', 'important');
        el.style.setProperty('outline', 'none', 'important');
        el.style.setProperty('box-shadow', 'none', 'important');
        
        // Also override any CSS variables
        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.border !== 'none' && computedStyle.border !== '0px none') {
          el.style.setProperty('border', '0px solid transparent', 'important');
        }
        if (computedStyle.outline !== 'none' && computedStyle.outline !== '0px none') {
          el.style.setProperty('outline', '0px solid transparent', 'important');
        }
      }
    });
  }
  
  // Run immediately
  removeBorders();
  
  // Run after DOM changes
  const observer = new MutationObserver(removeBorders);
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Run periodically to catch any dynamic styling
  setInterval(removeBorders, 100);
})();