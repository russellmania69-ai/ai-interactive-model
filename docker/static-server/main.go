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
    fileHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("X-Content-Type-Options", "nosniff")
        w.Header().Set("X-Frame-Options", "DENY")
        w.Header().Set("Referrer-Policy", "no-referrer")
        fs.ServeHTTP(w, r)
    })

    mux := http.NewServeMux()
    // Health endpoint used by CI
    mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodGet {
            http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
            return
        }
        w.WriteHeader(http.StatusOK)
        _, _ = w.Write([]byte("OK"))
    })
    mux.Handle("/", fileHandler)

    addr := ":" + *port
    log.Printf("serving %s on http://%s\n", *root, addr)
    if err := http.ListenAndServe(addr, mux); err != nil {
        log.Fatal(err)
    }
}
