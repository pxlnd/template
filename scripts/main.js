(function(global) {
  'use strict';

  function boot() {
    var loseScreen = new global.LoseScreen({
      stylesheetPath: './css/lose-screen.css',
      assetBasePath: './content/icons/lose'
    });
    var debugPanel = new global.DebugPanel({
      onLose: function() {
        loseScreen.show();
      },
      onRestart: function() {
        loseScreen.hide();
      }
    });
    var hotkeyController = new global.DebugHotkeyController({
      debugPanel: debugPanel
    });

    hotkeyController.start();
    global.loseScreen = loseScreen;
    global.debugPanel = debugPanel;
    global.debugHotkeyController = hotkeyController;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
    return;
  }

  boot();
})(window);
