"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useLogin, useRegister } from "@/hooks/api";
import { isApiError } from "@/lib/api/errors";
import { useAccountStore } from "@/store/accountStore";

/**
 * Sign in or create an account.
 *
 * One component for both because they differ only in their fields and which
 * mutation they call — and because the `?next=` redirect, the already-signed-in
 * bounce and the field-error mapping are identical and should not be written
 * twice.
 *
 * `?next=` is what makes "book this trip" survive a detour through sign-in:
 * the booking page sends the traveller here with its own path, and they land
 * back on it afterwards. Only same-site paths are honoured — an absolute URL
 * here would be an open redirect.
 */
export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const token = useAccountStore((s) => s.token);

  const login = useLogin();
  const register = useRegister();
  const pending = login.isPending || register.isPending;

  const [values, setValues] = useState({
    identifier: "",
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const raw = params.get("next") ?? "";
  // Reject anything that is not a same-site path: "//evil.com" and
  // "https://evil.com" both leave the site.
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account/bookings";

  // Already signed in — nothing to do here.
  useEffect(() => {
    if (token) router.replace(next);
  }, [token, next, router]);

  const set = (key: keyof typeof values, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    try {
      if (mode === "login") {
        await login.mutateAsync({
          identifier: values.identifier.trim(),
          password: values.password,
        });
      } else {
        await register.mutateAsync({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          username: values.username.trim() || undefined,
          password: values.password,
        });
      }
      router.replace(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
      if (isApiError(cause)) setFieldErrors(cause.fieldErrorMap);
    }
  };

  const field = (key: keyof typeof values) => ({
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(key, e.target.value),
    "aria-invalid": Boolean(fieldErrors[key]) || undefined,
  });

  return (
    <form className="box max-w-[460px]" onSubmit={submit} noValidate>
      {mode === "login" ? (
        <>
          <label className="fl">
            Email, username or phone
            <input autoComplete="username" {...field("identifier")} />
          </label>
          {fieldErrors.identifier ? <Err>{fieldErrors.identifier}</Err> : null}
        </>
      ) : (
        <>
          <label className="fl">
            Full name *
            <input autoComplete="name" {...field("name")} />
          </label>
          {fieldErrors.name ? <Err>{fieldErrors.name}</Err> : null}

          <label className="fl">
            Email *
            <input type="email" autoComplete="email" {...field("email")} />
          </label>
          {fieldErrors.email ? <Err>{fieldErrors.email}</Err> : null}

          <label className="fl">
            Phone *
            <input type="tel" autoComplete="tel" {...field("phone")} />
          </label>
          {fieldErrors.phone ? <Err>{fieldErrors.phone}</Err> : null}

          <label className="fl">
            Username
            <input autoComplete="username" {...field("username")} />
            <small className="mute">
              Optional. Another way to sign in, alongside your email and phone.
            </small>
          </label>
          {fieldErrors.username ? <Err>{fieldErrors.username}</Err> : null}
        </>
      )}

      <label className="fl">
        Password *
        <input
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          {...field("password")}
        />
        {mode === "register" ? (
          <small className="mute">At least 8 characters.</small>
        ) : null}
      </label>
      {fieldErrors.password ? <Err>{fieldErrors.password}</Err> : null}

      {error ? <div className="empty mt-3">{error}</div> : null}

      <button className="btn g w mt-3" type="submit" disabled={pending}>
        {pending
          ? "Please wait…"
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </button>

      <p className="mute mt-3 text-center text-[13px]">
        {mode === "login" ? (
          <>
            No account yet?{" "}
            <Link href={`/account/register?next=${encodeURIComponent(next)}`}>
              Create one
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/account/login?next=${encodeURIComponent(next)}`}>Sign in</Link>
          </>
        )}
      </p>
    </form>
  );
}

const Err = ({ children }: { children: React.ReactNode }) => (
  <small className="block text-brandred">{children}</small>
);
