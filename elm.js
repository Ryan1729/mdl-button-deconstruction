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

// PROGRAM SUCCESS

let succeed = {
    ctor: '_Task_succeed',
  };


function andThen(task)
{
  return {
    ctor: '_Task_andThen',
    task: task,
    callback: loop
  };
}


var MAX_STEPS = 10000;

function nativeBinding(callback)
{
  return {
    ctor: '_Task_nativeBinding',
    callback: callback,
    cancel: null
  };
}

// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue()
{
  workQueue.push(globalState);

  if (!working)
  {
    setTimeout(work, 0);
    working = true;
  }
}

var numSteps = 0;
function work()
{
  var process;
  while (numSteps < MAX_STEPS && (process = workQueue.shift()))
  {
    if (process.root)
    {

      while (numSteps < MAX_STEPS)
      {
        var ctor = globalState.root.ctor;

        if (ctor === '_Task_succeed')
        {

          if (globalState.stack === null)
          {
            break;
          }
          globalState.root = globalState.stack.callback(globalState.model);
          globalState.stack = globalState.stack.rest;
          ++numSteps;
          continue;
        }

        if (ctor === '_Task_andThen')
        {
          globalState.stack = {
            ctor: '_Task_andThen',
            callback: globalState.root.callback,
            rest: globalState.stack
          };
          globalState.root = globalState.root.task;
          ++numSteps;
          continue;
        }

        if (ctor === '_Task_nativeBinding')
        {
          globalState.root.cancel = globalState.root.callback(function(newRoot) {
            globalState.root = newRoot;
            enqueue();
          });

          break;
        }

        if (ctor === '_Task_receive')
        {
          if (globalState.mailbox.length === 0)
          {
            break;
          }

          globalState.root = globalState.root.callback(globalState.mailbox.shift());
          ++numSteps;
          continue;
        }

        throw new Error(ctor);
      }

      if (numSteps < MAX_STEPS)
      {
        numSteps += 1;
      } else {
        enqueue();
      }
    }
  }
  if (!process)
  {
    working = false;
    return;
  }
  setTimeout(work, 0);
}


var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';



////////////  RENDERER  ////////////

function renderer(parent, initialVirtualNode)
{
  var eventNode = { tagger: function (msg){
      globalState.mailbox.push(msg);
      enqueue(); }, parent: undefined };

  var domNode = render(initialVirtualNode, eventNode);
  parent.appendChild(domNode);

  var state = 'NO_REQUEST';
  var currentVirtualNode = initialVirtualNode;
  var nextVirtualNode = initialVirtualNode;



  function updateIfNeeded()
  {
    if (state === 'PENDING_REQUEST')
    {
        rAF(updateIfNeeded);
        state = 'NO_REQUEST';

        var patches = diff(currentVirtualNode, nextVirtualNode);
        if (patches.length !== 0)
        {
          addDomNodes(domNode, currentVirtualNode, patches);
          for (var i = 0; i < patches.length; i++)
          {
            var patch = patches[i];
            applyFacts(patch.domNode, patch.eventNode, patch.data);
          }
        }
        currentVirtualNode = nextVirtualNode;
    }
  }

  return function (vNode)
      {
        if (state === 'NO_REQUEST')
        {
          rAF(updateIfNeeded);
        }
        state = 'PENDING_REQUEST';
        nextVirtualNode = vNode;
      }

}


var rAF = typeof requestAnimationFrame !== 'undefined'
    ? requestAnimationFrame
    : function(cb) { setTimeout(cb, 1000 / 60); };



////////////  RENDER  ////////////


function render(vNode, eventNode)
{
  switch (vNode.type)
  {
    case 'tagger':
      var subNode = vNode.node;

      var subEventRoot = {
        tagger: viewLift,
        parent: eventNode
      };

      return render(subNode, subEventRoot);

    case 'text':
      return document.createTextNode(vNode.text);

    case 'node':
      var domNode = document.createElement(vNode.tag);

      applyFacts(domNode, eventNode, vNode.facts);

      var children = vNode.children;

      for (var i = 0; i < children.length; i++)
      {
        domNode.appendChild(render(children[i], eventNode));
      }

      return domNode;

  }
}



