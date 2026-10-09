"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useCompanies, useDestinations } from "@/hooks/api";
import { useToast } from "@/providers/ToastProvider";

/** Most suggestions shown at once, across both groups. */
const MAX_SUGGESTIONS = 7;
const MAX_PER_GROUP = 5;

type Suggestion = {
  key: string;
  href: string;
  label: string;
  /** Secondary line — a region or a city. */
  detail: string;
  kind: "Destination" | "Company";
};

/**
 * The homepage search box.
 *
 * Reads **live** destinations and companies, so anything an admin publishes is
 * findable here immediately. (It previously filtered the static catalogue in
 * `src/lib/data`, which meant a newly added destination could not be searched
 * for at all.) Both lists are the same cache entries the directory pages use,
 * so the suggestions cost no extra request.
 *
 * Submitting without choosing a suggestion falls through to `/destinations?q=`,
 * which filters the full list client-side.
 */
export default function HeroSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const router = useRouter();
  const toast = useToast();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const { data: destinations } = useDestinations();
  const { data: companies } = useCompanies();

  const suggestions = useMemo<Suggestion[]>(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];

    const matchedDestinations = (destinations ?? [])
      .filter((d) => `${d.name} ${d.region}`.toLowerCase().includes(query))
      .slice(0, MAX_PER_GROUP)
      .map<Suggestion>((d) => ({
        key: `d:${d.id}`,
        href: `/destinations/${d.id}`,
        label: d.name,
        detail: d.region,
        kind: "Destination",
      }));

    const matchedCompanies = (companies ?? [])
      .filter((c) => `${c.name} ${c.city}`.toLowerCase().includes(query))
      .slice(0, MAX_PER_GROUP)
      .map<Suggestion>((c) => ({
        key: `c:${c.id}`,
        href: `/companies/${c.id}`,
        label: c.name,
        detail: c.city,
        kind: "Company",
      }));

    return [...matchedDestinations, ...matchedCompanies].slice(0, MAX_SUGGESTIONS);
  }, [q, destinations, companies]);

  // Close when the click lands outside; `mousedown` so it beats the option's
  // own click handler only when the target really is elsewhere.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // A highlighted suggestion wins over the free-text search.
    const chosen = suggestions[active];
    if (chosen) {
      go(chosen.href);
      return;
    }

    const query = q.trim();
    if (!query) {
      toast("Type a destination first");
      return;
    }

    // Exactly one destination matches — skip the directory and open it.
    const exact = (destinations ?? []).filter((d) =>
      `${d.name} ${d.region}`.toLowerCase().includes(query.toLowerCase())
    );
    const only = exact.length === 1 ? exact[0] : undefined;

    setOpen(false);
    router.push(
      only ? `/destinations/${only.id}` : `/destinations?q=${encodeURIComponent(query)}`
    );
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (!suggestions.length) return;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      // Wraps, and -1 (nothing highlighted) enters the list at either end.
      setActive((i) => {
        const next = i + step;
        if (next < 0) return suggestions.length - 1;
        if (next >= suggestions.length) return -1;
        return next;
      });
    }
  };

  const showList = open && suggestions.length > 0;

  return (
    <div ref={rootRef} className="relative max-w-[440px]">
      <form className="search" onSubmit={submit} role="search">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Where do you want to travel?"
          aria-label="Destination or company"
          role="combobox"
          aria-expanded={showList}
          aria-controls={showList ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && active >= 0 ? `${listId}-${active}` : undefined
          }
          autoComplete="off"
        />
        <button className="btn g" type="submit">
          Search Destination
        </button>
      </form>

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-[320px] overflow-y-auto rounded-lg border border-line bg-card py-1 shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.key}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              // `mousedown` fires before the input's blur, so the navigation is
              // not cancelled by the list unmounting first.
              onMouseDown={(e) => {
                e.preventDefault();
                go(s.href);
              }}
              onMouseEnter={() => setActive(i)}
              // `bg-bg` rather than a tinted brand colour: it is a themed
              // token, so the highlight stays visible in dark mode too.
              className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${
                i === active ? "bg-bg" : ""
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate">{s.label}</span>
                {s.detail ? (
                  <small className="block truncate text-mute">{s.detail}</small>
                ) : null}
              </span>
              <span className="shrink-0 text-xs text-mute">{s.kind}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
