
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

function eq(x, y)
{
  var stack = [];
  var isEqual = eqHelp(x, y, 0, stack);
  var pair;
  while (isEqual)
  {
    pair = stack.pop();
    if(!pair){
      break;
    }

    isEqual = eqHelp(pair.x, pair.y, 0, stack);
  }
  return isEqual;
}


function eqHelp(x, y, depth, stack)
{
  if (depth > 100)
  {
    stack.push({ x: x, y: y });
    return true;
  }

  if (x === y)
  {
    return true;
  }

  if (typeof x !== 'object')
  {
    if (typeof x === 'function')
    {
      throw new Error(
        'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
        + ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
        + ' which describes why it is this way and what the better version will look like.'
      );
    }
    return false;
  }

  if (x === null || y === null)
  {
    return false;
  }

  if (x instanceof Date)
  {
    return x.getTime() === y.getTime();
  }

  if (!('ctor' in x))
  {

        return false;

  }


  // check if lists are equal without recursion
  if (x.ctor === '::')
  {
    var a = x;
    var b = y;

    return a.ctor === b.ctor;
  }

  if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
  {
    return false;
  }


  return true;
}


var _elm_lang$core$Basics$snd = function (_p2) {
  var _p3 = _p2;
  return _p3._1;
};
var _elm_lang$core$Basics$fst = function (_p4) {
  var _p5 = _p4;
  return _p5._0;
};

var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};



//import Native.Utils //


var _elm_lang$core$Maybe$Just = function (a) {
  return {ctor: 'Just', _0: a};
};




var _elm_lang$core$Result$Ok = function (a) {
  return {ctor: 'Ok', _0: a};
};


// PROGRAMS

function addPublicModule(object, name, main)
{
  var init = main ? makeEmbed(name, main) : mainIsUndefined(name);

  object.embed = function embed(domNode, flags) {
    return init(domNode, flags);
  }

}


// PROGRAM FAIL

function mainIsUndefined(name)
{
  return function(domNode)
  {
    var message = 'Cannot initialize module `' + name +
      '` because it has no `main` value!\nWhat should I show on screen?';
    domNode.innerHTML = errorHtml(message);
    throw new Error(message);
  };
}

function errorHtml(message)
{
  return '<div style="padding-left:1em;">'
    + '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
    + '<pre style="padding-left:1em;">' + message + '</pre>'
    + '</div>';
}


// PROGRAM SUCCESS

function makeEmbed(moduleName, main)
{
  return function embed(rootDomNode, flags)
  {
    try
    {
      var program = mainToProgram(moduleName, main)
      return makeEmbedHelp(moduleName, program, rootDomNode, flags);
    }
    catch (e)
    {
      rootDomNode.innerHTML = errorHtml(e.message);
      throw e;
    }
  };
}

// MAIN TO PROGRAM

function mainToProgram(moduleName, main)
{
  var init = initWithoutFlags(moduleName, main.init);

  return {
    init: init,
    view: main.view,
    update: main.update,
    subscriptions: main.subscriptions,
    renderer: renderer
  };
}

function initWithoutFlags(moduleName, realInit)
{
  return function init(flags)
  {
    if (typeof flags !== 'undefined')
    {
      throw new Error(
        'You are giving module `' + moduleName + '` an argument in JavaScript.\n'
        + 'This module does not take arguments though! You probably need to change the\n'
        + 'initialization code to something like `Elm.' + moduleName + '.fullscreen()`'
      );
    }
    return realInit();
  };
}


// SETUP RUNTIME SYSTEM

