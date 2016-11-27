
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}


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

function makeEmbed(main)
{
  return function embed(rootDomNode)
  {
    try
    {
      main.renderer = renderer
      return makeEmbedHelp(main, rootDomNode);
    }
    catch (e)
    {
      rootDomNode.innerHTML = errorHtml(e.message);
      throw e;
    }
  };
}

// SETUP RUNTIME SYSTEM

function makeEmbedHelp(program, rootDomNode)
{
  var init = program.init;
  var update = program.update;
  var view = program.view;
  var makeRenderer = program.renderer;

  // ambient state
  var renderer;

  // init and update state in main process
  var initApp = nativeBinding(function(callback) {
    var model = init();
    renderer = makeRenderer(rootDomNode, enqueue, view(model));
    callback(succeed(model));
  });

  function onMessage(msg, model)
  {
    return nativeBinding(function(callback) {
      model = A2(update, msg, model);
      renderer.update(view(model));
      callback(succeed(model));
    });
  }

  var mainProcess = spawnLoop(initApp, onMessage);

  function enqueue(msg)
  {
    rawSend(mainProcess, msg);
  }

  return {};
}



// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{

  function loop(state)
  {
    var handleMsg = receive(function(msg) {
      return onMessage(msg, state);
    });
    return A2(andThen, handleMsg, loop);
  }

  var task = A2(andThen, init, loop);

  return rawSpawn(task);
}


function succeed(value)
{
  return {
    ctor: '_Task_succeed',
    value: value
  };
}



function andThen(task, callback)
{
  return {
    ctor: '_Task_andThen',
    task: task,
    callback: callback
  };
}

andThen = F2(andThen)


var MAX_STEPS = 10000;

function nativeBinding(callback)
{
  return {
    ctor: '_Task_nativeBinding',
    callback: callback,
    cancel: null
  };
}

function receive(callback)
{
  return {
    ctor: '_Task_receive',
    callback: callback
  };
}


// PROCESSES

function rawSpawn(task)
{
  var process = {
    ctor: '_Process',
    root: task,
    stack: null,
    mailbox: []
  };

  enqueue(process);

  return process;
}

function rawSend(process, msg)
{
  process.mailbox.push(msg);
  enqueue(process);
}

// STEP PROCESSES

function step(numSteps, process)
{
  while (numSteps < MAX_STEPS)
  {
    var ctor = process.root.ctor;

    if (ctor === '_Task_succeed')
    {

      if (process.stack === null)
      {
        break;
      }
      process.root = process.stack.callback(process.root.value);
      process.stack = process.stack.rest;
      ++numSteps;
      continue;
    }

    if (ctor === '_Task_andThen')
    {
      process.stack = {
        ctor: '_Task_andThen',
        callback: process.root.callback,
        rest: process.stack
      };
      process.root = process.root.task;
      ++numSteps;
      continue;
    }

    if (ctor === '_Task_nativeBinding')
    {
      process.root.cancel = process.root.callback(function(newRoot) {
        process.root = newRoot;
        enqueue(process);
      });

      break;
    }

    if (ctor === '_Task_receive')
    {
      var mailbox = process.mailbox;
      if (mailbox.length === 0)
      {
        break;
      }

      process.root = process.root.callback(mailbox.shift());
      ++numSteps;
      continue;
    }

    throw new Error(ctor);
  }

  if (numSteps < MAX_STEPS)
  {
    return numSteps + 1;
  }
  enqueue(process);

  return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
  workQueue.push(process);

  if (!working)
  {
    setTimeout(work, 0);
    working = true;
  }
}

function work()
{
  var numSteps = 0;
  var process;
  while (numSteps < MAX_STEPS && (process = workQueue.shift()))
  {
    if (process.root)
    {
      numSteps = step(numSteps, process);
    }
  }
  if (!process)
  {
    working = false;
    return;
  }
  setTimeout(work, 0);
}
// DECODE




var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';



////////////  RENDERER  ////////////

function renderer(parent, tagger, initialVirtualNode)
{
  var eventNode = { tagger: tagger, parent: undefined };

  var domNode = render(initialVirtualNode, eventNode);
  parent.appendChild(domNode);

  var state = 'NO_REQUEST';
  var currentVirtualNode = initialVirtualNode;
  var nextVirtualNode = initialVirtualNode;

  function registerVirtualNode(vNode)
  {
    if (state === 'NO_REQUEST')
    {
      rAF(updateIfNeeded);
    }
    state = 'PENDING_REQUEST';
    nextVirtualNode = vNode;
  }

  function updateIfNeeded()
  {
    switch (state)
    {

      case 'PENDING_REQUEST':
        rAF(updateIfNeeded);
        state = 'NO_REQUEST';

        var patches = diff(currentVirtualNode, nextVirtualNode);
        domNode = applyPatches(domNode, currentVirtualNode, patches, eventNode);
        currentVirtualNode = nextVirtualNode;

        return;
    }
  }

  return { update: registerVirtualNode };
}


var rAF =
  typeof requestAnimationFrame !== 'undefined'
    ? requestAnimationFrame
    : function(cb) { setTimeout(cb, 1000 / 60); };



////////////  RENDER  ////////////


