load("testsrc/assert.js");

(function () {
    // arrow function doesn't have an 'arguments' binding

    var arguments = [1, 2];
    var f = () => arguments;
    assertEquals(f(true, false), arguments);
})();

(function () {
    // arrow function captures 'arguments' of an enclosing function

    function f(a) {
        return (b) => arguments;
    }
    var args = f(10)(20);
    assertEquals(args[0], 10);
    assertEquals(args.length, 1);
    assertEquals(args.callee, f);
})();

(function () {
    // 'arguments' is banned in a function with a rest param,
    // even nested in an arrow-function parameter default value
    // FIXME: ignored, doesn't work now (no rest param in Rhino)
    //var mistakes = [
    //    "(...rest) => arguments",
    //    "(...rest) => (x=arguments) => 0",
    //    "function f(...rest) { return (x=arguments) => 0; }",
    //    "function f(...rest) { return (x=(y=arguments) => 1) => 0; }",
    //];
    //
    //for (var s of mistakes)
    //    assertThrows(function () { eval(s); }, SyntaxError);
})();

(function () {
    // Arrow right-associativity.

    var t = a => b => a;
    assertEquals(t("A")("B"), "A");

    var curry = f => a => b => f(a, b);
    var curried_atan2 = curry(Math.atan2);
    assertEquals(curried_atan2(0)(1), 0);
})();

(function () {
    // Arrow right-associativity with =

    var a, b, c;
    a = b = c => a = b = c;
    assertEquals(a, b);
    a(13);
    assertEquals(b, 13);
    assertEquals(a, 13);
})();

(function () {
    // Arrow right-associativity with +=
    var s = "";
    s += x => x.name;
    assertEquals(s, "\nx => x.name\n");
    // FIXME: in original Mozilla's test, '\n'-s aren't expected
    //assertEquals(s, "x => x.name");

})();

(function () {
    // Braces after => indicate a block body as opposed to an expression body.

    var f = () => {};
    assertEquals(f(), undefined);
    var g = () => ({});
    assertEquals(typeof g(), "object");
})();

(function () {
    // Block arrow functions don't return the last expression-statement value automatically.

    var f = a => { a + 1; };
    assertEquals(f(0), undefined);
})();

(function () {
    // Church booleans

    var True = t => f => t;
    var False = t => f => f;
    var bool_to_str = b => b("True")("False");
    var And = a => b => a(b)(a);
    var Or = a => b => a(a)(b);

    assertEquals(And(True)(True), True);
    assertEquals(And(True)(False), False);
    assertEquals(And(False)(True), False);
    assertEquals(And(False)(False), False);

    assertEquals(Or(True)(True), True);
    assertEquals(Or(True)(False), True);
    assertEquals(Or(False)(True), True);
    assertEquals(Or(False)(False), False);
})();

(function () {
    // Church-Peano integers

    var Zero = f => x => x;
    var Succ = n => f => x => n(f)(f(x));
    var Add = a => b => f => x => a(f)(b(f)(x));
    var Mul = a => b => f => x => a(b(f))(x);
    var Exp = a => b => b(a);

    var n = f => f(k => k + 1)(0);

    assertEquals(n(Zero), 0);
    assertEquals(n(Succ(Zero)), 1);
    assertEquals(n(Succ(Succ(Zero))), 2);

    var Three = Succ(Succ(Succ(Zero)));
    var Five = Succ(Succ(Three));
    assertEquals(n(Add(Three)(Five)), 8);
    assertEquals(n(Mul(Three)(Five)), 15);
    assertEquals(n(Exp(Three)(Five)), 243);
})();

(function () {
    // Arguments with default parameters can shadow const locals.
    // FIXME: ignored, doesn't work now (no default parameter values in Rhino)
    //"use strict";
    //function f() {
    //    const x = 1;
    //    return (x = 0) => x;
    //}
    //
    //var g = f();
    //assertEquals(g(), 0);
})();

(function () {
    // Arrow functions are not constructors.

    var f = a => { this.a = a; };
    assertThrows(() => new f, TypeError);
    assertThrows(() => new f(1, 2), TypeError);
})();

(function () {
    // Arrow functions in direct eval code.

    function f(s) {
        var a = 2;
        return eval(s);
    }

    var c = f("k => a + k");  // closure should see 'a'
    assertEquals(c(3), 5);
})();

