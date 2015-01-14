load("testsrc/assert.js");

(function () {
    // arrow functions in direct eval code

    function f(s) {
        var a = 2;
        return eval(s);
    }

    var c = f("k => a + k");  // closure should see "a"
    assertEquals(c(3), 5);
})();

(function () {
    // arrow functions have a .length property like ordinary functions

    assertEquals((a => a).hasOwnProperty("length"), true);

    assertEquals((a => a).length, 1);
    assertEquals((() => 0).length, 0);
    assertEquals(((a) => 0).length, 1);
    assertEquals(((a, b) => 0).length, 2);
})();

(function () {
    // arrow functions may have empty arguments

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
    // body of an arrow function could be any AssignmentExpression
    // section 14.2

    var a = 10, b = 20, c = 0;
    var f = () => c = a + b;
    assertEquals(f(), c);
    assertEquals(c, a + b);
})();

(function () {
    // body of an arrow function could be FunctionBody within curly braces
    // section 14.2

    var a = 10, b = 20, c = 0;
    var f = () => { return c = a + b };
    assertEquals(f(), c);
    assertEquals(c, a + b);
})();

(function () {
    // arrow function's FunctionBody could contain "var", "const" or "let" declarations
    // section 14.2

    var f = (a) => {
        var b = 2;
        let c = 3;
        const d = 4;
        return a + b + c + d;
    };
    assertEquals(f(1), 1 + 2 + 3 + 4);
})();

(function () {
    // it's a SyntaxError to have LineTerminator between ArrowParameters and an arrow token ("=>")
    // section 14.2
    // FIXME: doesn't work
    //assertThrows(eval("a \n => a"), SyntaxError);
})();

(function () {
    // it's a SyntaxError if there's "let" or "const" variable (LexicalDeclarations),
    // or class declaration (ClassDeclaration) inside arrow function
    // with the same name as one of the arguments
    // section 14.2.1
    // FIXME: doesn't work
    //assertThrows(eval("(a => { let a = 10; })"), SyntaxError);
    //assertThrows(eval("(a => { const a = 10; })"), SyntaxError);

    // but not with "var" (VariableStatement) or functions declaration (HoistableDeclaration)
    assertEquals(eval("(a => { var a = 10; return a; })")(20), 10);
    assertEquals(eval("(a => { function a() { return 10 }; return a(); })")(20), 10);
})();

(function () {
    // arrow function doesn't have its own "arguments" binding
    // section 14.2.17

    var arguments = [1, 2];
    var f = () => arguments;
    assertEquals(f(true, false), arguments);
})();

(function () {
    // arrow function captures "arguments" of an enclosing function
    // section 14.2.17

    function f(a) {
        return (b) => arguments;
    }
    var args = f(10)(20);
    assertEquals(args[0], 10);
    assertEquals(args.length, 1);
    assertEquals(args.callee, f);
})();

(function () {
    // arrow right-associativity

    var t = a => b => a;
    assertEquals(t("A")("B"), "A");

    var curry = f => a => b => f(a, b);
    var curried_atan2 = curry(Math.atan2);
    assertEquals(curried_atan2(0)(1), 0);
})();

(function () {
    // arrow right-associativity with =

    var a, b, c;
    a = b = c => a = b = c;
    assertEquals(a, b);
    a(13);
    assertEquals(b, 13);
    assertEquals(a, 13);
})();

(function () {
    // arrow right-associativity with +=
    var s = "";
    s += x => x.name;
    assertEquals(s, "\nx => x.name\n");
    // FIXME: in original Mozilla's test, "\n"-s aren't expected
    //assertEquals(s, "x => x.name");

})();

(function () {
    // arrow function implicitly returns object only if it's enclosed in parenthesis
    // see discussion: https://esdiscuss.org/topic/x-foo-bar

    var f = x => ({foo: x}); // object literal (function f(x) { return {foo: x}; })
    assertEquals(typeof f(10), "object");
    assertEquals(f(10).foo, 10);

    var g = () => ({}); // empty object literal (function f(x) { return {}; })
    assertEquals(typeof g(), "object");

    var h = x => {foo: x}; // function body with the label "foo" (function h(x) { foo: x; }
    assertEquals(h(10), undefined);

    var n = x => {}; // empty function body (function g(x) {})
    assertEquals(n(10), undefined);
})();

(function () {
    // block arrow functions don't return the last expression-statement value automatically

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
    // arrow functions are not constructors

    var f = a => { this.a = a; };
    assertThrows(() => new f, TypeError);
    assertThrows(() => new f(1, 2), TypeError);
})();

