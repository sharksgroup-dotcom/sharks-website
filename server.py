import http.server
import socketserver
import os

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        path = self.path.split('?')[0].lower()
        # Allow browser to cache images and fonts to avoid blank flashes on reload
        if any(path.endswith(ext) for ext in ('.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.ico', '.woff', '.woff2', '.ttf')):
            self.send_header('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
        else:
            # Keep HTML, JS, CSS live without cache so development edits reflect immediately
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    port = 8000
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), NoCacheHTTPRequestHandler) as httpd:
        print(f"Server started on http://localhost:{port} with No-Cache headers active")
        httpd.serve_forever()