function makeEmbedHelp(moduleName, program, rootDomNode, flags)
{
  var init = program.init;
  var update = program.update;
  var view = program.view;
  var makeRenderer = program.renderer;

  // ambient state
  var renderer;

  // init and update state in main process
  var initApp = nativeBinding(function(callback) {
    var results = init(flags);
    var model = results._0;
    renderer = makeRenderer(rootDomNode, enqueue, view(model));
    callback(succeed(model));
  });

  function onMessage(msg, model)
  {
    return nativeBinding(function(callback) {
      var results = A2(update, msg, model);
      model = results._0;
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

    if (ctor === '_Task_fail')
    {
      while (process.stack && process.stack.ctor === '_Task_andThen')
      {
        process.stack = process.stack.rest;
      }
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


function runHelp(decoder, value)
{
    let result = decoder(value)

    if (result.tag === 'null') {
      return (value === null && result.value != null)
        ? _elm_lang$core$Result$Ok(result.value)
        : {}
    } else {
      return _elm_lang$core$Result$Ok(result)
    }

}


// EQUALITY

function equality(a, b)
{
  if (a === b)
  {
    return true;
  }

  if (a.tag !== b.tag)
  {
    return false;
  }

}


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
      case 'NO_REQUEST':
        throw new Error(
          'Unexpected draw callback.\n' +
          'Please report this to <https://github.com/elm-lang/core/issues>.'
        );

      case 'PENDING_REQUEST':
        rAF(updateIfNeeded);
        state = 'EXTRA_REQUEST';

        var patches = diff(currentVirtualNode, nextVirtualNode);
        domNode = applyPatches(domNode, currentVirtualNode, patches, eventNode);
        currentVirtualNode = nextVirtualNode;

        return;

      case 'EXTRA_REQUEST':
        state = 'NO_REQUEST';
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
    var info = eventHandler.info;

    var value;

    if (typeof info === "function") {
      value = _elm_lang$core$Result$Ok(info(event))
    } else {
      var result = runHelp(info, value);
      value = (result.tag === 'Ok')
        ? result
        : {};
    }

    if (value.ctor === 'Ok')
    {
      var message = value._0;

      var currentEventNode = eventNode;
      while (currentEventNode)
      {
        message = currentEventNode.tagger(message);
        currentEventNode = currentEventNode.parent;
      }
    }
  };

  eventHandler.info = info;

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


function makePatch(type, index, data)
{
  return {
    index: index,
    type: type,
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

  var aType = a.type;
  var bType = b.type;

  // Bail if you run into different types of nodes. Implies that the
  // structure has changed significantly and it's not worth a diff.
  if (aType !== bType)
  {
    patches.push(makePatch('p-redraw', index, b));
    return;
  }

  // Now we know that both nodes are the same type.
  switch (bType)
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

      // Just bail if different numbers of taggers. This implies the
      // structure of the virtual DOM has changed.
      if (nesting && aTaggers.length !== bTaggers.length)
      {
        patches.push(makePatch('p-redraw', index, b));
        return;
      }

      // check if taggers are "the same"
      if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
      {
        patches.push(makePatch('p-tagger', index, bTaggers));
      }

      // diff everything below the taggers
      diffHelp(aSubNode, bSubNode, patches, index + 1);
      return;

    case 'node':
      // Bail if obvious indicators have changed. Implies more serious
      // structural changes such that it's not worth it to diff.
      if (a.tag !== b.tag)
      {
        patches.push(makePatch('p-redraw', index, b));
        return;
      }

      var factsDiff = diffFacts(a.facts, b.facts);

      if (typeof factsDiff !== 'undefined')
      {
        patches.push(makePatch('p-facts', index, factsDiff));
      }

      diffChildren(a, b, patches, index);
      return;
  }
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
  for (var i = 0; i < as.length; i++)
  {
    if (as[i] !== bs[i])
    {
      return false;
    }
  }

  return true;
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

    var aValue = a[aKey];
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
    var patchType = patch.type;

    if (patchType === 'p-remove')
    {
      patch.domNode = domNode;
      patch.eventNode = eventNode;

      var data = patch.data;
      if (typeof data !== 'undefined')
      {
        data.entry.data = domNode;
        var subPatches = data.patches;
        if (subPatches.length > 0)
        {
          addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
        }
      }
    }
    else
    {
      patch.domNode = domNode;
      patch.eventNode = eventNode;
    }

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
  return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
  for (var i = 0; i < patches.length; i++)
  {
    var patch = patches[i];
    var localDomNode = patch.domNode
    var newNode = applyPatch(localDomNode, patch);
    if (localDomNode === rootDomNode)
    {
      rootDomNode = newNode;
    }
  }
  return rootDomNode;
}

function applyPatch(domNode, patch)
{
  switch (patch.type)
  {
    case 'p-redraw':
      return applyPatchRedraw(domNode, patch.data, patch.eventNode);

    case 'p-facts':
      applyFacts(domNode, patch.eventNode, patch.data);
      return domNode;

    case 'p-tagger':
      domNode.elm_event_node_ref.tagger = patch.data;
      return domNode;

    case 'p-remove-last':
      var i = patch.data;
      while (i--)
      {
        domNode.removeChild(domNode.lastChild);
      }
      return domNode;

    default:
      throw new Error('Ran into an unknown patch!');
  }
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
  var parentNode = domNode.parentNode;
  var newNode = render(vNode, eventNode);

  if (typeof newNode.elm_event_node_ref === 'undefined')
  {
    newNode.elm_event_node_ref = domNode.elm_event_node_ref;
  }

  if (parentNode && newNode !== domNode)
  {
    parentNode.replaceChild(newNode, domNode);
  }
  return newNode;
}

////////////  PROGRAMS  ////////////



  function organizeFacts(factList)
  {
    var facts = {};

    var i;
    for (i = 0; i < factList.length; i += 1) {
      var entry = factList[i];
      var key = entry.key;

      if (key === ATTR_KEY || key === EVENT_KEY)
      {
        var subFacts = facts[key] || {};
        subFacts[entry.realKey] = entry.value;
        facts[key] = subFacts;
      }
      else if (key === STYLE_KEY)
      {
        var styles = facts[key] || {};
        var styleList = entry.value;
        var j;
        for (j = 0; j < styleList.length; j += 1) {
          var style = styleList[j];
          styles[style._0] = style._1;
        }
        facts[key] = styles;
      }
      else
      {
        facts[key] = entry.value;
      }
    }

    return facts
  }

  function node(tag)
  {
    return F2(function(factList, kidList) {
      return nodeHelp(tag, factList, kidList);
    });
  }


  function nodeHelp(tag, factList, children)
  {
    var facts = organizeFacts(factList);

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

var _debois$elm_mdl$Material_Ripple$styles = F2(
  function (m, frame) {
    var r = m.rect;

    var offset = 'translate(' + toPx(m.x) + ', ' + toPx(m.y) + ')';
    var rippleSize = toPx(
      (Math.sqrt((r.width * r.width) + (r.height * r.height)) * 2.0) + 2.0);
    var scale = frame ? 'scale(0.0001, 0.0001)' : '';
    var transformString = 'translate(-50%, -50%) ' + offset + scale;
    return [
        { _0: 'width', _1: rippleSize},
        { _0: 'height', _1: rippleSize},
        { _0: '-webkit-transform', _1: transformString},
        { _0: '-ms-transform', _1: transformString},
        { _0: 'transform', _1: transformString}
      ];
  });

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

var _debois$elm_mdl$Material_Ripple$Frame = {ctor: 'Frame'}
var _elm_lang$html$Html_Attributes$classList = function (list) {
  return {
    key: 'className',
    value: 'mdl-ripple ' + list.filter(_elm_lang$core$Basics$snd).map(_elm_lang$core$Basics$fst)
  };
};



var _debois$elm_mdl$Material_Ripple$upOn = function (name) {
  return {
    key: EVENT_KEY,
    realKey: name,
    value: function(){return {ctor: 'Up'}}
  }
};
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

var _debois$elm_mdl$Material_Ripple$downOn$ = function (name) {
    return {
      key: EVENT_KEY,
      realKey: name,
      value: function (value) {
        return viewLift({ctor: 'Down', _0: geometryDecoder(value)});
      }
    }
  };
var _debois$elm_mdl$Material_Button$blurAndForward = function (event) {
  return {
    key: ATTR_KEY,
    realKey: 'on' + event,
    value: 'this.blur(); (function(self) { var e = document.createEvent(\'Event\'); e.initEvent(\'touchcancel\', true, true); self.lastChild.dispatchEvent(e); }(this));'
  }
};

function update(oldRecord, updatedFields)
{
  var newRecord = {};
  for (var key in oldRecord)
  {
    var value = (key in updatedFields) ? updatedFields[key] : oldRecord[key];
    newRecord[key] = value;
  }
  return newRecord;
}
var _debois$elm_mdl$Material_Ripple$update = function (action, model) {
    switch (action.ctor) {
      case 'Down':
        var _p5 = action._0;
        return (_p5.type$ === 'mousedown' && model.ignoringMouseDown) ? (
          update(model,{ignoringMouseDown: false})) : update(model,{
              animation: _debois$elm_mdl$Material_Ripple$Frame,
              metrics: _debois$elm_mdl$Material_Ripple$computeMetrics(_p5),
              ignoringMouseDown: _p5.type$ === 'touchstart' ? true : model.ignoringMouseDown
            });
      case 'Up':
        return (update(model,{animation: {ctor: 'Inert'}}));
      default:
        return (model)

    }
  };

var viewLift = function (msg) {
        return function (c) {
                var model = c._0 || {animation: {ctor: 'Inert'}, metrics: {ctor: "Nothing"}, ignoringMouseDown: false}
                c._0 = _debois$elm_mdl$Material_Ripple$update(msg, model);
                return  c
        }

    }
let buttonAttrs = [

    _debois$elm_mdl$Material_Ripple$downOn$('mousedown'),

    _debois$elm_mdl$Material_Ripple$downOn$('touchstart'),

    _debois$elm_mdl$Material_Button$blurAndForward('mouseup'),

    _debois$elm_mdl$Material_Button$blurAndForward('mouseleave'),

    _debois$elm_mdl$Material_Button$blurAndForward('touchend'),

    {"key":"className","value":"mdl-js-ripple-effect mdl-js-button mdl-button mdl-button--raised"}
    ]

var _debois$elm_mdl$Material_Button$view = (
  function (model) {
    var stylingA;

      if ((model.metrics.ctor === 'Just')) {
          stylingA = _debois$elm_mdl$Material_Ripple$styles(model.metrics._0)(model.animation.ctor === 'Frame');
      } else {
        stylingA = [];
      }

  var styling = {
    key: STYLE_KEY,
    value: stylingA
  }

    var node = A2(
     span,
       [
         {
           value: 'mdl-button__ripple-container'
         },
         _debois$elm_mdl$Material_Ripple$upOn('blur'),
         _debois$elm_mdl$Material_Ripple$upOn('touchcancel')
       ],
       [
         A2(
         span,
           [
             _elm_lang$html$Html_Attributes$classList(
               [
                 {
                  _0: 'is-animating',
                  _1: !eq(model.animation, _debois$elm_mdl$Material_Ripple$Frame)
                 },
                 {
                   _0: 'is-visible',
                   _1: !eq(model.animation, {ctor: 'Inert'})
                 }
               ]),
             styling
           ],
           [])
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
var _user$project$ChangeMe$materialUpdate = F2(
  function (msg, model) {
    var r = msg(model)
    return accidentalGlobalModel
  });

var _user$project$ChangeMe$view = function (mdl) {
  return (
        _debois$elm_mdl$Material_Button$view(
        mdl._0 || {animation: {ctor: 'Inert'}, metrics: {ctor: "Nothing"}, ignoringMouseDown: false}));
};

var _user$project$ChangeMe$main = {
    init:  function (_p3) {
      return  {
              _0: {},
            };
    },
    update: F2(
      function (msg, model) {
        return {
                _0: A2(_user$project$ChangeMe$materialUpdate, msg, model),
              }
      }),
    view: _user$project$ChangeMe$view,
    renderer: renderer
};

var Elm = {};
Elm.ChangeMe = Elm.ChangeMe || {};
addPublicModule(Elm.ChangeMe, 'ChangeMe', typeof _user$project$ChangeMe$main === 'undefined' ? null : _user$project$ChangeMe$main);

this.Elm = Elm;
return;

}).call(this);
