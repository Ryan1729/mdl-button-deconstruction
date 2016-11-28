'use strict';

var _elm_lang$core$Maybe$Just = function (a) {
  return {ctor: 'Just', _0: a};
};

function errorHtml(message)
{
  return '<div style="padding-left:1em;">'
    + '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
    + '<pre style="padding-left:1em;">' + message + '</pre>'
    + '</div>';
}

var rAF = typeof requestAnimationFrame !== 'undefined'
    ? requestAnimationFrame
    : function(cb) { setTimeout(cb, 1000 / 60); };

let touchesX = function (e) {
  if(e.touches == null) {
    return undefined
  }
  return e.touches[0].clientX
}
let touchesY = function (e) {
  if(e.touches == null) {
    return undefined
  }
  return e.touches[0].clientY
}

var geometryDecoder = function (g) {
  var rect = g.currentTarget.getBoundingClientRect();

  var set = function (x, y) {
      return _elm_lang$core$Maybe$Just(
        {rect: rect, x: x - rect.left, y: y - rect.top});
    };

  if ((g.clientX == null) || (g.clientY == null)) {
    if ((touchesX(g) == null) || (touchesY(g) == null)) {
      return {ctor: 'Nothing'};
    } else {
      return set(g.touchX, g.touchY);
    }
  } else {
    if ((g.clientX === 0.0) && (g.clientY === 0.0)) {
      return _elm_lang$core$Maybe$Just(
        {rect: rect, x: rect.width / 2.0, y: rect.height / 2.0});
    } else {
      return set(g.clientX, g.clientY);
    }
  }
};

let blurHack = 'this.blur(); (function(self) { var e = document.createEvent(\'Event\'); e.initEvent(\'touchcancel\', true, true); self.lastChild.dispatchEvent(e); }(this));'



var Elm = {};
Elm.ChangeMe = Elm.ChangeMe || {};


var globalState;

function embed(rootDomNode)
{
  try
  {
    globalState = {
          isVisible: false,
          metrics: {},
        };

    var button = document.createElement('button');

    // button.setAttribute('onmouseup', blurHack);


    button.className =  "mdl-js-ripple-effect mdl-js-button mdl-button mdl-button--raised"

    let startAnimating =  function (value) {
            globalState = {
                  isVisible: true,
                  metrics: geometryDecoder(value),
                };
        }



    var ripple = function () {
      button.blur();

      var e = document.createEvent('Event');
      e.initEvent('touchcancel', true, true);
      button.lastChild.dispatchEvent(e);

    }
    button.addEventListener('mouseup', ripple);
    button.addEventListener('mouseleave', ripple);
    button.addEventListener('ontouchend', ripple);

    var buttonHandler = function eventHandler(event)
    {
      globalState = {
            isVisible: true,
            metrics: geometryDecoder(event),
          };
      rAF(updateEvenIfNotNeeded);
    };

    button.addEventListener('mousedown', buttonHandler);
    button.addEventListener('touchstart', buttonHandler);

    button.appendChild(document.createTextNode( 'a test Button with a long label'));

    var span1 = document.createElement('span');

    var span1Handler = function eventHandler(event)
    {
      globalState.isVisible = false
      rAF(updateEvenIfNotNeeded);
    };
    span1.addEventListener('blur', span1Handler);
    span1.addEventListener('touchcancel', span1Handler);


    var span2 = document.createElement('span');

    span1.appendChild(span2);
    button.appendChild(span1);

    rootDomNode.appendChild(button);


    var toPx = function (k) {
      return Math.round(k) + 'px';
    };

    function updateEvenIfNotNeeded()
    {
        if (globalState.metrics.ctor === 'Just') {
          var m = globalState.metrics._0
          var r = m.rect;

          var offset = 'translate(' + toPx(m.x) + ', ' + toPx(m.y) + ')';
          var rippleSize = toPx(
            (Math.sqrt((r.width * r.width) + (r.height * r.height)) * 2.0) + 2.0);
          var scale = globalState.isVisible ? 'scale(0.0001, 0.0001)' : '';
          var transformString = 'translate(-50%, -50%) ' + offset + scale;

          var span2Style = span2.style


          span2Style.width = rippleSize
          span2Style.height = rippleSize
          span2Style['-webkit-transform'] = transformString
          span2Style['-ms-transform'] = transformString
          span2Style.transform = transformString

        }

        span2.className = 'mdl-ripple'
        if (globalState.isVisible) {
          span2.className += ' is-visible'
        } else {
          span2.className += ' is-animating'
        }

    }

    updateEvenIfNotNeeded()
    return {};
  }
  catch (e)
  {
    rootDomNode.innerHTML = errorHtml(e.message);
    throw e;
  }
}

Elm.ChangeMe.embed = embed
