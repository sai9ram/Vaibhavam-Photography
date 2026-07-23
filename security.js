/**
 * Vaibhavam Photography - Advanced Client-Side Security Script
 * Designed and Developed by UPliv (www.theupliv.com)
 * 
 * Protects source code inspection, disables right-click, blocks common 
 * developer keyboard shortcuts, and implements dynamic DevTools detection.
 */

(function () {
  'use strict';

  // 1. Disable Context Menu (Right Click)
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  }, false);

  // 2. Disable Common Developer Keyboard Shortcuts
  document.addEventListener('keydown', function (e) {
    // Disable F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element Select)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+S (Save Page)
    if (e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
      e.preventDefault();
      return false;
    }
  }, false);

  // 3. DevTools Active Anti-Analysis Blocker
  // This executes a debugger statement in a loop. When Developer Tools are open,
  // the debugger will trigger and pause the execution of the website, making 
  // analysis or script execution impossible for unauthorized users.
  const checkDevTools = function () {
    function detect(val) {
      if (typeof val === 'function') {
        detect(val);
      } else {
        (function () {
          eval('debugger');
        })();
      }
    }
    try {
      detect(checkDevTools);
    } catch (err) {}
  };

  // Run the detection loop continuously
  setInterval(checkDevTools, 500);

  // 4. Console Clearing & Protection
  // Frequently clears the console and overrides common console methods to prevent inspection logs.
  setInterval(function () {
    console.clear();
  }, 1000);

  // Prevent console output logging from revealing any details
  const noOp = function () {};
  if (window.console) {
    window.console.log = noOp;
    window.console.warn = noOp;
    window.console.error = noOp;
    window.console.info = noOp;
    window.console.debug = noOp;
  }
})();
