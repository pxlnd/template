(function(global) {
  'use strict';

  function DebugPanel(options) {
    var opts = options || {};
    this.mountNode = opts.mount && opts.mount.nodeType === 1 ? opts.mount : document.body;
    this.handlers = {
      onWin: opts.onWin,
      onLose: opts.onLose,
      onRestart: opts.onRestart
    };
    this.visible = false;
    this.root = this._createMarkup();
    this.mountNode.appendChild(this.root);
    this.refs = this._collectRefs();
    this._bindEvents();
  }

  DebugPanel.prototype._createMarkup = function() {
    var container = document.createElement('section');
    container.className = 'debug-panel';
    container.setAttribute('aria-hidden', 'true');
    container.setAttribute('aria-label', 'Debug panel');

    container.innerHTML = [
      '<div class="debug-panel__title">Debug</div>',
      '<div class="debug-panel__actions">',
      '<button type="button" class="debug-panel__button">Победа</button>',
      '<button type="button" class="debug-panel__button">Проигрыш</button>',
      '<button type="button" class="debug-panel__button">Рестарт</button>',
      '</div>'
    ].join('');

    return container;
  };

  DebugPanel.prototype._collectRefs = function() {
    var buttons = this.root.querySelectorAll('.debug-panel__button');
    return {
      winButton: buttons[0] || null,
      loseButton: buttons[1] || null,
      restartButton: buttons[2] || null
    };
  };

  DebugPanel.prototype._emit = function(name) {
    var cb = this.handlers[name];
    if (typeof cb !== 'function') return;
    cb();
  };

  DebugPanel.prototype._bindEvents = function() {
    var scope = this;

    if (this.refs.winButton) {
      this.refs.winButton.addEventListener('click', function() {
        scope._emit('onWin');
      });
    }

    if (this.refs.loseButton) {
      this.refs.loseButton.addEventListener('click', function() {
        scope._emit('onLose');
      });
    }

    if (this.refs.restartButton) {
      this.refs.restartButton.addEventListener('click', function() {
        scope._emit('onRestart');
      });
    }
  };

  DebugPanel.prototype.show = function() {
    this.visible = true;
    this.root.classList.add('is-visible');
    this.root.setAttribute('aria-hidden', 'false');
  };

  DebugPanel.prototype.hide = function() {
    this.visible = false;
    this.root.classList.remove('is-visible');
    this.root.setAttribute('aria-hidden', 'true');
  };

  DebugPanel.prototype.toggle = function() {
    if (this.visible) {
      this.hide();
      return;
    }
    this.show();
  };

  DebugPanel.prototype.destroy = function() {
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
  };

  global.DebugPanel = DebugPanel;
})(window);
