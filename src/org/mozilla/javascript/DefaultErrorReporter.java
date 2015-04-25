/* -*- Mode: java; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.mozilla.javascript;

/**
 * This is the default error reporter for JavaScript.
 *
 * @author Norris Boyd
 */
class DefaultErrorReporter implements ErrorReporter
{
    static final DefaultErrorReporter instance = new DefaultErrorReporter();

    private boolean forEval;
    private ErrorReporter chainedReporter;

    private DefaultErrorReporter() { }

    static ErrorReporter forEval(ErrorReporter reporter)
    {
        DefaultErrorReporter r = new DefaultErrorReporter();
        r.forEval = true;
        r.chainedReporter = reporter;
        return r;
    }

    public void warning(String message, String sourceURI, int line,
                        String lineText, int lineOffset)
    {
        if (chainedReporter != null) {
            chainedReporter.warning(
                message, sourceURI, line, lineText, lineOffset);
        } else {
            // Do nothing
        }
    }

    public void error(String message, String sourceURI, int line,
                      String lineText, int lineOffset)
    {
        if (forEval) {
            // Assume error message strings that start with "TypeError: "
            // should become TypeError exceptions. A bit of a hack, but we
            // don't want to change the ErrorReporter interface.
            TopLevel.NativeErrors error = TopLevel.NativeErrors.SyntaxError;
            final String DELIMETER = ": ";
            final String prefix = TopLevel.NativeErrors.TypeError.name() + DELIMETER;
            if (message.startsWith(prefix)) {
                error = TopLevel.NativeErrors.TypeError;
                message = message.substring(prefix.length());
            }
            throw ScriptRuntime.constructError(error, message, sourceURI,
                                               line, lineText, lineOffset);
        }
        if (chainedReporter != null) {
            chainedReporter.error(
                message, sourceURI, line, lineText, lineOffset);
        } else {
            throw runtimeError(
                message, sourceURI, line, lineText, lineOffset);
        }
    }

    public EvaluatorException runtimeError(String message, String sourceURI,
                                           int line, String lineText,
                                           int lineOffset)
    {
        if (chainedReporter != null) {
            return chainedReporter.runtimeError(
                message, sourceURI, line, lineText, lineOffset);
        } else {
            return new EvaluatorException(
                message, sourceURI, line, lineText, lineOffset);
        }
    }
}
