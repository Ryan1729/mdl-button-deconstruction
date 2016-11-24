
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}

function compare()
{
  return { ctor: 'EQ' };
}
compare= F2(compare);
let round= Math.round;



// COMPARISONS

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

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.


// COMMON VALUES

var Tuple0 = {
  ctor: '_Tuple0'
};

function Tuple2(x, y)
{
  return {
    ctor: '_Tuple2',
    _0: x,
    _1: y
  };
}

// GUID

var count = 0;
function guid()
{
  return count++;
}


// RECORDS




//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
  return {
    ctor: '::',
    _0: hd,
    _1: tl
  };
}

function append(xs, ys)
{
  // append Strings
  if (typeof xs === 'string')
  {
    return xs + ys;
  }
}


// TO STRING

function toString(v)
{
  var type = typeof v;
  if (type === 'function')
  {
    var name = v.func ? v.func.name : v.name;
    return '<function' + (name === '' ? '' : ':') + name + '>';
  }

  if (type === 'boolean')
  {
    return v ? 'True' : 'False';
  }

  if (type === 'number')
  {
    return v + '';
  }

  if (v instanceof String)
  {
    return '\'' + addSlashes(v, true) + '\'';
  }

  if (type === 'string')
  {
    return '"' + addSlashes(v, false) + '"';
  }

  if (v === null)
  {
    return 'null';
  }

  if (type === 'object' && 'ctor' in v)
  {
    var ctorStarter = v.ctor.substring(0, 5);

    if (ctorStarter === '_Tupl')
    {
      var output = [];
      for (var k in v)
      {
        if (k === 'ctor') continue;
        output.push(toString(v[k]));
      }
      return '(' + output.join(',') + ')';
    }

    if (ctorStarter === '_Task')
    {
      return '<task>'
    }

    if (v.ctor === '_Array')
    {
      var list = _elm_lang$core$Array$toList(v);
      return 'Array.fromList ' + toString(list);
    }

    if (v.ctor === '<decoder>')
    {
      return '<decoder>';
    }

    if (v.ctor === '_Process')
    {
      return '<process:' + v.id + '>';
    }

    if (v.ctor === '::')
    {
      var output = '[' + toString(v._0);
      v = v._1;
      while (v.ctor === '::')
      {
        output += ',' + toString(v._0);
        v = v._1;
      }
      return output + ']';
    }

    if (v.ctor === '[]')
    {
      return '[]';
    }




    var output = '';
    for (var i in v)
    {
      if (i === 'ctor') continue;
      var str = toString(v[i]);
      var c0 = str[0];
      var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
      output += ' ' + (parenless ? str : '(' + str + ')');
    }
    return v.ctor + output;
  }

  if (type === 'object')
  {
    if (v instanceof Date)
    {
      return '<' + v.toString() + '>';
    }

    if (v.elm_web_socket)
    {
      return '<websocket>';
    }

    var output = [];
    for (var k in v)
    {
      output.push(k + ' = ' + toString(v[k]));
    }
    if (output.length === 0)
    {
      return '{}';
    }
    return '{ ' + output.join(', ') + ' }';
  }

  return '<internal structure>';
}

  append = F2(append)

var _elm_lang$core$Basics$snd = function (_p2) {
  var _p3 = _p2;
  return _p3._1;
};
var _elm_lang$core$Basics$fst = function (_p4) {
  var _p5 = _p4;
  return _p5._0;
};
var _elm_lang$core$Basics$always = F2(
  function (a) {
    return a;
  });

var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};

var _elm_lang$core$Basics$toString = toString;
var _elm_lang$core$Basics$round = round;


//import Native.Utils //


var _elm_lang$core$Maybe$Just = function (a) {
  return {ctor: 'Just', _0: a};
};

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
  return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
  var out = Nil;
  for (var i = arr.length; i--; )
  {
    out = Cons(arr[i], out);
  }
  return out;
}

function toArray(xs)
{
  var out = [];
  while (xs.ctor !== '[]')
  {
    out.push(xs._0);
    xs = xs._1;
  }
  return out;
}

function foldr(f, b, xs)
{
  var arr = toArray(xs);
  var acc = b;
  for (var i = arr.length; i--; )
  {
    acc = A2(f, arr[i], acc);
  }
  return acc;
}


var _elm_lang$core$List$foldr = F3(foldr);
var _elm_lang$core$List$map = F2(
  function (f, xs) {
    return A3(
      _elm_lang$core$List$foldr,
      F2(
        function (x, acc) {
          return A2(
            F2(Cons),
            f(x),
            acc);
        }),
      fromArray(
        []),
      xs);
  });
var _elm_lang$core$List$filter = F2(
  function (pred, xs) {
    var conditionalCons = F2(
      function (x, xs$) {
        return pred(x) ? A2(F2(Cons), x, xs$) : xs$;
      });
    return A3(
      _elm_lang$core$List$foldr,
      conditionalCons,
      fromArray(
        []),
      xs);
  });

