// Node.js polyfills
import * as process from 'process';
import { Buffer } from 'buffer';

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = Buffer;

// Stream polyfill
import * as streamBrowserify from 'stream-browserify';
(window as any).Stream = streamBrowserify;
(window as any).stream = streamBrowserify;