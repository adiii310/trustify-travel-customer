"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { destinations } from "@/lib/data/destinations";
import { useToast } from "@/providers/ToastProvider";

export default function HeroSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const toast = useToast();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) {
      toast("Type a destination first");
      return;
    }
    const matches = destinations.filter((d) =>
      `${d.name} ${d.region}`.toLowerCase().includes(query.toLowerCase())
    );
    if (matches.length === 1) router.push(`/destinations/${matches[0].id}`);
    else router.push(`/destinations?q=${encodeURIComponent(query)}`);
  };

  return (
    <form className="search" onSubmit={submit} role="search">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Where do you want to travel?"
        aria-label="Destination"
      />
      <button className="btn g" type="submit">
        Search Destination
      </button>
    </form>
  );
}
