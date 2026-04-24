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

  function createUnityBridge(loseScreen, mainHud, quitScreen) {
    var loseScreenState = loseScreen.getState();
    var mainHudState = mainHud ? mainHud.getState() : { level: 1, visible: false };
    var quitScreenState = quitScreen ? quitScreen.getState() : { visible: false };
    var state = {
      coinsCount: loseScreenState.coinsCount,
      heartsCount: loseScreenState.heartsCount,
      timeOutCoinsCost: loseScreenState.timeOutCoinsCost,
      isSubscribed: loseScreenState.isSubscribed,
      maxLives: loseScreenState.heartsMaxCount,
      livesTimerText: loseScreenState.livesTimerText,
      level: mainHudState.level,
      mainHudVisible: mainHudState.visible,
      quitScreenVisible: quitScreenState.visible
    };

    if (mainHud) {
      mainHud.setHandlers({
        onStateChange: function(nextState) {
          state.level = nextState.level;
          state.mainHudVisible = nextState.visible;
        }
      });
    }

    if (quitScreen) {
      quitScreen.setHandlers({
        onShow: function(nextState) {
          state.quitScreenVisible = nextState.visible;
        },
        onHide: function(nextState) {
          state.quitScreenVisible = nextState.visible;
        },
        onStateChange: function(nextState) {
          state.coinsCount = nextState.coinsCount;
          state.heartsCount = nextState.heartsCount;
          state.quitScreenVisible = nextState.visible;
        }
      });
    }

    loseScreen.setHandlers({
      onShow: function(nextState) {
        state.coinsCount = nextState.coinsCount;
        state.heartsCount = nextState.heartsCount;
      },
      onStateChange: function(nextState) {
        state.coinsCount = nextState.coinsCount;
        state.heartsCount = nextState.heartsCount;
        state.timeOutCoinsCost = nextState.timeOutCoinsCost;
        state.isSubscribed = nextState.isSubscribed;
        state.maxLives = nextState.heartsMaxCount;
        state.livesTimerText = nextState.livesTimerText;

        if (quitScreen) {
          quitScreen.setCoins(state.coinsCount);
          quitScreen.setHearts(state.heartsCount);
        }
      }
    });

    function setCoins(value) {
      state.coinsCount = Math.max(0, toNumber(value, 0));
      loseScreen.setCoins(state.coinsCount);
      if (quitScreen) quitScreen.setCoins(state.coinsCount);
      return state.coinsCount;
    }

    function setHearts(value) {
      state.heartsCount = Math.max(0, toNumber(value, 0));
      loseScreen.setHearts(state.heartsCount);
      if (quitScreen) quitScreen.setHearts(state.heartsCount);
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

    function setLivesTimer(value) {
      state.livesTimerText = String(value || '--:--');
      loseScreen.setLivesTimer(state.livesTimerText);
      return state.livesTimerText;
    }

    function rewardResult(value) {
      var isSuccess = toBoolean(value);
      loseScreen.rewardResult(isSuccess);
      return isSuccess;
    }

    function showLoseScreen() {
      loseScreen.setCoins(state.coinsCount);
      loseScreen.setHearts(state.heartsCount);
      loseScreen.show();
    }

    function hideLoseScreen() {
      loseScreen.hide();
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

    function showQuitScreen() {
      if (!quitScreen) {
        state.quitScreenVisible = true;
        return state.quitScreenVisible;
      }
      quitScreen.show();
      state.quitScreenVisible = quitScreen.getState().visible;
      return state.quitScreenVisible;
    }

    function hideQuitScreen() {
      if (!quitScreen) {
        state.quitScreenVisible = false;
        return state.quitScreenVisible;
      }
      quitScreen.hide();
      state.quitScreenVisible = quitScreen.getState().visible;
      return state.quitScreenVisible;
    }

    function complete() {
      var coins = encodeURIComponent(String(state.coinsCount));
      var hearts = encodeURIComponent(String(state.heartsCount));
      global.location.href = 'uniwebview://complete?coins=' + coins + '&hearts=' + hearts;
    }

    return {
      state: state,
      setCoins: setCoins,
      setHearts: setHearts,
      setTimeOutCoinsCost: setTimeOutCoinsCost,
      setSubscriptionStatus: setSubscriptionStatus,
      setMaxLives: setMaxLives,
      setLivesTimer: setLivesTimer,
      rewardResult: rewardResult,
      showLoseScreen: showLoseScreen,
      hideLoseScreen: hideLoseScreen,
      setLevel: setLevel,
      showMainHud: showMainHud,
      hideMainHud: hideMainHud,
      showQuitScreen: showQuitScreen,
      hideQuitScreen: hideQuitScreen,
      complete: complete
    };
  }

  function boot() {
    function continueAfterRewardMock() {
      // TODO: Replace with real game continuation flow.
      console.log('[mock] Continue game after rewarded ad');
    }

    function navigateClose(state) {
      var coins = encodeURIComponent(String(state.coinsCount));
      var hearts = encodeURIComponent(String(state.heartsCount));
      global.location.href = 'uniwebview://close?coins=' + coins + '&hearts=' + hearts;
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
      },
      onClose: function(state) {
        navigateClose(state);
      }
    });
    var quitScreen = typeof global.QuitScreen === 'function'
      ? new global.QuitScreen({
        stylesheetPath: './css/quit-screen.css',
        assetBasePath: './content/icons/quit',
        coins: loseScreen.getState().coinsCount,
        hearts: loseScreen.getState().heartsCount,
        onQuit: function(state) {
          navigateClose(state);
        }
      })
      : null;
    var mainHud = typeof global.MainHud === 'function'
      ? new global.MainHud({
        stylesheetPath: './css/main-hud.css',
        assetBasePath: './content/icons/game',
        level: 1,
        onBack: function() {
          if (!quitScreen) {
            global.location.href = 'uniwebview://back';
            return;
          }
          quitScreen.show();
        },
        onRestart: function() {
          global.location.href = 'uniwebview://restart';
        }
      })
      : null;
    var unityBridge = createUnityBridge(loseScreen, mainHud, quitScreen);
    var debugPanel = new global.DebugPanel({
      onWin: function() {
        unityBridge.complete();
      },
      onLose: function() {
        unityBridge.showLoseScreen();
      },
      onRestart: function() {
        unityBridge.hideLoseScreen();
        if (quitScreen) quitScreen.hide();
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
    global.setLivesTimer = unityBridge.setLivesTimer;
    global.rewardResult = unityBridge.rewardResult;
    global.showLoseScreen = unityBridge.showLoseScreen;
    global.hideLoseScreen = unityBridge.hideLoseScreen;
    global.setLevel = unityBridge.setLevel;
    global.showMainHud = unityBridge.showMainHud;
    global.hideMainHud = unityBridge.hideMainHud;
    global.showQuitScreen = unityBridge.showQuitScreen;
    global.hideQuitScreen = unityBridge.hideQuitScreen;
    global.complete = unityBridge.complete;

    global.unityState = unityBridge.state;
    global.unityBridge = unityBridge;
    global.loseScreen = loseScreen;
    global.quitScreen = quitScreen;
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
