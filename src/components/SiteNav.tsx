"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { Skeleton } from "@/components/ui/Skeleton";
import { NAV_LINKS } from "@/lib/data/site";
import { useApp } from "@/hooks/useApp";
import { useSiteSettings } from "@/hooks/api";
import { useIsSignedIn } from "@/store/accountStore";

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { account, ready, compare } = useApp();
  const { data: settings } = useSiteSettings();
  const signedIn = useIsSignedIn();

  // Close the drawer whenever the route changes or the viewport grows.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 820) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className={`site${open ? " open" : ""}`}>
      <div className="wrap">
        <Link className="logo" href="/">
          {/* Both are admin-managed. A skeleton rather than placeholder words:
              whatever sits here is read as the name of the business. */}
          🛡️ {settings ? settings.name : <Skeleton w={118} h={15} />}
          <small>
            {settings ? settings.tagline : <Skeleton w={90} h={9} />}
          </small>
        </Link>

        <ul id="nav-menu">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={isActive(link.href) ? "on" : undefined}
              >
                {link.label}
                {link.href === "/compare" && ready && compare.length > 0
                  ? ` (${compare.length})`
                  : ""}
              </Link>
            </li>
          ))}
          <li className="m-only">
            <Link className="btn g" href="/become-verified">
              Become Verified
            </Link>
          </li>
        </ul>

        <div className="nav-act">
          <ThemeToggle />
          {/* Signed in means a real session now, not just a captured name —
              so this links into the account rather than reopening a dialog. */}
          {ready && signedIn && account ? (
            <Link className="btn o" href="/account/bookings">
              Hi, {account.name.split(" ")[0]}
            </Link>
          ) : (
            <Link className="btn o" href="/account/login">
              Login
            </Link>
          )}
          <Link className="btn g" href="/become-verified">
            Become Verified
          </Link>
        </div>

        <button
          className="burger"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
    </nav>
  );
}
