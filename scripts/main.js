(function(global) {
  'use strict';

  function toNumber(value, fallback) {
    var parsed = parseInt(value, 10);
    return isFinite(parsed) ? parsed : fallback;
  }

  function toBoolean(value) {
    if (value === true || value === false) return value;
    if (typeof value === 'number') return value !== 0;

    var normalized = String(value || '').trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }

  function createUnityBridge(loseScreen) {
    var state = {
      coinsCount: loseScreen.getState().coinsCount,
      heartsCount: loseScreen.getState().heartsCount,
      timeOutCoinsCost: loseScreen.getState().timeOutCoinsCost,
      isSubscribed: loseScreen.getState().isSubscribed,
      maxLives: loseScreen.getState().heartsMaxCount
    };

    function setCoins(value) {
      state.coinsCount = Math.max(0, toNumber(value, 0));
      loseScreen.setCoins(state.coinsCount);
      return state.coinsCount;
    }

    function setHearts(value) {
      state.heartsCount = Math.max(0, toNumber(value, 0));
      loseScreen.setHearts(state.heartsCount);
      return state.heartsCount;
    }

    function setTimeOutCoinsCost(value) {
      state.timeOutCoinsCost = Math.max(0, toNumber(value, 0));
      loseScreen.setTimeOutCoinsCost(state.timeOutCoinsCost);
      return state.timeOutCoinsCost;
    }

    function setSubscriptionStatus(value) {
      state.isSubscribed = toBoolean(value);
      loseScreen.setSubscriptionStatus(state.isSubscribed);
      return state.isSubscribed;
    }

    function setMaxLives(value) {
      state.maxLives = Math.max(0, toNumber(value, 0));
      loseScreen.setMaxLives(state.maxLives);
      return state.maxLives;
    }

    return {
      state: state,
      setCoins: setCoins,
      setHearts: setHearts,
      setTimeOutCoinsCost: setTimeOutCoinsCost,
      setSubscriptionStatus: setSubscriptionStatus,
      setMaxLives: setMaxLives
    };
  }

  function boot() {
    var loseScreen = new global.LoseScreen({
      stylesheetPath: './css/lose-screen.css',
      assetBasePath: './content/icons/lose'
    });
    var unityBridge = createUnityBridge(loseScreen);
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
    global.setCoins = unityBridge.setCoins;
    global.setHearts = unityBridge.setHearts;
    global.setTimeOutCoinsCost = unityBridge.setTimeOutCoinsCost;
    global.setSubscriptionStatus = unityBridge.setSubscriptionStatus;
    global.setMaxLives = unityBridge.setMaxLives;

    global.unityState = unityBridge.state;
    global.unityBridge = unityBridge;
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