var _elm_lang$core$Result$Err = function (a) {
  return {ctor: 'Err', _0: a};
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
  var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
    var results = init(flags);
    var model = results._0;
    renderer = makeRenderer(rootDomNode, enqueue, view(model));
    callback(succeed(model));
  });

  function onMessage(msg, model)
  {
    return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
      var results = A2(update, msg, model);
      model = results._0;
      renderer.update(view(model));
      callback(succeed(model));
    });
  }

  var mainProcess = spawnLoop(initApp, onMessage);

  function enqueue(msg)
  {
    _elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
  }

  return {};
}



// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
  var andThen = _elm_lang$core$Native_Scheduler.andThen;

  function loop(state)
  {
    var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
      return onMessage(msg, state);
    });
    return A2(andThen, handleMsg, loop);
  }

  var task = A2(andThen, init, loop);

  return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
  return function(value)
  {
    return {
      type: 'leaf',
      home: home,
      value: value
    };
  };
}

function batch(list)
{
  return {
    type: 'node',
    branches: list
  };
}


function succeed(value)
{
  return {
    ctor: '_Task_succeed',
    value: value
  };
}

function onError(task, callback)
{
  return {
    ctor: '_Task_onError',
    task: task,
    callback: callback
  };
}

onError = F2(onError)
//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;

function nativeBinding(callback)
{
  return {
    ctor: '_Task_nativeBinding',
    callback: callback,
    cancel: null
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
    id: guid(),
    root: task,
    stack: null,
    mailbox: []
  };

  enqueue(process);

  return process;
}

function spawn(task)
{
  return nativeBinding(function(callback) {
    var process = rawSpawn(task);
    callback(succeed(process));
  });
}

function rawSend(process, msg)
{
  process.mailbox.push(msg);
  enqueue(process);
}

function send(process, msg)
{
  return nativeBinding(function(callback) {
    rawSend(process, msg);
    callback(succeed(Tuple0));
  });
}

function kill(process)
{
  return nativeBinding(function(callback) {
    var root = process.root;
    if (root.ctor === '_Task_nativeBinding' && root.cancel)
    {
      root.cancel();
    }

    process.root = null;

    callback(succeed(Tuple0));
  });
}

function sleep(time)
{
  return nativeBinding(function(callback) {
    var id = setTimeout(function() {
      callback(succeed(Tuple0));
    }, time);

    return function() { clearTimeout(id); };
  });
}


// STEP PROCESSES