////////////  APPLY FACTS  ////////////


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
    var handler = allHandlers[key];
    var value = events[key];

    if (typeof value === 'undefined')
    {
      domNode.removeEventListener(key, handler);
      allHandlers[key] = undefined;
    }
    else if (typeof handler === 'undefined')
    {
      var handler = function eventHandler(event)
      {
        var message = value(event);

        var currentEventNode = eventNode;
        while (currentEventNode)
        {
          message = currentEventNode.tagger(message);
          currentEventNode = currentEventNode.parent;
        }

      };
      domNode.addEventListener(key, handler);
      allHandlers[key] = handler;
    }
    else
    {
      handler.info = value;
    }
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

////////////  DIFF  ////////////


function diff(a, b)
{
  var patches = [];
  diffHelp(a, b, patches, 0);
  return patches;
}


function makePatch(index, data)
{
  return {
    index: index,
    data: data,
    domNode: undefined,
    eventNode: undefined
  };
}


function diffHelp(a, b, patches, index)
{
  if (a === b)
  {
    return;
  }

  switch (b.type)
  {
    case 'tagger':
      // gather nested taggers
      var aSubNode = a.node;

      var bSubNode = b.node;


      // diff everything below the taggers
      diffHelp(aSubNode, bSubNode, patches, index + 1);
      return;

    case 'node':

      var factsDiff = diffFacts(a.facts, b.facts);

      if (typeof factsDiff !== 'undefined')
      {
        patches.push(makePatch(index, factsDiff));
      }

      var aChildren = a.children;
      var bChildren = b.children;

      var aLen = aChildren.length;
      var bLen = bChildren.length;

      // PAIRWISE DIFF EVERYTHING ELSE
      var minLen = aLen < bLen ? aLen : bLen;
      for (var i = 0; i < minLen; i++)
      {
        index++;
        var aChild = aChildren[i];
        diffHelp(aChild, bChildren[i], patches, index);
        index += aChild.descendantsCount || 0;
      }
      return;
  }
}

function diffFacts(a, b, category)
{
  var diff;

  // look for changes and removals
  for (var aKey in a)
  {
    if (aKey === 'STYLE' || aKey === EVENT_KEY || aKey === ATTR_KEY)
    {
      var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
      if (subDiff)
      {
        diff = diff || {};
        diff[aKey] = subDiff;
      }
      continue;
    }

    // remove if not in the new facts
    if (!(aKey in b))
    {
      diff = diff || {};
      diff[aKey] =
        (typeof category === 'undefined')
          ? (typeof a[aKey] === 'string' ? '' : null)
          :
        (category === 'STYLE')
          ? ''
          :
        (category === EVENT_KEY || category === ATTR_KEY)
          ? undefined
          :
        { value: undefined };

      continue;
    }

    var bValue = b[aKey];

    diff = diff || {};
    diff[aKey] = bValue;
  }

  // add new stuff
  for (var bKey in b)
  {
    if (!(bKey in a))
    {
      diff = diff || {};
      diff[bKey] = b[bKey];
    }
  }

  return diff;
}


////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches)
{
  addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high)
{
  var patch = patches[i];
  var index = patch.index;

  while (index === low)
  {
    patch.domNode = domNode;

    i++;

    if (!(patch = patches[i]) || (index = patch.index) > high)
    {
      return i;
    }
  }

  switch (vNode.type)
  {
    case 'tagger':
      var subNode = vNode.node;

      while (subNode.type === "tagger")
      {
        subNode = subNode.node;
      }

      return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high);

    case 'node':
      var vChildren = vNode.children;
      var childNodes = domNode.childNodes;
      for (var j = 0; j < vChildren.length; j++)
      {
        low++;
        var vChild = vChildren[j];
        var nextLow = low + (vChild.descendantsCount || 0);
        if (low <= index && index <= nextLow)
        {
          i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow);
          if (!(patch = patches[i]) || (index = patch.index) > high)
          {
            return i;
          }
        }
        low = nextLow;
      }
      return i;


    case 'text':
      throw new Error('should never traverse `text` or `thunk` nodes like this');
  }
}

