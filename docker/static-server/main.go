package main

import (
    "flag"
    "log"
    "net/http"
    "os"
    "path/filepath"
)

func main() {
    root := flag.String("root", "/app/dist", "root directory to serve")
    port := flag.String("port", "8080", "port to listen on")
    health := flag.Bool("health-check", false, "run a healthcheck and exit 0 if healthy")
    flag.Parse()

    if *health {
        // simple health check: index.html exists and is non-empty
        p := filepath.Join(*root, "index.html")
        if fi, err := os.Stat(p); err == nil && fi.Size() > 0 {
            os.Exit(0)
        }
        os.Exit(1)
    }

    fs := http.FileServer(http.Dir(*root))
    handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("X-Content-Type-Options", "nosniff")
        w.Header().Set("X-Frame-Options", "DENY")
        w.Header().Set("Referrer-Policy", "no-referrer")
        fs.ServeHTTP(w, r)
    })

    addr := ":" + *port
    log.Printf("serving %s on http://%s\n", *root, addr)
    if err := http.ListenAndServe(addr, handler); err != nil {
        log.Fatal(err)
    }
}
