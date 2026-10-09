import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page max-w-[640px] text-center">
      <h1 className="page-title">Page not found</h1>
      <p className="page-sub">
        That link doesn&apos;t point anywhere on Trustify Trips. It may have
        moved, or the company or destination may no longer be listed.
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <Link className="btn g" href="/">
          Go home
        </Link>
        <Link className="btn wo" href="/destinations">
          Browse destinations
        </Link>
        <Link className="btn wo" href="/companies">
          Verified companies
        </Link>
      </div>
    </div>
  );
}
