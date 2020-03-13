#!/usr/bin/env python2.7

import SimpleHTTPServer
import SocketServer
from signal import signal, SIGPIPE, SIG_DFL

#Ignore SIG_PIPE and don't throw exceptions on it... (http://docs.python.org/library/signal.html)
signal(SIGPIPE,SIG_DFL)


PORT = 8000

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    '.mjs': 'application/javascript',
});

httpd = SocketServer.TCPServer(("", PORT), Handler)

print "serving at port", PORT
httpd.serve_forever()