(function () {
    // || binds tighter than =>

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
    // funny case that looks kind of like default arguments, but isn't

    var f = (msg="hi", w=win => w.foo(1, 2));  // sequence expression
    assertEquals(msg, "hi");
    assertEquals(typeof w, "function");
    assertEquals(f, w);
})();

(function () {
    // the typeof an arrow function is "function"

    assertEquals(typeof (() => 1), "function");
    assertEquals(typeof (a => { return a + 1; }), "function");
})();

(function () {
    // map(x => x, 32) is two arguments, not one

    assertEquals("" + [1, 2, 3, 4].map(x => x, 32), "1,2,3,4");
})();

(function () {
    // the prototype of an arrow function is Function.prototype

    assertEquals(Object.getPrototypeOf(a => a), Function.prototype);
    assertEquals(Object.getPrototypeOf(() => {}), Function.prototype);
})();

(function () {
    // arrow functions do not have a .prototype property

    assertEquals("prototype" in (a => a), false);
    assertEquals("prototype" in (() => {}), false);
})();

(function () {
    // arrow functions are not implicitly strict-mode code

    var f = a => { with (a) return f(); };
    assertEquals(f({f: () => 7}), 7);

    f = a => function () { with (a) return f(); };
    assertEquals(f({f: () => 7})(), 7);
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
    // check that we correctly throw SyntaxErrors for various syntactic near-misses

    var mistakes = [
        "((a)) => expr",
        "a + b => a",
        "'' + a => a",
        // FIXME: parameters destructuring shouldn't work without parenthesis
        //"[x] => x",
        //"([x] => x)",
        //"{p: p} => p",
        //"({p: p} => p)",
        //"{p} => p",
        "1 || a => a",
        "'use strict' => {}",
        // FIXME: strict mode declared inside the function doesn't affect its arguments
        //"package => {'use strict';}",    // tricky: FutureReservedWord in strict mode code only
        //"arguments => { 'use strict'; return 0; }",
        //"eval => { 'use strict'; return 0; }",
        "'use strict'; arguments => 0",  // names banned in strict mode code
        "'use strict'; eval => 0",
        "a => {'use strict'; with (a) return x; }",
        "a => yield a",
        "a => { yield a; }",
        "a => { { let x; yield a; } }",
        "for (;;) a => { break; };",
        "for (;;) a => { continue; };",
        // FIXME: doesn't work (see bug https://bugzilla.mozilla.org/show_bug.cgi?id=1101265)
        //"1\n) => a",
        "(1) => 1",
        "1 => 1",
        "(a => a",
        "a) => a"
    ];

    for (var i in mistakes) {
        assertThrows(function () { Function(mistakes[i]); }, SyntaxError);
    }

    // check that the tricky case is not an error in non-strict-mode code
    var f = package => 0;
    assertEquals(f(1), 0);
})();

(function () {
    // "this" is lexically scoped in arrow functions

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
    // "this" is lexically scoped in direct eval code in arrow functions

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
    // "this" is lexically scoped in arrow functions in direct eval code

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

// "this" in a toplevel arrow is the global object
var f = () => this;
(function () {
    assertEquals(f(), this);
    assertEquals({f: f}.f(), this);
}).call(this);

(function () {
    // "this" is lexically scoped, and so cannot be changed
    // with usual "call()", "apply()" or "bind()" methods

    var f = function (ctx) {
        return (function () {
            return x => this.id + x;
        }).call(ctx);
    };
    var o1 = {id: 1};
    var o2 = {id: 2};
    assertEquals(f(o1)(1), o1.id + 1);
    assertEquals(f(o1).call(o2, 1), o1.id + 1);
    assertEquals(f(o1).apply(o2, [1]), o1.id + 1);
    assertEquals(f(o1).bind(o2)(1), o1.id + 1);
    assertEquals(f(o1).bind(o2, 1)(), o1.id + 1);
})();

(function () {
    // arrow functions can have primitive "this" values

    // FIXME: doesn't work
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
    // eval expressions in arrow functions use the correct "this" value

    function Dog(name) {
        this.name = name;
        this.getName = () => eval("this.name");
        this.getNameHard = () => eval("(() => this.name)()");
    }

    var d = new Dog("Max");
    assertEquals(d.getName(), d.name);
    assertEquals(d.getNameHard(), d.name);
})();

"success";
