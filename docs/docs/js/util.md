<div class="stability">
  <span class="badge ios green"> </span>
  <span class="badge android green"> </span>
</div>

<!-- toc -->

# Utilities

The `util` module is primarily designed to support the needs of internal APIs.  Many of these utilities are useful for your own
programs.  If you find that these functions are lacking for your
purposes, however, you are encouraged to write your own utilities.

Use `require('util')` to access them.

## util.format(format[, ...])

Returns a formatted string using the first argument as a `printf`-like format.

The first argument is a string that contains zero or more *placeholders*.
Each placeholder is replaced with the converted value from its corresponding
argument. Supported placeholders are:

* `%s` - String.
* `%d` - Number (both integer and float).
* `%j` - JSON.  Replaced with the string `'[Circular]'` if the argument
contains circular references.
* `%%` - single percent sign (`'%'`). This does not consume an argument.

If the placeholder does not have a corresponding argument, the placeholder is
not replaced.

```js
util.format('%s:%s', 'foo'); // 'foo:%s'
```

If there are more arguments than placeholders, the extra arguments are
coerced to strings (for objects and symbols, `util.inspect()` is used)
and then concatenated, delimited by a space.

```js
util.format('%s:%s', 'foo', 'bar', 'baz'); // 'foo:bar baz'
```

If the first argument is not a format string then `util.format()` returns
a string that is the concatenation of all its arguments separated by spaces.
Each argument is converted to a string with `util.inspect()`.

```js
util.format(1, 2, 3); // '1 2 3'
```

## util.inherits(constructor, superConstructor)

Inherit the prototype methods from one [constructor][] into another.  The
prototype of `constructor` will be set to a new object created from
`superConstructor`.

As an additional convenience, `superConstructor` will be accessible
through the `constructor.super_` property.

```js
const util = require('util');
const EventEmitter = require('events');

function MyStream() {
    EventEmitter.call(this);
}

util.inherits(MyStream, EventEmitter);

MyStream.prototype.write = function(data) {
    this.emit('data', data);
}

var stream = new MyStream();

console.log(stream instanceof EventEmitter); // true
console.log(MyStream.super_ === EventEmitter); // true

stream.on('data', (data) => {
  console.log(`Received data: "${data}"`);
})
stream.write('It works!'); // Received data: "It works!"
```

## util.inspect(object[, options])

Return a string representation of `object`, which is useful for debugging.

An optional *options* object may be passed that alters certain aspects of the
formatted string:

 - `showHidden` - if `true` then the object's non-enumerable and symbol
   properties will be shown too. Defaults to `false`.

 - `depth` - tells `inspect` how many times to recurse while formatting the
   object. This is useful for inspecting large complicated objects. Defaults to
   `2`. To make it recurse indefinitely pass `null`.

 - `colors` - if `true`, then the output will be styled with ANSI color codes.
   Defaults to `false`. Colors are customizable, see [Customizing
   `util.inspect` colors][].

 - `customInspect` - if `false`, then custom `inspect(depth, opts)` functions
   defined on the objects being inspected won't be called. Defaults to `true`.

Example of inspecting all properties of the `util` object:

```js
const util = require('util');

console.log(util.inspect(util, { showHidden: true, depth: null }));
```

Values may supply their own custom `inspect(depth, opts)` functions, when
called they receive the current depth in the recursive inspection, as well as
the options object passed to `util.inspect()`.

### Customizing `util.inspect` colors

<!-- type=misc -->

Color output (if enabled) of `util.inspect` is customizable globally
via `util.inspect.styles` and `util.inspect.colors` objects.

`util.inspect.styles` is a map assigning each style a color
from `util.inspect.colors`.
Highlighted styles and their default values are:
 * `number` (yellow)
 * `boolean` (yellow)
 * `string` (green)
 * `date` (magenta)
 * `regexp` (red)
 * `null` (bold)
 * `undefined` (grey)
 * `special` - only function at this time (cyan)
 * `name` (intentionally no styling)

Predefined color codes are: `white`, `grey`, `black`, `blue`, `cyan`,
`green`, `magenta`, `red` and `yellow`.
There are also `bold`, `italic`, `underline` and `inverse` codes.

### Custom `inspect()` function on Objects

<!-- type=misc -->

Objects also may define their own `inspect(depth)` function which `util.inspect()`
will invoke and use the result of when inspecting the object:

```js
const util = require('util');

var obj = { name: 'nate' };
obj.inspect = function(depth) {
  return `{${this.name}}`;
};

util.inspect(obj);
  // "{nate}"
```

You may also return another Object entirely, and the returned String will be
formatted according to the returned Object. This is similar to how
`JSON.stringify()` works:

```js
var obj = { foo: 'this will not show up in the inspect() output' };
obj.inspect = function(depth) {
  return { bar: 'baz' };
};

util.inspect(obj);
  // "{ bar: 'baz' }"
```

