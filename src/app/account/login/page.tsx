import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import AuthForm from "@/components/account/AuthForm";

export const metadata: Metadata = { title: "Sign in" };

/** Server shell; the form reads `?next=` and so must be a client component. */
export default function Page() {
  return (
    <div className="wrap page max-w-[820px]">
      <div className="crumb mute">
        <Link href="/">Home</Link> › Sign in
      </div>
      <h1 className="page-title">Sign in</h1>
      <p className="page-sub">Sign in with your email, username or phone number.</p>

      {/* `useSearchParams` needs a Suspense boundary in the App Router. */}
      <Suspense fallback={<div className="box max-w-[460px]">Loading…</div>}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