function step(numSteps, process)
{
  while (numSteps < MAX_STEPS)
  {
    var ctor = process.root.ctor;

    if (ctor === '_Task_succeed')
    {
      while (process.stack && process.stack.ctor === '_Task_onError')
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

    if (ctor === '_Task_onError')
    {
      process.stack = {
        ctor: '_Task_onError',
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


return {
  succeed: succeed,
  nativeBinding: nativeBinding,
  andThen: F2(andThen),
  receive: receive,

  kill: kill,
  sleep: sleep,

  rawSpawn: rawSpawn,
  rawSend: rawSend
};

}();


let join = F2(function(sep, strs)
{
  return toArray(strs).join(sep);
})

// CORE DECODERS





// DECODE HELPERS

function ok(value)
{
  return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
  return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
  return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
  return { tag: 'field', field: field, rest: nestedProblems };
}

function badOneOf(problems)
{
  return { tag: 'oneOf', problems: problems };
}

function badCustom(msg)
{
  return { tag: 'custom', msg: msg };
}

function bad(msg)
{
  return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
  var context = '_';
  while (problem)
  {
    switch (problem.tag)
    {
      case 'primitive':
        return 'Expecting ' + problem.type
          + (context === '_' ? '' : ' at ' + context)
          + ' but instead got: ' + jsToString(problem.value);

      case 'index':
        context += '[' + problem.index + ']';
        problem = problem.rest;
        break;

      case 'field':
        context += '.' + problem.field;
        problem = problem.rest;
        break;

      case 'oneOf':
        var problems = problem.problems;
        for (var i = 0; i < problems.length; i++)
        {
          problems[i] = badToString(problems[i]);
        }
        return 'I ran into the following problems'
          + (context === '_' ? '' : ' at ' + context)
          + ':\n\n' + problems.join('\n');

      case 'custom':
        return 'A `customDecoder` failed'
          + (context === '_' ? '' : ' at ' + context)
          + ' with the message: ' + problem.msg;

      case 'fail':
        return 'I ran into a `fail` decoder'
          + (context === '_' ? '' : ' at ' + context)
          + ': ' + problem.msg;
    }
  }
}

function jsToString(value)
{
  return value === undefined
    ? 'undefined'
    : JSON.stringify(value);
}


// DECODE


function run(decoder, value)
{
  var result = runHelp(decoder, value);
  return (result.tag === 'ok')
    ? _elm_lang$core$Result$Ok(result.value)
    : _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
  if (typeof decoder === "function") {
    let result = decoder(value)

    if (result.tag === 'null') {
      return (value === null && result.value != null)
        ? ok(result.value)
        : badPrimitive('null', value)
    } else {
      return ok(result)
    }
  }

  switch (decoder.tag)
  {
    case 'bool':
      return (typeof value === 'boolean')
        ? ok(value)
        : badPrimitive('a Bool', value);

    case 'int':
      if (typeof value !== 'number') {
        return badPrimitive('an Int', value);
      }

      if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
        return ok(value);
      }

      return badPrimitive('an Int', value);

    case 'float':
      return (typeof value === 'number')
        ? ok(value)
        : badPrimitive('a Float', value);

    case 'string':
      return (typeof value === 'string')
        ? ok(value)
        : (value instanceof String)
          ? ok(value + '')
          : badPrimitive('a String', value);

    case 'null':
      return (value === null)
        ? ok(decoder.value)
        : badPrimitive('null', value);

    case 'value':
      return ok(value);

    case 'list':
      if (!(value instanceof Array))
      {
        return badPrimitive('a List', value);
      }

      var list = Nil;
      for (var i = value.length; i--; )
      {
        var result = runHelp(decoder.decoder, value[i]);
        if (result.tag !== 'ok')
        {
          return badIndex(i, result)
        }
        list = Cons(result.value, list);
      }
      return ok(list);

    case 'field':
      var field = decoder.field;
      if (typeof value !== 'object' || value === null || !(field in value))
      {
        return badPrimitive('an object with a field named `' + field + '`', value);
      }

      var result = runHelp(decoder.decoder, value[field]);
      return (result.tag === 'ok')
        ? result
        : badField(field, result);

    case 'key-value':
      if (typeof value !== 'object' || value === null || value instanceof Array)
      {
        return badPrimitive('an object', value);
      }

      var keyValuePairs = Nil;
      for (var key in value)
      {
        var result = runHelp(decoder.decoder, value[key]);
        if (result.tag !== 'ok')
        {
          return badField(key, result);
        }
        var pair = Tuple2(key, result.value);
        keyValuePairs = Cons(pair, keyValuePairs);
      }
      return ok(keyValuePairs);

    case 'map-many':
      var answer = decoder.func;
      var decoders = decoder.decoders;
      for (var i = 0; i < decoders.length; i++)
      {
        var result = runHelp(decoders[i], value);
        if (result.tag !== 'ok')
        {
          return result;
        }
        answer = answer(result.value);
      }
      return ok(answer);

    case 'tuple':
      var decoders = decoder.decoders;
      var len = decoders.length;

      if ( !(value instanceof Array) || value.length !== len )
      {
        return badPrimitive('a Tuple with ' + len + ' entries', value);
      }

      var answer = decoder.func;
      for (var i = 0; i < len; i++)
      {
        var result = runHelp(decoders[i], value[i]);
        if (result.tag !== 'ok')
        {
          return badIndex(i, result);
        }
        answer = answer(result.value);
      }
      return ok(answer);

    case 'customAndThen':
      var result = runHelp(decoder.decoder, value);
      if (result.tag !== 'ok')
      {
        return result;
      }
      var realResult = decoder.callback(result.value);
      if (realResult.ctor === 'Err')
      {
        return badCustom(realResult._0);
      }
      return ok(realResult._0);

    case 'andThen':
      var result = runHelp(decoder.decoder, value);
      return (result.tag !== 'ok')
        ? result
        : runHelp(decoder.callback(result.value), value);

    case 'oneOf':
      var errors = [];
      var temp = decoder.decoders;
      while (temp.ctor !== '[]')
      {
        var result = runHelp(temp._0, value);

        if (result.tag === 'ok')
        {
          return result;
        }

        errors.push(result);

        temp = temp._1;
      }
      return badOneOf(errors);

    case 'fail':
      return bad(decoder.msg);

    case 'succeed':
      return ok(decoder.msg);
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

  switch (a.tag)
  {
    case 'succeed':
    case 'fail':
      return a.msg === b.msg;

    case 'bool':
    case 'int':
    case 'float':
    case 'string':
    case 'value':
      return true;

    case 'null':
      return a.value === b.value;

    case 'list':
    case 'array':
    case 'maybe':
    case 'key-value':
      return equality(a.decoder, b.decoder);

    case 'field':
      return a.field === b.field && equality(a.decoder, b.decoder);

    case 'map-many':
    case 'tuple':
      if (a.func !== b.func)
      {
        return false;
      }
      return listEquality(a.decoders, b.decoders);

    case 'andThen':
    case 'customAndThen':
      return a.callback === b.callback && equality(a.decoder, b.decoder);

    case 'oneOf':
      return listEquality(a.decoders, b.decoders);
  }
}

function listEquality(aDecoders, bDecoders)
{
  var len = aDecoders.length;
  if (len !== bDecoders.length)
  {
    return false;
  }
  for (var i = 0; i < len; i++)
  {
    if (!equality(aDecoders[i], bDecoders[i]))
    {
      return false;
    }
  }
  return true;
}


  run= F2(run)







var _elm_lang$core$Json_Decode_ops = _elm_lang$core$Json_Decode_ops || {};
//import Native.Json //



var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';


function property(key, value)
{
  return {
    key: key,
    value: value
  };
}


function attribute(key, value)
{
  return {
    key: ATTR_KEY,
    realKey: key,
    value: value
  };
}




function equalEvents(a, b)
{
  if ((!a.options) === b.options)
  {
    if (a.stopPropagation !== b.stopPropagation || a.preventDefault !== b.preventDefault)
    {
      return false;
    }
  }
  return equality(a.decoder, b.decoder);
}



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
    case 'thunk':
      if (!vNode.node)
      {
        vNode.node = vNode.thunk();
      }
      return render(vNode.node, eventNode);

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

    case 'keyed-node':
      var domNode = document.createElement(vNode.tag);

      applyFacts(domNode, eventNode, vNode.facts);

      var children = vNode.children;

      for (var i = 0; i < children.length; i++)
      {
        domNode.appendChild(render(children[i]._1, eventNode));
      }

      return domNode;

    case 'custom':
      var domNode = vNode.impl.render(vNode.model);
      applyFacts(domNode, eventNode, vNode.facts);
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

      case ATTR_NS_KEY:
        applyAttrsNS(domNode, value);
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

    if (typeof info.decoder === "function") {
      value = _elm_lang$core$Result$Ok(info.decoder(event))
    } else {
      value = A2(run, info.decoder, event);
    }

    if (value.ctor === 'Ok')
    {
      var options = info.options;
      if (options.stopPropagation)
      {
        event.stopPropagation();
      }
      if (options.preventDefault)
      {
        event.preventDefault();
      }

      var message = value._0;

      var currentEventNode = eventNode;
      while (currentEventNode)
      {
        var tagger = currentEventNode.tagger;
        if (typeof tagger === 'function')
        {
          message = tagger(message);
        }
        else
        {
          for (var i = tagger.length; i--; )
          {
            message = tagger[i](message);
          }
        }
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

function applyAttrsNS(domNode, nsAttrs)
{
  for (var key in nsAttrs)
  {
    var pair = nsAttrs[key];
    var namespace = pair.namespace;
    var value = pair.value;

    if (typeof value === 'undefined')
    {
      domNode.removeAttributeNS(namespace, key);
    }
    else
    {
      domNode.setAttributeNS(namespace, key, value);
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
    case 'thunk':
      var aArgs = a.args;
      var bArgs = b.args;
      var i = aArgs.length;
      var same = a.func === b.func && i === bArgs.length;
      while (same && i--)
      {
        same = aArgs[i] === bArgs[i];
      }
      if (same)
      {
        b.node = a.node;
        return;
      }
      b.node = b.thunk();
      var subPatches = [];
      diffHelp(a.node, b.node, subPatches, 0);
      if (subPatches.length > 0)
      {
        patches.push(makePatch('p-thunk', index, subPatches));
      }
      return;

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

    case 'text':
      if (a.text !== b.text)
      {
        patches.push(makePatch('p-text', index, b.text));
        return;
      }

      return;

    case 'node':
      // Bail if obvious indicators have changed. Implies more serious
      // structural changes such that it's not worth it to diff.
      if (a.tag !== b.tag || a.namespace !== b.namespace)
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

    case 'keyed-node':
      // Bail if obvious indicators have changed. Implies more serious
      // structural changes such that it's not worth it to diff.
      if (a.tag !== b.tag || a.namespace !== b.namespace)
      {
        patches.push(makePatch('p-redraw', index, b));
        return;
      }

      var factsDiff = diffFacts(a.facts, b.facts);

      if (typeof factsDiff !== 'undefined')
      {
        patches.push(makePatch('p-facts', index, factsDiff));
      }

      diffKeyedChildren(a, b, patches, index);
      return;

    case 'custom':
      if (a.impl !== b.impl)
      {
        patches.push(makePatch('p-redraw', index, b));
        return;
      }

      var factsDiff = diffFacts(a.facts, b.facts);
      if (typeof factsDiff !== 'undefined')
      {
        patches.push(makePatch('p-facts', index, factsDiff));
      }

      var patch = b.impl.diff(a,b);
      if (patch)
      {
        patches.push(makePatch('p-custom', index, patch));
        return;
      }

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
    if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
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
        { namespace: a[aKey].namespace, value: undefined };

      continue;
    }

    var aValue = a[aKey];
    var bValue = b[aKey];

    // reference equal, so don't worry about it
    if (aValue === bValue && aKey !== 'value'
      || category === EVENT_KEY && equalEvents(aValue, bValue))
    {
      continue;
    }

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

  // FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

  if (aLen > bLen)
  {
    patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
  }
  else if (aLen < bLen)
  {
    patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
  }

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



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
  var localPatches = [];

  var changes = {}; // Dict String Entry
  var inserts = []; // Array { index : Int, entry : Entry }
  // type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

  var aChildren = aParent.children;
  var bChildren = bParent.children;
  var aLen = aChildren.length;
  var bLen = bChildren.length;
  var aIndex = 0;
  var bIndex = 0;

  var index = rootIndex;

  while (aIndex < aLen && bIndex < bLen)
  {
    var a = aChildren[aIndex];
    var b = bChildren[bIndex];

    var aKey = a._0;
    var bKey = b._0;
    var aNode = a._1;
    var bNode = b._1;

    // check if keys match

    if (aKey === bKey)
    {
      index++;
      diffHelp(aNode, bNode, localPatches, index);
      index += aNode.descendantsCount || 0;

      aIndex++;
      bIndex++;
      continue;
    }

    // look ahead 1 to detect insertions and removals.

    var aLookAhead = aIndex + 1 < aLen;
    var bLookAhead = bIndex + 1 < bLen;

    if (aLookAhead)
    {
      var aNext = aChildren[aIndex + 1];
      var aNextKey = aNext._0;
      var aNextNode = aNext._1;
      var oldMatch = bKey === aNextKey;
    }

    if (bLookAhead)
    {
      var bNext = bChildren[bIndex + 1];
      var bNextKey = bNext._0;
      var bNextNode = bNext._1;
      var newMatch = aKey === bNextKey;
    }


    // swap a and b
    if (aLookAhead && bLookAhead && newMatch && oldMatch)
    {
      index++;
      diffHelp(aNode, bNextNode, localPatches, index);
      insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
      index += aNode.descendantsCount || 0;

      index++;
      removeNode(changes, localPatches, aKey, aNextNode, index);
      index += aNextNode.descendantsCount || 0;

      aIndex += 2;
      bIndex += 2;
      continue;
    }

    // insert b
    if (bLookAhead && newMatch)
    {
      index++;
      insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
      diffHelp(aNode, bNextNode, localPatches, index);
      index += aNode.descendantsCount || 0;

      aIndex += 1;
      bIndex += 2;
      continue;
    }

    // remove a
    if (aLookAhead && oldMatch)
    {
      index++;
      removeNode(changes, localPatches, aKey, aNode, index);
      index += aNode.descendantsCount || 0;

      index++;
      diffHelp(aNextNode, bNode, localPatches, index);
      index += aNextNode.descendantsCount || 0;

      aIndex += 2;
      bIndex += 1;
      continue;
    }

    // remove a, insert b
    if (aLookAhead && bLookAhead && aNextKey === bNextKey)
    {
      index++;
      removeNode(changes, localPatches, aKey, aNode, index);
      insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
      index += aNode.descendantsCount || 0;

      index++;
      diffHelp(aNextNode, bNextNode, localPatches, index);
      index += aNextNode.descendantsCount || 0;

      aIndex += 2;
      bIndex += 2;
      continue;
    }

    break;
  }

  // eat up any remaining nodes with removeNode and insertNode

  while (aIndex < aLen)
  {
    index++;
    var a = aChildren[aIndex];
    var aNode = a._1;
    removeNode(changes, localPatches, a._0, aNode, index);
    index += aNode.descendantsCount || 0;
    aIndex++;
  }

  var endInserts;
  while (bIndex < bLen)
  {
    endInserts = endInserts || [];
    var b = bChildren[bIndex];
    insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
    bIndex++;
  }

  if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
  {
    patches.push(makePatch('p-reorder', rootIndex, {
      patches: localPatches,
      inserts: inserts,
      endInserts: endInserts
    }));
  }
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
  var entry = changes[key];

  // never seen this key before
  if (typeof entry === 'undefined')
  {
    entry = {
      tag: 'insert',
      vnode: vnode,
      index: bIndex,
      data: undefined
    };

    inserts.push({ index: bIndex, entry: entry });
    changes[key] = entry;

    return;
  }

  // this key was removed earlier, a match!
  if (entry.tag === 'remove')
  {
    inserts.push({ index: bIndex, entry: entry });

    entry.tag = 'move';
    var subPatches = [];
    diffHelp(entry.vnode, vnode, subPatches, entry.index);
    entry.index = bIndex;
    entry.data.data = {
      patches: subPatches,
      entry: entry
    };

    return;
  }

  // this key has already been inserted or moved, a duplicate!
  insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
  var entry = changes[key];

  // never seen this key before
  if (typeof entry === 'undefined')
  {
    var patch = makePatch('p-remove', index, undefined);
    localPatches.push(patch);

    changes[key] = {
      tag: 'remove',
      vnode: vnode,
      index: index,
      data: patch
    };

    return;
  }

  // this key was inserted earlier, a match!
  if (entry.tag === 'insert')
  {
    entry.tag = 'move';
    var subPatches = [];
    diffHelp(vnode, entry.vnode, subPatches, index);

    var patch = makePatch('p-remove', index, {
      patches: subPatches,
      entry: entry
    });
    localPatches.push(patch);

    return;
  }

  // this key has already been removed or moved, a duplicate!
  removeNode(changes, localPatches, key + POSTFIX, vnode, index);
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

    if (patchType === 'p-thunk')
    {
      addDomNodes(domNode, vNode.node, patch.data, eventNode);
    }
    else if (patchType === 'p-reorder')
    {
      patch.domNode = domNode;
      patch.eventNode = eventNode;

      var subPatches = patch.data.patches;
      if (subPatches.length > 0)
      {
        addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
      }
    }
    else if (patchType === 'p-remove')
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

    case 'keyed-node':
      var vChildren = vNode.children;
      var childNodes = domNode.childNodes;
      for (var j = 0; j < vChildren.length; j++)
      {
        low++;
        var vChild = vChildren[j]._1;
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
    case 'thunk':
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

    case 'p-text':
      domNode.replaceData(0, domNode.length, patch.data);
      return domNode;

    case 'p-thunk':
      return applyPatchesHelp(domNode, patch.data);

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

    case 'p-append':
      var newNodes = patch.data;
      for (var i = 0; i < newNodes.length; i++)
      {
        domNode.appendChild(render(newNodes[i], patch.eventNode));
      }
      return domNode;

    case 'p-remove':
      var data = patch.data;
      if (typeof data === 'undefined')
      {
        domNode.parentNode.removeChild(domNode);
        return domNode;
      }
      var entry = data.entry;
      if (typeof entry.index !== 'undefined')
      {
        domNode.parentNode.removeChild(domNode);
      }
      entry.data = applyPatchesHelp(domNode, data.patches);
      return domNode;

    case 'p-reorder':
      return applyPatchReorder(domNode, patch);

    case 'p-custom':
      var impl = patch.data;
      return impl.applyPatch(domNode, impl.data);

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


function applyPatchReorder(domNode, patch)
{
  var data = patch.data;

  // remove end inserts
  var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

  // removals
  domNode = applyPatchesHelp(domNode, data.patches);

  // inserts
  var inserts = data.inserts;
  for (var i = 0; i < inserts.length; i++)
  {
    var insert = inserts[i];
    var entry = insert.entry;
    var node = entry.tag === 'move'
      ? entry.data
      : render(entry.vnode, patch.eventNode);
    domNode.insertBefore(node, domNode.childNodes[insert.index]);
  }

  // add end inserts
  if (typeof frag !== 'undefined')
  {
    domNode.appendChild(frag);
  }

  return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
  if (typeof endInserts === 'undefined')
  {
    return;
  }

  var frag = document.createDocumentFragment();
  for (var i = 0; i < endInserts.length; i++)
  {
    var insert = endInserts[i];
    var entry = insert.entry;
    frag.appendChild(entry.tag === 'move'
      ? entry.data
      : render(entry.vnode, patch.eventNode)
    );
  }
  return frag;
}

////////////  PROGRAMS  ////////////

var _elm_lang$virtual_dom$VirtualDom$on = F2(
  function (eventName, decoder) {
      return {
        key: EVENT_KEY,
        realKey: eventName,
        value: {
          options: {stopPropagation: false, preventDefault: false},
          decoder: decoder
        }
      };
  });

  function organizeFacts(factList)
  {
    var namespace, facts = {};

    while (factList.ctor !== '[]')
    {
      var entry = factList._0;
      var key = entry.key;

      if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
      {
        var subFacts = facts[key] || {};
        subFacts[entry.realKey] = entry.value;
        facts[key] = subFacts;
      }
      else if (key === STYLE_KEY)
      {
        var styles = facts[key] || {};
        var styleList = entry.value;
        while (styleList.ctor !== '[]')
        {
          var style = styleList._0;
          styles[style._0] = style._1;
          styleList = styleList._1;
        }
        facts[key] = styles;
      }
      else if (key === 'namespace')
      {
        namespace = entry.value;
      }
      else
      {
        facts[key] = entry.value;
      }
      factList = factList._1;
    }

    return {
      facts: facts,
      namespace: namespace
    };
  }

  function node(tag)
  {
    return F2(function(factList, kidList) {
      return nodeHelp(tag, factList, kidList);
    });
  }


  function nodeHelp(tag, factList, kidList)
  {
    var organized = organizeFacts(factList);
    var facts = organized.facts;

    var children = [];
    var descendantsCount = 0;
    while (kidList.ctor !== '[]')
    {
      var kid = kidList._0;
      descendantsCount += (kid.descendantsCount || 0);
      children.push(kid);
      kidList = kidList._1;
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
var _elm_lang$html$Html$span = node('span');

var _elm_lang$html$Html_Attributes$attribute = F2(attribute);
var _elm_lang$html$Html_Attributes$property = F2(property);
var _elm_lang$html$Html_Attributes$stringProperty = F2(
  function (name, string) {
    return A2(
      _elm_lang$html$Html_Attributes$property,
      name,
      string);
  });
var _elm_lang$html$Html_Attributes$class = function (name) {
  return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};



var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$succeed = succeed;
var _elm_lang$core$Task$map = F2(
  function (func, taskA) {
    return A2(
      _elm_lang$core$Task$andThen,
      taskA,
      function (a) {
        return _elm_lang$core$Task$succeed(
          func(a));
      });
  });
var _elm_lang$core$Task$map2 = F3(
  function (func, taskA, taskB) {
    return A2(
      _elm_lang$core$Task$andThen,
      taskA,
      function (a) {
        return A2(
          _elm_lang$core$Task$andThen,
          taskB,
          function (b) {
            return _elm_lang$core$Task$succeed(
              A2(func, a, b));
          });
      });
  });
var _elm_lang$core$Task$sequence = function (tasks) {
  var _p2 = tasks;
  if (_p2.ctor === '[]') {
    return _elm_lang$core$Task$succeed(
      fromArray(
        []));
  } else {
    return A3(
      _elm_lang$core$Task$map2,
      F2(
        function (x, y) {
          return A2(F2(Cons), x, y);
        }),
      _p2._0,
      _elm_lang$core$Task$sequence(_p2._1));
  }
};
var _elm_lang$core$Task$command = leaf('Task');
var _elm_lang$core$Task$T = function (a) {
  return {ctor: 'T', _0: a};
};
var _elm_lang$core$Task$perform = F3(
  function (onFail, onSuccess, task) {
    return _elm_lang$core$Task$command(
      _elm_lang$core$Task$T(

          onError(
          A2(_elm_lang$core$Task$map, onSuccess, task),
          function (x) {
            return _elm_lang$core$Task$succeed(
              onFail(x));
          })));
  });


var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;

var _debois$elm_mdl$Material_Helpers$delay = F2(
  function (t, x) {
    return A3(
      _elm_lang$core$Task$perform,
      _elm_lang$core$Basics$always(x),
      _elm_lang$core$Basics$always(x),
      _elm_lang$core$Process$sleep(t));
  });
var _debois$elm_mdl$Material_Helpers$cssTransitionStep = function (x) {
  return A2(_debois$elm_mdl$Material_Helpers$delay, 50, x);
};

var _debois$elm_mdl$Material_Helpers$effect = F2(
  function (e, x) {
    return {ctor: '_Tuple2', _0: x, _1: e};
  });



  var toPx = function (k) {
    return A2(
      append,
      _elm_lang$core$Basics$toString(
        _elm_lang$core$Basics$round(k)),
      'px');
  };

var _debois$elm_mdl$Material_Ripple$styles = F2(
  function (m, frame) {
    var r = m.rect;

    var offset = 'translate(' + toPx(m.x) + ', ' + toPx(m.y) + ')';
    var rippleSize = toPx(
      (Math.sqrt((r.width * r.width) + (r.height * r.height)) * 2.0) + 2.0);
    var scale = frame === 0 ? 'scale(0.0001, 0.0001)' : '';
    var transformString = 'translate(-50%, -50%) ' + offset + scale;
    return fromArray(
      [
        {ctor: '_Tuple2', _0: 'width', _1: rippleSize},
        {ctor: '_Tuple2', _0: 'height', _1: rippleSize},
        {ctor: '_Tuple2', _0: '-webkit-transform', _1: transformString},
        {ctor: '_Tuple2', _0: '-ms-transform', _1: transformString},
        {ctor: '_Tuple2', _0: 'transform', _1: transformString}
      ]);
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

var _debois$elm_mdl$Material_Ripple$Frame = function (a) {
  return {ctor: 'Frame', _0: a};
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
  return _elm_lang$html$Html_Attributes$class(
    A2(
      join,
      ' ',
      A2(
        _elm_lang$core$List$map,
        _elm_lang$core$Basics$fst,
        A2(_elm_lang$core$List$filter, _elm_lang$core$Basics$snd, list))));
};
var _debois$elm_mdl$Material_Ripple$view$ = function (model) {
    var stylingA = function () {
      if ((model.metrics.ctor === 'Just')) {
        if (model.animation.ctor === 'Frame') {
          return A2(_debois$elm_mdl$Material_Ripple$styles, model.metrics._0, model.animation._0);
        } else {
          return A2(_debois$elm_mdl$Material_Ripple$styles, model.metrics._0, 1);
        }
      } else {
        return fromArray(
          []);
      }
    }();

    var styling = {
      key: STYLE_KEY,
      value: stylingA
    }
    return A2(
      _elm_lang$html$Html$span,
      fromArray(
        [
          _elm_lang$html$Html_Attributes$class('mdl-button__ripple-container'),
          _debois$elm_mdl$Material_Ripple$upOn('blur'),
          _debois$elm_mdl$Material_Ripple$upOn('touchcancel')
        ]),
      fromArray(
        [
          A2(
          _elm_lang$html$Html$span,
          fromArray(
            [
              _elm_lang$html$Html_Attributes$classList(
              fromArray(
                [
                  {ctor: '_Tuple2', _0: 'mdl-ripple', _1: true},
                  {
                  ctor: '_Tuple2',
                  _0: 'is-animating',
                  _1: !eq(
                    model.animation,
                    _debois$elm_mdl$Material_Ripple$Frame(0))
                },
                  {
                  ctor: '_Tuple2',
                  _0: 'is-visible',
                  _1: !eq(model.animation, {ctor: 'Inert'})
                }
                ])),
              styling
            ]),
          fromArray(
            []))
        ]));
  };

var _debois$elm_mdl$Material_Ripple$Tick = {ctor: 'Tick'};
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
var _debois$elm_mdl$Material_Ripple$update = F2(
  function (action, model) {
    var _p4 = action;
    switch (_p4.ctor) {
      case 'Down':
        var _p5 = _p4._0;
        return (eq(_p5.type$, 'mousedown') && model.ignoringMouseDown) ? (
          update(
            model,
            {ignoringMouseDown: false})) : A2(
          _debois$elm_mdl$Material_Helpers$effect,
          _debois$elm_mdl$Material_Helpers$cssTransitionStep(_debois$elm_mdl$Material_Ripple$Tick),
          update(
            model,
            {
              animation: _debois$elm_mdl$Material_Ripple$Frame(0),
              metrics: _debois$elm_mdl$Material_Ripple$computeMetrics(_p5),
              ignoringMouseDown: eq(_p5.type$, 'touchstart') ? true : model.ignoringMouseDown
            }))._0;
      case 'Up':
        return (
          update(
            model,
            {animation: {ctor: 'Inert'}}));
      default:
        return (model)

    }
  });
var _debois$elm_mdl$Material_Ripple$upOn = function (name) {
  return A2(
    _elm_lang$virtual_dom$VirtualDom$on,
    name,
    {
      ctor: '<decoder>',
      tag: 'succeed',
      msg: {ctor: 'Up'}
    });
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
    return _elm_lang$virtual_dom$VirtualDom$on(
      name)(
        function (value) {
          return viewLift({ctor: 'Down', _0: geometryDecoder(value)});
        }
        )
  };
var _debois$elm_mdl$Material_Button$blurAndForward = function (event) {
  return A2(
    _elm_lang$html$Html_Attributes$attribute,
    A2(append, 'on', event),
    'this.blur(); (function(self) { var e = document.createEvent(\'Event\'); e.initEvent(\'touchcancel\', true, true); self.lastChild.dispatchEvent(e); }(this));');
};

var viewLift = function (msg) {
        return function (c) {
                var model = c._0 || {animation: {ctor: 'Inert'}, metrics: {ctor: "Nothing"}, ignoringMouseDown: false}
                c._0 = _debois$elm_mdl$Material_Ripple$update(msg)(model);
                return  c
        }

    }
let buttonAttrs = fromArray(
  [

    _debois$elm_mdl$Material_Ripple$downOn$('mousedown'),

    _debois$elm_mdl$Material_Ripple$downOn$('touchstart'),

    _debois$elm_mdl$Material_Button$blurAndForward('mouseup'),

    _debois$elm_mdl$Material_Button$blurAndForward('mouseleave'),

    _debois$elm_mdl$Material_Button$blurAndForward('touchend'),

    {"key":"className","value":"mdl-js-ripple-effect mdl-js-button mdl-button mdl-button--raised"}
    ])

var _debois$elm_mdl$Material_Button$view = (
  function (model) {
    var node = _debois$elm_mdl$Material_Ripple$view$(model)

    return button(buttonAttrs)(
            fromArray(
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
            ])
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
