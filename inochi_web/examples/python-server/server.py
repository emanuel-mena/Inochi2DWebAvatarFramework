#!/usr/bin/env python3
"""Serve the inochi_web example app with a reliable WebAssembly MIME type."""

from __future__ import annotations

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HOST = "127.0.0.1"
PORT = 8080
APP_DIR = Path(__file__).resolve().parent / "app"


class WasmStaticHandler(SimpleHTTPRequestHandler):
    """Static handler that always serves .wasm as application/wasm."""

    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".wasm": "application/wasm",
    }


def main() -> None:
    if not APP_DIR.is_dir():
        raise SystemExit(f"App directory not found: {APP_DIR}")

    handler = partial(WasmStaticHandler, directory=str(APP_DIR))

    with ThreadingHTTPServer((HOST, PORT), handler) as httpd:
        print(f"Serving inochi_web example from {APP_DIR}")
        print(f"Open: http://{HOST}:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == "__main__":
    main()