## util.isArray(object)

Internal alias for [`Array.isArray`][].

Returns `true` if the given "object" is an `Array`. Otherwise, returns `false`.

```js
const util = require('util');

util.isArray([])
  // true
util.isArray(new Array)
  // true
util.isArray({})
  // false
```

## util.isBoolean(object)

Returns `true` if the given "object" is a `Boolean`. Otherwise, returns `false`.

```js
const util = require('util');

util.isBoolean(1)
  // false
util.isBoolean(0)
  // false
util.isBoolean(false)
  // true
```

## util.isDate(object)

Returns `true` if the given "object" is a `Date`. Otherwise, returns `false`.

```js
const util = require('util');

util.isDate(new Date())
  // true
util.isDate(Date())
  // false (without 'new' returns a String)
util.isDate({})
  // false
```

## util.isError(object)

Returns `true` if the given "object" is an [`Error`][]. Otherwise, returns
`false`.

```js
const util = require('util');

util.isError(new Error())
  // true
util.isError(new TypeError())
  // true
util.isError({ name: 'Error', message: 'an error occurred' })
  // false
```

Note that this method relies on `Object.prototype.toString()` behavior. It is
possible to obtain an incorrect result when the `object` argument manipulates
`@@toStringTag`.

```js
// This example requires the `--harmony-tostring` flag
const util = require('util');
const obj = { name: 'Error', message: 'an error occurred' };

util.isError(obj);
  // false
obj[Symbol.toStringTag] = 'Error';
util.isError(obj);
  // true
```

## util.isFunction(object)

Returns `true` if the given "object" is a `Function`. Otherwise, returns
`false`.

```js
const util = require('util');

function Foo() {}
var Bar = function() {};

util.isFunction({})
  // false
util.isFunction(Foo)
  // true
util.isFunction(Bar)
  // true
```

## util.isNull(object)

Returns `true` if the given "object" is strictly `null`. Otherwise, returns
`false`.

```js
const util = require('util');

util.isNull(0)
  // false
util.isNull(undefined)
  // false
util.isNull(null)
  // true
```

## util.isNullOrUndefined(object)

Returns `true` if the given "object" is `null` or `undefined`. Otherwise,
returns `false`.

```js
const util = require('util');

util.isNullOrUndefined(0)
  // false
util.isNullOrUndefined(undefined)
  // true
util.isNullOrUndefined(null)
  // true
```

## util.isNumber(object)

Returns `true` if the given "object" is a `Number`. Otherwise, returns `false`.

```js
const util = require('util');

util.isNumber(false)
  // false
util.isNumber(Infinity)
  // true
util.isNumber(0)
  // true
util.isNumber(NaN)
  // true
```

## util.isObject(object)

Returns `true` if the given "object" is strictly an `Object` __and__ not a
`Function`. Otherwise, returns `false`.

```js
const util = require('util');

util.isObject(5)
  // false
util.isObject(null)
  // false
util.isObject({})
  // true
util.isObject(function(){})
  // false
```

## util.isPrimitive(object)

Returns `true` if the given "object" is a primitive type. Otherwise, returns
`false`.

```js
const util = require('util');

util.isPrimitive(5)
  // true
util.isPrimitive('foo')
  // true
util.isPrimitive(false)
  // true
util.isPrimitive(null)
  // true
util.isPrimitive(undefined)
  // true
util.isPrimitive({})
  // false
util.isPrimitive(function() {})
  // false
util.isPrimitive(/^$/)
  // false
util.isPrimitive(new Date())
  // false
```

## util.isRegExp(object)

Returns `true` if the given "object" is a `RegExp`. Otherwise, returns `false`.

```js
const util = require('util');

util.isRegExp(/some regexp/)
  // true
util.isRegExp(new RegExp('another regexp'))
  // true
util.isRegExp({})
  // false
```

## util.isString(object)

Returns `true` if the given "object" is a `String`. Otherwise, returns `false`.

```js
const util = require('util');

util.isString('')
  // true
util.isString('foo')
  // true
util.isString(String('foo'))
  // true
util.isString(5)
  // false
```

## util.isUndefined(object)

Returns `true` if the given "object" is `undefined`. Otherwise, returns `false`.

```js
const util = require('util');

var foo;
util.isUndefined(5)
  // false
util.isUndefined(foo)
  // true
util.isUndefined(null)
  // false
```

## util._extend(obj)

`_extend` isn't meant to be used used outside of internal modules.

[`Array.isArray`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
[constructor]: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/constructor
[Customizing `util.inspect` colors]: #customizing-utilinspect-colors
[here]: #customizing-utilinspect-colors
[`Error`]: errors.html#errors_class_error
[`console.log()`]: console.html#console_console_log_data
[`console.error()`]: console.html#console_console_error_data
[`Buffer.isBuffer()`]: buffer.html#buffer_class_method_buffer_isbuffer_obj
