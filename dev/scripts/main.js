(function(global) {
  'use strict';

  function boot() {
    var debugPanel = new global.DebugPanel();
    var hotkeyController = new global.DebugHotkeyController({
      debugPanel: debugPanel
    });

    hotkeyController.start();
    global.debugPanel = debugPanel;
    global.debugHotkeyController = hotkeyController;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
    return;
  }

  boot();
})(window);
