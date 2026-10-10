import type { Metadata } from "next";
import Link from "next/link";

import AccountProfile from "@/components/account/AccountProfile";

export const metadata: Metadata = { title: "My Account" };

export default function AccountPage() {
  return (
    <div className="wrap page max-w-[820px]">
      <div className="crumb mute">
        <Link href="/">Home</Link> › My Account
      </div>
      <h1 className="page-title">My Account</h1>
      <p className="page-sub">Your details, and how you sign in.</p>
      <AccountProfile />
    </div>
  );
}
