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

var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';

var rAF = typeof requestAnimationFrame !== 'undefined'
    ? requestAnimationFrame
    : function(cb) { setTimeout(cb, 1000 / 60); };


function applyFacts(domNode, eventNode, facts)
{
  for (var key in facts)
  {
    var value = facts[key];

    switch (key)
    {
      case 'STYLE':
        applyStyles(domNode, value);
        break;

      case EVENT_KEY:
        applyEvents(domNode, eventNode, value);
        break;

      case ATTR_KEY:
        applyAttrs(domNode, value);
        break;

      default:
        domNode[key] = value;
        break;
    }
  }
}

function applyStyles(domNode, styles)
{
  var domNodeStyle = domNode.style;

  for (var key in styles)
  {
    domNodeStyle[key] = styles[key];
  }
}

function applyEvents(domNode, eventNode, events)
{
  var allHandlers = domNode.elm_handlers || {};

  for (var key in events)
  {
    var value = events[key];


      var handler = function eventHandler(event)
      {
        value(event);

        var currentEventNode = eventNode;
        while (currentEventNode)
        {
          currentEventNode.tagger();
          currentEventNode = currentEventNode.parent;
        }

      };
      domNode.addEventListener(key, handler);
      allHandlers[key] = handler;

  }

  domNode.elm_handlers = allHandlers;
}

function applyAttrs(domNode, attrs)
{
  for (var key in attrs)
  {
    var value = attrs[key];
    if (typeof value === 'undefined')
    {
      domNode.removeAttribute(key);
    }
    else
    {
      domNode.setAttribute(key, value);
    }
  }
}

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

let startAnimating =  function (value) {
        globalState = {
              isVisible: true,
              metrics: geometryDecoder(value),
            };
    }

let buttonAttrs = {
  className: "mdl-js-ripple-effect mdl-js-button mdl-button mdl-button--raised"
};
buttonAttrs[EVENT_KEY] = {
  mousedown : startAnimating,
  touchstart : startAnimating,
}
buttonAttrs[ATTR_KEY] = {
  onmouseup : blurHack,
  onmouseleave : blurHack,
  ontouchend : blurHack,
}

let returnUp = function(){return {ctor: 'Up'}}

let span1Attrs = {};
span1Attrs[EVENT_KEY] = {
  blur: returnUp,
  touchcancel: returnUp,
}

var toPx = function (k) {
  return Math.round(k) + 'px';
};


let getSpan2Attrs = function(isVisible, metrics) {
  var stylingA;

    if (metrics.ctor === 'Just') {
      var m = metrics._0
      var r = m.rect;

      var offset = 'translate(' + toPx(m.x) + ', ' + toPx(m.y) + ')';
      var rippleSize = toPx(
        (Math.sqrt((r.width * r.width) + (r.height * r.height)) * 2.0) + 2.0);
      var scale = isVisible ? 'scale(0.0001, 0.0001)' : '';
      var transformString = 'translate(-50%, -50%) ' + offset + scale;
      stylingA = {
          width : rippleSize,
          height : rippleSize,
          "-webkit-transform" : transformString,
          "-ms-transform" : transformString,
          transform : transformString,
        };
    } else {
        stylingA = {};
    }

  var span2ClassName = 'mdl-ripple'
  if (isVisible) {
    span2ClassName += ' is-visible'
  } else {
    span2ClassName += ' is-animating'
  }

  return {
   className: span2ClassName,
   STYLE: stylingA
 }

}


var Elm = {};
Elm.ChangeMe = Elm.ChangeMe || {};


var globalState;

function embed(rootDomNode)
{
  try
  {
    globalState = {};


    var eventNode = {
      tagger: function (){

          rAF(updateEvenIfNotNeeded);

         },
      };

    var button = document.createElement('button');

    applyFacts(button, eventNode, buttonAttrs);

    button.appendChild(document.createTextNode( 'a test Button with a long label'));

    var subEventRoot = {
      tagger: function () {
              globalState.isVisible = false
          },
      parent: eventNode
    };

    var span1 = document.createElement('span');

    applyFacts(span1, subEventRoot, span1Attrs);

    var span2 = document.createElement('span');

    applyFacts(span2, undefined, getSpan2Attrs(false, {}));

    span1.appendChild(span2);
    button.appendChild(span1);

    rootDomNode.appendChild(button);

    function updateEvenIfNotNeeded()
    {
        var b = getSpan2Attrs(globalState.isVisible, globalState.metrics)

        applyFacts(span2, undefined, b);

    }

    return {};
  }
  catch (e)
  {
    rootDomNode.innerHTML = errorHtml(e.message);
    throw e;
  }
}

Elm.ChangeMe.embed = embed
