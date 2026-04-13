(function(global) {
  'use strict';

  function isTypingTarget(target) {
    if (!target) return false;
    var tagName = (target.tagName || '').toLowerCase();
    return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
  }

  function DebugHotkeyController(options) {
    var opts = options || {};
    this.debugPanel = opts.debugPanel || null;
    this._onKeydown = this._onKeydown.bind(this);
  }

  DebugHotkeyController.prototype._onKeydown = function(event) {
    if (!this.debugPanel) return;
    if (event.repeat) return;
    if (isTypingTarget(event.target)) return;
    if (event.code !== 'Space') return;

    event.preventDefault();
    this.debugPanel.toggle();
  };

  DebugHotkeyController.prototype.start = function() {
    document.addEventListener('keydown', this._onKeydown);
  };

  DebugHotkeyController.prototype.stop = function() {
    document.removeEventListener('keydown', this._onKeydown);
  };

  global.DebugHotkeyController = DebugHotkeyController;
})(window);
