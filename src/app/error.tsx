"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="wrap page max-w-[640px] text-center">
      <h1 className="page-title">Something went wrong</h1>
      <p className="page-sub">
        We hit an unexpected error loading this page. Your saved trips are
        untouched.
      </p>
      <button className="btn g" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
