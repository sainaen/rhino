package org.mozilla.javascript.tests.harmony;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.drivers.LanguageVersion;
import org.mozilla.javascript.drivers.RhinoTest;
import org.mozilla.javascript.drivers.ScriptTestsBase;

@RhinoTest("testsrc/jstests/harmony/arrow-functions.js")
@LanguageVersion(Context.VERSION_1_8)
public class ArrowFunctionsTest extends ScriptTestsBase {
}
