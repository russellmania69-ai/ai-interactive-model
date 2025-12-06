import React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [details, setDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    const verify = async () => {
      setStatus("loading");
      setErrorMsg(null);
      try {
        const { data, error } = await supabase.functions.invoke("verify-stripe-session", {
          body: JSON.stringify({ sessionId }),
        });

        if (error) throw error;
        if (!data) throw new Error("No response from verification function");

        if (!cancelled) {
          setDetails(data);
          setStatus("success");
        }
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err?.message || String(err) || "Failed to verify payment session");
          setStatus("error");
        }
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 rounded-lg border border-border bg-card shadow-md animate-slide-in max-w-xl">
        <h1 className="text-3xl font-bold mb-4 text-primary">Payment Successful</h1>

        {!sessionId && (
          <>
            <p className="mb-6 text-card-foreground">Payment completed.</p>
            <a
              href="/"
              className="inline-block px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition"
            >
              Return to Home
            </a>
          </>
        )}

        {sessionId && status === "loading" && (
          <p className="mb-4 text-card-foreground">Verifying payment... please wait.</p>
        )}

        {sessionId && status === "error" && (
          <>
            <p className="mb-4 text-red-600">There was a problem verifying your payment.</p>
            <p className="mb-4 text-sm text-muted-foreground">{errorMsg}</p>
            <p className="mb-4 text-sm text-muted-foreground">If this persists, contact support@example.com with your session ID.</p>
            <p className="mb-4 text-sm text-muted-foreground break-words">Session ID: <span className="font-mono">{sessionId}</span></p>
            <a
              href="/"
              className="inline-block px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition"
            >
              Return to Home
            </a>
          </>
        )}

        {sessionId && status === "success" && (
          <>
            <p className="mb-4 text-card-foreground">Thank you! Your payment was completed successfully.</p>
            <div className="mb-4 text-sm text-muted-foreground text-left">
              {details?.customer_email && (
                <div>
                  <strong>Email:</strong> {details.customer_email}
                </div>
              )}
              {details?.amount_total && (
                <div>
                  <strong>Amount:</strong> ${(details.amount_total / 100).toFixed(2)} {details.currency?.toUpperCase()}
                </div>
              )}
              {details?.payment_status && (
                <div>
                  <strong>Payment Status:</strong> {details.payment_status}
                </div>
              )}
              <div className="break-words mt-2">
                <strong>Session ID:</strong> <span className="font-mono">{sessionId}</span>
              </div>
            </div>
            <a
              href="/"
              className="inline-block px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition"
            >
              Return to Home
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
