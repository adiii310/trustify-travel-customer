"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PanelSkeleton } from "@/components/ui/Skeleton";
import { useChangePassword, useSession, useSignOut, useUpdateProfile } from "@/hooks/api";
import { isApiError } from "@/lib/api/errors";
import { useAccountStore } from "@/store/accountStore";

/**
 * Profile and password.
 *
 * `email` is shown but not editable: it is the key registration matches on and
 * the handle every historical booking was made under, so changing it is a
 * support action rather than a self-service one. The server rejects it too.
 */
export default function AccountProfile() {
  const token = useAccountStore((s) => s.token);
  const account = useAccountStore((s) => s.account);
  const signOut = useSignOut();

  // Revalidates the stored token and refreshes the cached profile. A 401 here
  // signs the traveller out rather than leaving them on a dead page.
  const { isPending } = useSession();

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [profile, setProfile] = useState({ name: "", phone: "", username: "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  // Seed the form once the profile is known, without clobbering typing.
  useEffect(() => {
    if (account) {
      setProfile({
        name: account.name,
        phone: account.phone ?? "",
        username: account.username ?? "",
      });
    }
  }, [account]);

  if (!token) {
    return (
      <div className="empty">
        <Link className="btn g sm" href="/account/login?next=/account">
          Sign in to manage your account
        </Link>
      </div>
    );
  }

  if (isPending && !account) return <PanelSkeleton lines={5} />;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");
    try {
      await updateProfile.mutateAsync({
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        username: profile.username.trim(),
      });
      setProfileMsg("Saved.");
    } catch (cause) {
      setProfileErr(
        isApiError(cause) ? cause.message : "Could not save your details."
      );
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordErr("");
    try {
      await changePassword.mutateAsync(passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      setPasswordMsg("Password changed.");
    } catch (cause) {
      setPasswordErr(
        isApiError(cause) ? cause.message : "Could not change your password."
      );
    }
  };

  return (
    <>
      <form className="box" onSubmit={saveProfile} noValidate>
        <h3>Your details</h3>

        <label className="fl">
          Email
          <input value={account?.email ?? ""} disabled />
          <small className="mute">
            Contact us if you need this changed — your bookings are filed under it.
          </small>
        </label>

        <label className="fl">
          Full name
          <input
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
          />
        </label>

        <label className="fl">
          Phone
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
          />
        </label>

        <label className="fl">
          Username
          <input
            value={profile.username}
            onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
          />
          <small className="mute">Another way to sign in. Leave blank if you prefer.</small>
        </label>

        {profileErr ? <div className="empty mt-2">{profileErr}</div> : null}
        {profileMsg ? <p className="mute mt-2">{profileMsg}</p> : null}

        <button className="btn g mt-3" type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Saving…" : "Save details"}
        </button>
      </form>

      <form className="box" onSubmit={savePassword} noValidate>
        <h3>Change password</h3>

        <label className="fl">
          Current password
          <input
            type="password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
            }
          />
        </label>

        <label className="fl">
          New password
          <input
            type="password"
            autoComplete="new-password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, newPassword: e.target.value }))
            }
          />
          <small className="mute">At least 8 characters.</small>
        </label>

        {passwordErr ? <div className="empty mt-2">{passwordErr}</div> : null}
        {passwordMsg ? <p className="mute mt-2">{passwordMsg}</p> : null}

        <button className="btn g mt-3" type="submit" disabled={changePassword.isPending}>
          {changePassword.isPending ? "Changing…" : "Change password"}
        </button>
      </form>

      <div className="box">
        <h3>Session</h3>
        <p className="mute mb-2.5">
          Signing out clears your session on this device. Your saved trips and
          compare list stay — they live here, not in your account.
        </p>
        <button className="btn wo" type="button" onClick={signOut}>
          Sign out
        </button>
      </div>
    </>
  );
}