function render(vNode, eventNode)
{
  switch (vNode.type)
  {

    case 'tagger':
      var subNode = vNode.node;
      var tagger = vNode.tagger;

      while (subNode.type === 'tagger')
      {
        typeof tagger !== 'object'
          ? tagger = [tagger, subNode.tagger]
          : tagger.push(subNode.tagger);

        subNode = subNode.node;
      }

      var subEventRoot = {
        tagger: tagger,
        parent: eventNode
      };

      var domNode = render(subNode, subEventRoot);
      domNode.elm_event_node_ref = subEventRoot;
      return domNode;

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
      case STYLE_KEY:
        applyStyles(domNode, value);
        break;

      case EVENT_KEY:
        applyEvents(domNode, eventNode, value);
        break;

      case ATTR_KEY:
        applyAttrs(domNode, value);
        break;

      case 'value':
        if (domNode[key] !== value)
        {
          domNode[key] = value;
        }
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
      var handler = makeEventHandler(eventNode, value);
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

function makeEventHandler(eventNode, info)
{
  function eventHandler(event)
  {
    var message = info(event);

    var currentEventNode = eventNode;
    while (currentEventNode)
    {
      message = currentEventNode.tagger(message);
      currentEventNode = currentEventNode.parent;
    }

  };

  return eventHandler;
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
      var aTaggers = a.tagger;
      var bTaggers = b.tagger;
      var nesting = false;

      var aSubNode = a.node;
      while (aSubNode.type === 'tagger')
      {
        nesting = true;

        typeof aTaggers !== 'object'
          ? aTaggers = [aTaggers, aSubNode.tagger]
          : aTaggers.push(aSubNode.tagger);

        aSubNode = aSubNode.node;
      }

      var bSubNode = b.node;
      while (bSubNode.type === 'tagger')
      {
        nesting = true;

        typeof bTaggers !== 'object'
          ? bTaggers = [bTaggers, bSubNode.tagger]
          : bTaggers.push(bSubNode.tagger);

        bSubNode = bSubNode.node;
      }


      // diff everything below the taggers
      diffHelp(aSubNode, bSubNode, patches, index + 1);
      return;

    case 'node':

      var factsDiff = diffFacts(a.facts, b.facts);

      if (typeof factsDiff !== 'undefined')
      {
        patches.push(makePatch(index, factsDiff));
      }

      diffChildren(a, b, patches, index);
      return;
  }
}

function diffFacts(a, b, category)
{
  var diff;

  // look for changes and removals
  for (var aKey in a)
  {
    if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY)
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
        (category === STYLE_KEY)
          ? ''
          :
        (category === EVENT_KEY || category === ATTR_KEY)
          ? undefined
          :
        { value: undefined };

      continue;
    }

    var bValue = b[aKey];

    // reference equal, so don't worry about it


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


function diffChildren(aParent, bParent, patches, rootIndex)
{
  var aChildren = aParent.children;
  var bChildren = bParent.children;

  var aLen = aChildren.length;
  var bLen = bChildren.length;


  // PAIRWISE DIFF EVERYTHING ELSE

  var index = rootIndex;
  var minLen = aLen < bLen ? aLen : bLen;
  for (var i = 0; i < minLen; i++)
  {
    index++;
    var aChild = aChildren[i];
    diffHelp(aChild, bChildren[i], patches, index);
    index += aChild.descendantsCount || 0;
  }
}

////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
  addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
  var patch = patches[i];
  var index = patch.index;

  while (index === low)
  {
    patch.domNode = domNode;
    patch.eventNode = eventNode;

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

      return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

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
          i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
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



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
  if (patches.length === 0)
  {
    return rootDomNode;
  }

  addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
  for (var i = 0; i < patches.length; i++)
  {
    var patch = patches[i];
    applyFacts(patch.domNode, patch.eventNode, patch.data);
  }
  return rootDomNode;

}

////////////  PROGRAMS  ////////////


function node(tag)
{
  return F2(function(factList, kidList) {
    return nodeHelp(tag, factList, kidList);
  });
}


function nodeHelp(tag, facts, children)
{
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

var _debois$elm_mdl$Material_Ripple$update = function (action, model) {
    switch (action.ctor) {
      case 'Down':
        return {
              isVisible: true,
              metrics: _debois$elm_mdl$Material_Ripple$computeMetrics(action._0),
            };
      case 'Up':
        return {
          isVisible : false,
          metrics : model.metrics,
        }

    }
  };

var viewLift = function (msg) {
        return function (c) {
                var model = c._0 || {isVisible: false, metrics: {ctor: "Nothing"}}
                c._0 = _debois$elm_mdl$Material_Ripple$update(msg, model);
                return  c
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

var _debois$elm_mdl$Material_Button$view = (
  function (model) {
    var node =
     span(span1Attrs)(
       [
         span(getSpan2Attrs(model.isVisible, model.metrics))([])
       ]);

    return button(buttonAttrs)(
              [
               {
                    type: 'text',
                    text: 'a test Button with a long label'
                },
              {
                  type: 'tagger',
                  tagger: viewLift,
                  node: node,
                  descendantsCount: 1 + (node.descendantsCount || 0)
              }
            ]
          );
  });

var accidentalGlobalModel = {ctor: 'Nothing'};

var _user$project$ChangeMe$main = {
    init:  function (_p3) {
      return  {};
    },
    update: F2(
      function (msg, model) {
        var r = msg(model)

        return accidentalGlobalModel
      }),
    view:  function (mdl) {
      return (
            _debois$elm_mdl$Material_Button$view(
            mdl._0 || {isVisible: false, metrics: {ctor: "Nothing"}}));
    },
    renderer: renderer
};

var Elm = {};
Elm.ChangeMe = Elm.ChangeMe || {};

Elm.ChangeMe.embed = makeEmbed(_user$project$ChangeMe$main)

this.Elm = Elm;
return;

}).call(this);