function node(tag)
{
  return function(facts, children) {
    var descendantsCount = 0;
    var i;
    var kid;
    for (i = 0; i < children.length; i += 1) {
      kid = children[i]
      descendantsCount += (kid.descendantsCount || 0);
    }
    descendantsCount += children.length;

    return {
      type: 'node',
      tag: tag,
      facts: facts,
      children: children,
      descendantsCount: descendantsCount
    };
  };
}

var button = node('button')
var span = node('span');

var toPx = function (k) {
  return Math.round(k) + 'px';
};

var _debois$elm_mdl$Material_Ripple$computeMetrics = function (g) {
  var rect = g.rect;

  var set = function (x, y) {
      return _elm_lang$core$Maybe$Just(
        {rect: rect, x: x - rect.left, y: y - rect.top});
    };

  if ((g.clientX == null) || (g.clientY == null)) {
    if ((g.touchX == null) || (g.touchY == null)) {
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

var geometryDecoder =
function (e) {
  return {
    rect: e.currentTarget.getBoundingClientRect(),
    clientX: e.clientX,
    clientY: e.clientY,
    touchX: touchesX(e),
    touchY: touchesY(e),
    type$: e.type};
}

var viewLift = function (msg) {
        return function () {
                var model = globalState.model._0 || {isVisible: false, metrics: {ctor: "viewLift metrics"}}
                if (msg.ctor === 'Down') {
                    globalState.model._0 = {
                          isVisible: true,
                          metrics: _debois$elm_mdl$Material_Ripple$computeMetrics(msg._0),
                        };
                } else {
                    globalState.model._0 =  {
                      isVisible : false,
                      metrics : model.metrics,
                    }
                }
                return  globalState.model
        }
    }


let blurHack = 'this.blur(); (function(self) { var e = document.createEvent(\'Event\'); e.initEvent(\'touchcancel\', true, true); self.lastChild.dispatchEvent(e); }(this));'

let startAnimating = function (value) {
  return viewLift({ctor: 'Down', _0: geometryDecoder(value)});
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

var view =  function () {
  var model = globalState.model._0 || {isVisible: false, metrics: {ctor: "metrics"}}

  var node =
   span(span1Attrs,[
       span(getSpan2Attrs(model.isVisible, model.metrics),[])
     ]);

  return button(buttonAttrs,
            [
             {
                  type: 'text',
                  text: 'a test Button with a long label'
              },
            {
                type: 'tagger',
                node: node,
                descendantsCount: 1 + (node.descendantsCount || 0)
            }
          ]
        );

};

var globalState;

// ambient state
var ambient;

function loop()
{
  var handleMsg = {
    ctor: '_Task_receive',
    callback: function(msg) {
      return nativeBinding(function(callback) {
        msg()

        ambient(view());
        callback(succeed);
      });
    }
  };
  return andThen(handleMsg);
}

function embed(rootDomNode)
{
  try
  {
    var initApp = nativeBinding(function(callback) {
      ambient = renderer(rootDomNode, view());
      callback(succeed);
    });

    globalState = {
      ctor: '_Process',
      root: andThen(initApp),
      stack: null,
      mailbox: [],
      model: {ctor: 'Model'}
    };

    enqueue();

    return {};
  }
  catch (e)
  {
    rootDomNode.innerHTML = errorHtml(e.message);
    throw e;
  }
}

Elm.ChangeMe.embed = embed
