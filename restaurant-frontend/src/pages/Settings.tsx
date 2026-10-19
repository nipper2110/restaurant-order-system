import { useEffect, useState } from "react";
import { KeyRound, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/api";
import {
  changePassword,
  getMe,
  updateProfile,
  type CurrentAdmin,
} from "@/api/settings";

function Settings() {
  const [admin, setAdmin] = useState<CurrentAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getMe()
      .then((data) => {
        if (!isMounted) return;
        setAdmin(data);
        setName(data.name ?? "");
      })
      .catch((err) => {
        if (isMounted)
          setLoadError(getErrorMessage(err, "Failed to load your profile."));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = async () => {
    setProfileError(null);
    setProfileSuccess(null);

    if (!name.trim()) {
      setProfileError("Name is required.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await updateProfile(name.trim());
      setAdmin(updated);
      setProfileSuccess("Profile updated.");
    } catch (err) {
      setProfileError(getErrorMessage(err, "Failed to update profile."));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(getErrorMessage(err, "Failed to change password."));
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
        <p className="text-sm text-white/40">Loading settings...</p>
      </div>
    );
  }

  if (loadError || !admin) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
        <p className="text-sm text-red-400">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="pb-6">
        <h1 className="font-bold text-xl text-[#fbbf24]">Settings</h1>
        <p className="text-sm text-gray-400">
          Manage your admin profile and password.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile */}
        <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white pb-4 border-b border-white/10">
            Profile
          </h2>

          <div className="mt-5 flex flex-col gap-5">
            <div>
              <label className="text-sm text-white/70">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Email</label>
              <input
                value={admin.email}
                disabled
                className="mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white/50 outline-none"
              />
              <p className="mt-1.5 text-xs text-white/30">
                Email can't be changed here.
              </p>
            </div>

            {profileError && (
              <p className="text-sm text-red-400">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-sm text-emerald-400">{profileSuccess}</p>
            )}

            <Button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="w-fit bg-[#fbbf24] text-black hover:bg-[#fbbf24]/80"
            >
              <Save className="h-4 w-4" />
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>

        {/* Password */}
        <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white pb-4 border-b border-white/10">
            Change Password
          </h2>

          <div className="mt-5 flex flex-col gap-5">
            <div>
              <label className="text-sm text-white/70">
                Current Password
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="6-digit password"
                className="mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm tracking-widest text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-white/70">New Password</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6-digit password"
                  className="mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm tracking-widest text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
                />
              </div>
              <div>
                <label className="text-sm text-white/70">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="6-digit password"
                  className="mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm tracking-widest text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
                />
              </div>
            </div>

            {passwordError && (
              <p className="text-sm text-red-400">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-emerald-400">{passwordSuccess}</p>
            )}

            <Button
              onClick={handleChangePassword}
              disabled={
                isSavingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="w-fit bg-[#fbbf24] text-black hover:bg-[#fbbf24]/80"
            >
              <KeyRound className="h-4 w-4" />
              {isSavingPassword ? "Saving..." : "Change Password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
