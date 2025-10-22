"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

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
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">CityPulse</h1>
          <div className="flex items-center space-x-4">
            <a
              href="/profile"
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Profile
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-4">
            Welcome, {user?.displayName || "User"}!
          </h2>
          <p className="text-gray-600 mb-4">Email: {user?.email}</p>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">
              Dashboard Coming Soon!
            </h3>
            <p className="text-gray-700">Here we will show:</p>
            <ul className="list-disc ml-6 mt-2 text-gray-700">
              <li>City selector</li>
              <li>Events feed</li>
              <li>News</li>
              <li>Weather</li>
              <li>Your saved places</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
