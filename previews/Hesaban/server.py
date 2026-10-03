import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = os.getcwd()

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        try:
            return super().do_GET()
        except:
            self.path = '/index.html'
            return super().do_GET()

socketserver.TCPServer.allow_reuse_address = True

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"\n🚀 حسابان (Accounting Suite v3.3) - حالت فاینال\n")
        print(f"📱 مرورگر خود را باز کنید: http://localhost:{PORT}")
        print(f"🛡️ سرویس ورکر و PWA کاملاً فعال هستند.\n")
        print("⚠️  برای توقف سرور، کلیدهای Ctrl + C را فشار دهید.\n")
        httpd.serve_forever()
