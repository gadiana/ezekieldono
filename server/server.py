"""
Local development server (Python standard library only).

Serves the portfolio at http://localhost:8000 so the browser allows
microphone access for Aiko's voice mode while testing locally.

Run:
    python server/server.py
"""
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = int(os.environ.get("PORT", "8000"))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def do_GET(self):
        if self.path.startswith("/server"):  # don't serve the server's own source
            return self.send_error(404)
        return super().do_GET()


if __name__ == "__main__":
    print(f"Portfolio running at http://localhost:{PORT}  (Ctrl+C to stop)")
    ThreadingHTTPServer(("", PORT), Handler).serve_forever()