(function () {
    // Arrow functions have a .length property like ordinary functions.

    assertEquals((a => a).hasOwnProperty("length"), true);

    assertEquals((a => a).length, 1);
    assertEquals((() => 0).length, 0);
    assertEquals(((a) => 0).length, 1);
    assertEquals(((a, b) => 0).length, 2);

    //FIXME: rest param and default param values are not supported yet
    //assertEquals(((...arr) => arr).length, 0);
    //assertEquals(((a=1, b=2) => 0).length, 0);
})();

(function () {
    // Arrow functions may have empty arguments

    var f = () => "x";
    assertEquals(f.length, 0);
    assertEquals(f(), "x");
    assertEquals(f(0, 1, 2, 3, 4, 5, 6, 7, 8, 9), "x");
})();

(function () {
    // (a) => expr

    var f = (a) => 2 * a;  // parens are allowed
    assertEquals(f(12), 24);
    var g = (a, b) => a + b;
    assertEquals([1, 2, 3, 4, 5].reduce(g), 15);
})();

(function () {
    // Parameter default values work in arrow functions
    // FIXME: ignored, doesn't work now (no default parameter values in Rhino)
    //var f = (a=0) => a + 1;
    //assertEquals(f(), 1);
    //assertEquals(f(50), 51);
})();

(function () {
    // Parameter default values work in arrow functions
    // FIXME: ignored, doesn't work now (no default parameter values in Rhino)
    //var f = (a=1, b=2, ...rest) => [a, b, rest];
    //assertEquals(f().toSource(), "[1, 2, []]");
    //assertEquals(f(0, 0).toSource(), "[0, 0, []]");
    //assertEquals(f(0, 1, 1, 2, 3, 5).toSource(), "[0, 1, [1, 2, 3, 5]]");
})();

(function () {
    // Rest parameters are allowed in arrow functions.
    // FIXME: ignored, doesn't work now (no rest parameters in Rhino)
    //var A = (...x) => x;
    //assertEquals(A().toSource(), "[]");
    //assertEquals("" + A(3, 4, 5), "3,4,5");
})();

(function () {
    // Rest parameters work in arrow functions
    // FIXME: ignored, doesn't work now (no rest parameters in Rhino)
    //var f = (a, b, ...rest) => [a, b, rest];
    //assertEquals(f().toSource(), "[(void 0), (void 0), []]");
    //assertEquals(f(1, 2, 3, 4).toSource(), "[1, 2, [3, 4]]");
})();

(function () {
    // || binds tighter than =>.

    var f;
    f = a => a || "nothing";  // f = ((a => a) || "nothing");
    assertEquals(f.length, 1);
    assertEquals(f(0), "nothing");
    assertEquals(f(1), 1);
})();

(function () {
    // => binds tighter than ,

    var f, g;
    g = (f, h => h + 1);  // sequence expression: (f, (h => h + 1))
    assertEquals(g.length, 1);
    assertEquals(g(37), 38);
})();

(function () {
    // => binds tighter than , (on the other side)

    var h = (a => a, 13);  // sequence expression
    assertEquals(h, 13);
})();

(function () {
    // Funny case that looks kind of like default arguments isn't.
    // FIXME: ignored, doesn't work now (no default parameter values in Rhino)
    //var f = (msg="hi", w=window => w.alert(a, b));  // sequence expression
    //assertEquals(msg, "hi");
    //assertEquals(typeof w, "function");
    //assertEquals(f, w);
})();

(function () {
    // map(x => x, 32) is two arguments, not one

    assertEquals("" + [1, 2, 3, 4].map(x => x, 32), "1,2,3,4");
})();

(function () {
    // The prototype of an arrow function is Function.prototype.

    assertEquals(Object.getPrototypeOf(a => a), Function.prototype);
    assertEquals(Object.getPrototypeOf(() => {}), Function.prototype);
})();

(function () {
    // Arrow functions do not have a .prototype property.

    assertEquals("prototype" in (a => a), false);
    assertEquals("prototype" in (() => {}), false);
})();

(function () {
    // arrow functions are not implicitly strict-mode code

    var f = a => { with (a) return f(); };
    assertEquals(f({f: () => 7}), 7);

    f = a => function () { with (a) return f(); };
    assertEquals(f({f: () => 7})(), 7);

    //FIXME: no default parameter values in Rhino
    //f = (a = {x: 1, x: 2}) => b => { "use strict"; return a.x; };
    //assertEquals(f()(0), 2);
})();

