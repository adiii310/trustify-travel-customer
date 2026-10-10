import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import AuthForm from "@/components/account/AuthForm";

export const metadata: Metadata = { title: "Create an account" };

/** Server shell; the form reads `?next=` and so must be a client component. */
export default function Page() {
  return (
    <div className="wrap page max-w-[820px]">
      <div className="crumb mute">
        <Link href="/">Home</Link> › Create an account
      </div>
      <h1 className="page-title">Create an account</h1>
      <p className="page-sub">You will need an account to request a booking. It takes a moment.</p>

      {/* `useSearchParams` needs a Suspense boundary in the App Router. */}
      <Suspense fallback={<div className="box max-w-[460px]">Loading…</div>}>
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}
