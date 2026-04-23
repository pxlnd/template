(function(global) {
  'use strict';

  function joinUrl(base, file) {
    if (!file) return base;
    if (/^(?:https?:)?\/\//i.test(file) || file.indexOf('data:') === 0 || file.charAt(0) === '/') {
      return file;
    }
    var normalized = String(base || './assets').replace(/\/+$/, '');
    return normalized + '/' + String(file).replace(/^\/+/, '');
  }

  function resolveScriptBase(scriptFileName) {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i -= 1) {
      var src = scripts[i].getAttribute('src') || '';
      if (!src) continue;
      if (src.indexOf(scriptFileName) !== -1) {
        var idx = src.lastIndexOf('/');
        return idx >= 0 ? src.slice(0, idx + 1) : './';
      }
    }
    return './';
  }

  function ensureStylesheet(href) {
    if (!href) return;
    if (document.querySelector('link[data-main-hud-style="1"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-main-hud-style', '1');
    document.head.appendChild(link);
  }

  function normalizeLevel(value) {
    var parsed = parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return 1;
    return parsed;
  }

  function toAbsoluteUrl(value) {
    try {
      return new URL(String(value || ''), global.location.href).href;
    } catch (error) {
      return value;
    }
  }

  function MainHud(options) {
    var opts = options || {};
    this._scriptBase = resolveScriptBase('main-hud.js');
    this.assetBasePath = opts.assetBasePath || joinUrl(this._scriptBase.replace(/\/$/, ''), 'assets');
    this.stylesheetPath = opts.stylesheetPath || joinUrl(this._scriptBase.replace(/\/$/, ''), 'main-hud.css');
    this.injectStyles = opts.injectStyles !== false;

    this.handlers = {
      onBack: opts.onBack,
      onRestart: opts.onRestart,
      onStateChange: opts.onStateChange
    };

    this.state = {
      level: normalizeLevel(opts.level),
      visible: opts.visible !== false
    };

    if (this.injectStyles) ensureStylesheet(this.stylesheetPath);

    this.mountNode = opts.mount && opts.mount.nodeType === 1 ? opts.mount : document.body;
    this.root = this._createMarkup();
    this.mountNode.appendChild(this.root);

    this.refs = this._collectRefs();
    this._applyAssetUrls();
    this._bindEvents();
    this._renderAll();
  }

  MainHud.prototype._createMarkup = function() {
    var container = document.createElement('div');
    container.className = 'mh-hud-top';
    container.innerHTML = [
      '<div class="mh-hud-main">',
      '<button type="button" class="mh-icon-btn mh-back-btn" aria-label="Back">Back</button>',
      '<div class="mh-level-panel" aria-live="polite">',
      '<span class="mh-badge-caption">Level</span>',
      '<span class="mh-badge-value">1</span>',
      '</div>',
      '<button type="button" class="mh-icon-btn mh-icon-btn-restart" aria-label="Restart">Restart</button>',
      '</div>'
    ].join('');
    return container;
  };

  MainHud.prototype._collectRefs = function() {
    return {
      levelValue: this.root.querySelector('.mh-badge-value'),
      backButton: this.root.querySelector('.mh-back-btn'),
      restartButton: this.root.querySelector('.mh-icon-btn-restart')
    };
  };

  MainHud.prototype._applyAssetUrls = function() {
    var backIcon = toAbsoluteUrl(joinUrl(this.assetBasePath, 'back_button.png'));
    var restartIcon = toAbsoluteUrl(joinUrl(this.assetBasePath, 'restart_button.png'));

    this.root.style.setProperty('--mh-back-icon', "url('" + backIcon + "')");
    this.root.style.setProperty('--mh-restart-icon', "url('" + restartIcon + "')");

    if (this.refs && this.refs.backButton && this.refs.restartButton) {
      this.refs.backButton.style.backgroundImage = "url('" + backIcon + "')";
      this.refs.restartButton.style.backgroundImage = "url('" + restartIcon + "')";
    }
  };

  MainHud.prototype._emit = function(name, payload) {
    var cb = this.handlers[name];
    if (typeof cb !== 'function') return undefined;
    try {
      return cb(payload, this);
    } catch (error) {
      setTimeout(function() {
        throw error;
      }, 0);
      return undefined;
    }
  };

  MainHud.prototype._notifyStateChange = function() {
    this._emit('onStateChange', this.getState());
  };

  MainHud.prototype._bindEvents = function() {
    var scope = this;
    this.refs.backButton.addEventListener('click', function() {
      scope._emit('onBack', scope.getState());
    });
    this.refs.restartButton.addEventListener('click', function() {
      scope._emit('onRestart', scope.getState());
    });
  };

  MainHud.prototype._renderLevel = function() {
    this.refs.levelValue.textContent = String(this.state.level);
  };

  MainHud.prototype._renderVisible = function() {
    this.root.style.display = this.state.visible ? '' : 'none';
  };

  MainHud.prototype._renderAll = function() {
    this._renderLevel();
    this._renderVisible();
  };

  MainHud.prototype.setLevel = function(value) {
    var nextLevel = normalizeLevel(value);
    if (nextLevel === this.state.level) return this;
    this.state.level = nextLevel;
    this._renderLevel();
    this._notifyStateChange();
    return this;
  };

  MainHud.prototype.show = function() {
    if (this.state.visible) return this;
    this.state.visible = true;
    this._renderVisible();
    this._notifyStateChange();
    return this;
  };

  MainHud.prototype.hide = function() {
    if (!this.state.visible) return this;
    this.state.visible = false;
    this._renderVisible();
    this._notifyStateChange();
    return this;
  };

  MainHud.prototype.setHandlers = function(handlers) {
    var next = handlers || {};
    if (Object.prototype.hasOwnProperty.call(next, 'onBack')) this.handlers.onBack = next.onBack;
    if (Object.prototype.hasOwnProperty.call(next, 'onRestart')) this.handlers.onRestart = next.onRestart;
    if (Object.prototype.hasOwnProperty.call(next, 'onStateChange')) this.handlers.onStateChange = next.onStateChange;
    return this;
  };

  MainHud.prototype.getState = function() {
    return {
      level: this.state.level,
      visible: this.state.visible
    };
  };

  MainHud.prototype.destroy = function() {
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
    this.refs = null;
  };

  global.MainHud = MainHud;
})(window);