(function () {
    // code in arrow function default arguments is strict if the body is strict
    // FIXME: ignored, doesn't work now (no default parameter values in Rhino)
    //assertThrows(
    //    () => Function("(a = function (obj) { with (obj) f(); }) => { 'use strict'; }"),
    //    SyntaxError);
    //
    //assertThrows(
    //    () => Function("(a = obj => { with (obj) f(); }) => { 'use strict'; }"),
    //    SyntaxError);
})();

(function () {
    // "use strict" is not special as the body of an arrow function without braces.
    // FIXME: ignored, doesn't work now (no default parameter values in Rhino)
    //var f = (a = obj => { with (obj) return x; }) => "use strict";
    //assertEquals(f(), "use strict");
})();

(function () {
    // return from a block function works when there is no other enclosing function

    var f = a => {
        if (a)
            return a + 1;
        throw "FAIL";
    };

    assertEquals(f(1), 2);
})();

(function () {
    // return exits the innermost enclosing arrow (not an enclosing function)

    function f() {
        var g = x => { return !x; };
        return "f:" + g(true);
    }

    assertEquals(f(), "f:false");
})();

(function () {
    // Check that we correctly throw SyntaxErrors for various syntactic near-misses.

    var mistakes = [
        "((a)) => expr",
        "a + b => a",
        "'' + a => a",
        // FIXME: unignore for rest params support
        //"...x",
        //"...rest) =>",
        //"2 + ...rest) =>",
        //"(...x => expr)",
        // FIXME: parameters destructuring shouldn't work without parenthesis
        //"[x] => x",
        //"([x] => x)",
        //"{p: p} => p",
        //"({p: p} => p)",
        //"{p} => p",
        "1 || a => a",
        "'use strict' => {}",
        // FIXME: doesn't work now
        //"package => {'use strict';}",    // tricky: FutureReservedWord in strict mode code only
        "'use strict'; arguments => 0",  // names banned in strict mode code
        "'use strict'; eval => 0",
        "a => {'use strict'; with (a) return x; }",
        "a => yield a",
        "a => { yield a; }",
        "a => { { let x; yield a; } }",
        //"(a = yield 0) => a", FIXME: unignore for default param value support
        "for (;;) a => { break; };",
        "for (;;) a => { continue; };"
    ];

    for (var i in mistakes) {
        assertThrows(function () { Function(mistakes[i]); }, SyntaxError);
    }

    // Check that the tricky case is not an error in non-strict-mode code.
    var f = package => 0;
    assertEquals(f(1), 0);
})();

(function () {
    // 'this' is lexically scoped in arrow functions

    var obj = {
        f: function (expected) {
            assertEquals(this, expected);
            return a => this;
        }
    };

    var g = obj.f(obj);
    assertEquals(g(), obj);

    var obj2 = {f: obj.f};
    var g2 = obj2.f(obj2);
    assertEquals(g2(), obj2);
    assertEquals(g(), obj);
})();

(function () {
    // 'this' is lexically scoped in direct eval code in arrow functions

    var obj = {
        f: function (s) {
            return a => eval(s);
        }
    };

    var g = obj.f("this");
    assertEquals(g(), obj);

    var obj2 = {g: g, fail: true};
    assertEquals(obj2.g(), obj);
})();

(function () {
    // 'this' is lexically scoped in arrow functions in direct eval code

    var obj = {
        f: function (s) {
            return eval(s);
        }
    };

    var g = obj.f("a => this");
    assertEquals(g(), obj);

    var obj2 = {g: g, fail: true};
    assertEquals(obj2.g(), obj);
})();

// 'this' in a toplevel arrow is the global object.
var f = () => this;
(function () {
    assertEquals(f(), this);
    assertEquals({f: f}.f(), this);
}).call(this);

(function () {
    // Arrow functions can have primitive |this| values.

    // FIXME: doesn't work now
    //Number.prototype.foo = function () {
    //    "use strict";
    //    return () => this;
    //};
    //
    //for (var i=0; i<5; i++) {
    //    var n = i.foo()();
    //    assertEquals(typeof n, "number");
    //    assertEquals(n, i);
    //}
})();

(function () {
    // Eval expressions in arrow functions use the correct |this| value.

    function Dog(name) {
        this.name = name;
        this.getName = () => eval("this.name");
        this.getNameHard = () => eval("(() => this.name)()");
    }

    var d = new Dog("Max");
    assertEquals(d.getName(), d.name);
    assertEquals(d.getNameHard(), d.name);
})();

(function () {
    // The typeof an arrow function is "function".

    assertEquals(typeof (() => 1), "function");
    assertEquals(typeof (a => { return a + 1; }), "function");
})();

"success";
