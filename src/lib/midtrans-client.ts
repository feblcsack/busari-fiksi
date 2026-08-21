// Client-safe Midtrans constants.
//
// IMPORTANT: This file must never import Node-only modules (e.g. "crypto").
// It's imported from client components ("use client"), and bundling a
// Node built-in into the browser bundle will break the production build.
// Server-only logic (creating transactions, verifying webhook signatures)
// lives in "@/lib/midtrans" instead.

export const MIDTRANS_IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"

// Sandbox and Production Snap.js are served from DIFFERENT hosts. Loading
// the wrong one is the #1 cause of "checkout works in dev, breaks in prod."
export const MIDTRANS_SNAP_JS_URL = MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js"
