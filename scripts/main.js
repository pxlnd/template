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

  function createUnityBridge(loseScreen, mainHud) {
    var mainHudState = mainHud ? mainHud.getState() : { level: 1, visible: false };
    var state = {
      coinsCount: loseScreen.getState().coinsCount,
      heartsCount: loseScreen.getState().heartsCount,
      timeOutCoinsCost: loseScreen.getState().timeOutCoinsCost,
      isSubscribed: loseScreen.getState().isSubscribed,
      maxLives: loseScreen.getState().heartsMaxCount,
      level: mainHudState.level,
      mainHudVisible: mainHudState.visible
    };

    if (mainHud) {
      mainHud.setHandlers({
        onStateChange: function(nextState) {
          state.level = nextState.level;
          state.mainHudVisible = nextState.visible;
        }
      });
    }

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

    function rewardResult(value) {
      var isSuccess = toBoolean(value);
      loseScreen.rewardResult(isSuccess);
      return isSuccess;
    }

    function setLevel(value) {
      var nextLevel = Math.max(1, toNumber(value, 1));
      if (!mainHud) {
        state.level = nextLevel;
        return state.level;
      }
      mainHud.setLevel(nextLevel);
      state.level = mainHud.getState().level;
      return state.level;
    }

    function showMainHud() {
      if (!mainHud) {
        state.mainHudVisible = true;
        return state.mainHudVisible;
      }
      mainHud.show();
      state.mainHudVisible = mainHud.getState().visible;
      return state.mainHudVisible;
    }

    function hideMainHud() {
      if (!mainHud) {
        state.mainHudVisible = false;
        return state.mainHudVisible;
      }
      mainHud.hide();
      state.mainHudVisible = mainHud.getState().visible;
      return state.mainHudVisible;
    }

    return {
      state: state,
      setCoins: setCoins,
      setHearts: setHearts,
      setTimeOutCoinsCost: setTimeOutCoinsCost,
      setSubscriptionStatus: setSubscriptionStatus,
      setMaxLives: setMaxLives,
      rewardResult: rewardResult,
      setLevel: setLevel,
      showMainHud: showMainHud,
      hideMainHud: hideMainHud
    };
  }

  function boot() {
    function continueAfterRewardMock() {
      // TODO: Replace with real game continuation flow.
      console.log('[mock] Continue game after rewarded ad');
    }

    var loseScreen = new global.LoseScreen({
      stylesheetPath: './css/lose-screen.css',
      assetBasePath: './content/icons/lose',
      onRewardRequest: function() {
        global.location.href = 'uniwebview://reward';
      },
      onRewardResult: function(payload) {
        if (!payload || payload.success !== true) return;
        continueAfterRewardMock();
      },
      onPurchase: function() {
        global.location.href = 'uniwebview://subscription_request';
      }
    });
    var mainHud = typeof global.MainHud === 'function'
      ? new global.MainHud({
        stylesheetPath: './css/main-hud.css',
        assetBasePath: './content/icons/game',
        level: 1,
        onBack: function() {
          global.location.href = 'uniwebview://back';
        },
        onRestart: function() {
          global.location.href = 'uniwebview://restart';
        }
      })
      : null;
    var unityBridge = createUnityBridge(loseScreen, mainHud);
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
    global.rewardResult = unityBridge.rewardResult;
    global.setLevel = unityBridge.setLevel;
    global.showMainHud = unityBridge.showMainHud;
    global.hideMainHud = unityBridge.hideMainHud;

    global.unityState = unityBridge.state;
    global.unityBridge = unityBridge;
    global.loseScreen = loseScreen;
    global.mainHud = mainHud;
    global.debugPanel = debugPanel;
    global.debugHotkeyController = hotkeyController;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
    return;
  }

  boot();
})(window);
