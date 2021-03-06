/*!
 * VIZABI DIALOG
 * Reusable Dialog component
 */

(function () {

  "use strict";

  var root = this;
  var Vizabi = root.Vizabi;
  var utils = Vizabi.utils;
  var iconset = Vizabi.iconset;

  //warn client if d3 is not defined
  if (!Vizabi._require('d3')) {
    return;
  }

  Vizabi.Component.extend('gapminder-buttonlist-dialog', {
    /**
     * Initializes the dialog
     * @param {Object} config Initial config, with name and placeholder
     * @param {Object} parent Reference to tool
     */
    init: function (config, parent) {
      this.name = this.name || '';

      this.model_expects = this.model_expects || [{
          name: "state",
          type: "model"
        }, {
          name: "ui",
          type: "model"
        }, {
          name: "language",
          type: "language"
        }];

      this.template = 'src/components/_gapminder/buttonlist/' +
        'dialogs/' + this.name + '/' + this.name + '.html';

      this._super(config, parent);
    },

    /**
     * Executed when the dialog has been rendered
     */
    readyOnce: function () {
      this.element = d3.select(this.element);
    },

    ready: function () {
      var _this = this;
      this.placeholderEl = d3.select(this.placeholder);
      this.rootEl = d3.select(this.root.element);
      this.dragHandler = this.placeholderEl.select("[data-click='dragDialog']");
      this.dragHandler.html(iconset['drag']);

      var dg = dialogDrag(this.placeholderEl, d3.select('.vzb-tool-content'), 75);
      var dragBehavior = d3.behavior.drag()
        .on('dragstart', function D3dialogDragStart() {
          if (_this.rootEl.classed('vzb-portrait') || _this.isPin)
            return;
          dg.dragStart(d3.event);
        })
        .on('drag', function D3dialogDrag() {
          if (_this.rootEl.classed('vzb-portrait') || _this.isPin)
            return;
          dg.drag(d3.event);
        });
      this.dragHandler.call(dragBehavior);
    },

    resize: function () {
      if (this.placeholderEl) {
        var chartWidth = -parseInt(this.parent.parent.components[0].width, 10);
        var dialogLeft = parseInt(this.placeholderEl.style('left'), 10);
        if (utils.isNumber(dialogLeft) && dialogLeft < chartWidth) {
          this.placeholderEl.style('left', chartWidth + 'px');
          if (this.leftPos) {
            this.leftPos = chartWidth + 'px';
          }
        }
        if (this.rootEl.classed('vzb-portrait')) {
          this.leftPos = null;
          this.topPos = null;
          this.placeholderEl.attr('style', '');
        }
      }
    },

    beforeOpen: function () {
      var _this = this;

      this.transitionEvents = ['webkitTransitionEnd', 'transitionend', 'msTransitionEnd', 'oTransitionEnd'];
      this.transitionEvents.forEach(function (event) {
        _this.placeholderEl.on(event, _this.transitionEnd.bind(_this, event));
      });
      if (this.leftPos && !this.rootEl.classed('vzb-portrait')) {
        this.placeholderEl.style('left', this.leftPos);
      }
      if (this.rootEl.classed('vzb-portrait')) {
        this.placeholderEl.style('top', ''); // issues: 369 & 442
      }
    },

    /**
     * User has clicked to open this dialog
     */
    open: function () {
      this.isOpen = true;
      if (this.topPos && !this.rootEl.classed('vzb-portrait')) {
        this.placeholderEl.style('top', this.topPos);
      }
    },

    beforeClose: function () {
      if (this.rootEl.classed('vzb-portrait')) {
        this.placeholderEl.style('top', 'auto'); // issues: 369 & 442
      }
      this.placeholderEl.classed('notransition', false);
      this.placeholderEl.node().offsetHeight; // trigger a reflow (flushing the css changes)
    },

    /**
     * User has closed this dialog
     */
    close: function () {
      if (this.isOpen || !this.rootEl.classed('vzb-portrait')) {
        this.leftPos = this.placeholderEl.style('left');
        this.topPos = this.placeholderEl.style('top');
      }
      if (!this.rootEl.classed('vzb-portrait')) {
        this.placeholderEl.style('top', ''); // issues: 369 & 442
      }
      this.isOpen = false;
    },


    transitionEnd: function (eventName) {
      var _this = this;

      this.transitionEvents.forEach(function (event) {
        _this.placeholderEl.on(event, null);
      });
      this.placeholderEl.classed('notransition', true);
    }

  });

}).call(this);

function dialogDrag(element, container, xOffset) {
  var posX, posY, divTop, divLeft, eWi, eHe, cWi, cHe, diffX, diffY;

  return {
    move: function (x, y) {
      element.style('left', x + 'px');
      element.style('top', y + 'px');
    },

    dragStart: function (evt) {
      posX = evt.sourceEvent.clientX;
      posY = evt.sourceEvent.clientY;
      divTop = parseInt(element.style('top')) || 0;
      divLeft = parseInt(element.style('left')) || 0;
      eWi = parseInt(element.style('width'));
      eHe = parseInt(element.style('height'));
      cWi = parseInt(container.style('width')) + xOffset;
      cHe = parseInt(container.style('height'));
      diffX = posX - divLeft;
      diffY = posY - divTop;
    },

    drag: function(evt) {
      var posX = evt.sourceEvent.clientX,
        posY = evt.sourceEvent.clientY,
        aX = posX - diffX,
        aY = posY - diffY;
      if (aX > -xOffset) aX = -xOffset;
      if (aY < 0) aY = 0;
      if (-aX + eWi > cWi) aX = -cWi + eWi;
      if (eHe + aY > cHe) aY = cHe - eHe;

      this.move(aX, aY);
    }
  }
}
