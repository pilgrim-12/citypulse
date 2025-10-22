"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  UserProfile,
} from "@/lib/firestore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [language, setLanguage] = useState<"en" | "ru" | "ka">("en");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");

        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setLanguage(profile.preferences.language);
          setTheme(profile.preferences.theme);
          setNotifications(profile.preferences.notifications);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setMessage("");

    try {
      await updateProfile(user, {
        displayName: displayName,
      });

      await updateUserProfile(user.uid, {
        displayName: displayName,
      });

      setUser({ ...user, displayName });
      setEditing(false);
      setMessage("Profile updated successfully!");

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error updating profile");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    setSaving(true);
    setMessage("");

    try {
      await updateUserPreferences(user.uid, {
        language,
        theme,
        notifications,
      });

      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error saving settings");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-900">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="text-2xl font-bold text-blue-600">
            CityPulse
          </a>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Profile</h1>

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                message.includes("success")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.displayName?.charAt(0).toUpperCase() ||
                  user?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {user?.displayName || "User"}
                </h3>
                <p className="text-gray-700">{user?.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Display Name
              </label>
              {editing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setDisplayName(user?.displayName || "");
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 font-medium">
                    {user?.displayName || "Not set"}
                  </p>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <p className="text-gray-900 font-medium">{user?.email}</p>
              <p className="text-sm text-gray-600 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                Settings
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value as "en" | "ru" | "ka")
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white font-medium"
                >
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="ka">ქართული</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) =>
                    setTheme(e.target.value as "light" | "dark" | "system")
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white font-medium"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium text-gray-900">
                    Push Notifications
                  </p>
                  <p className="text-sm text-gray-600">
                    Get notified about new events
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4 text-red-600">
                Danger Zone
              </h2>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
