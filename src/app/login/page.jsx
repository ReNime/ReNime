"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) return alert("Isi semua data!");

    setLoading(true);

    // Login via NEXT-AUTH Credentials (phone + password)
    const res = await signIn("credentials", {
      redirect: false,
      phone,
      password,
    });

    if (res?.error) {
      alert("Nomor WA atau password salah!");
      setLoading(false);
      return;
    }

    router.push("/users/dashboard");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 px-6">
      <div className="w-full max-w-sm bg-gray-800 p-8 rounded-2xl shadow-lg">

        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Login ke ReNime
        </h1>

        <div className="space-y-4">

          {/* PHONE */}
          <input
            type="text"
            placeholder="Nomor WhatsApp (08xxxx)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white outline-none border border-gray-600 focus:border-blue-500"
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white outline-none border border-gray-600 focus:border-blue-500"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 py-3 rounded-lg font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </div>

        {/* OAUTH */}
        <div className="mt-6">
          <button
            onClick={() => signIn("google", { callbackUrl: "/users/dashboard" })}
            className="w-full py-3 rounded-lg border border-gray-600 text-white hover:bg-gray-700 flex justify-center items-center gap-2"
          >
            <img src="/google.svg" className="w-5 h-5" />
            Login dengan Google
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Belum punya akun?{" "}
          <a href="/register" className="text-blue-400 hover:underline">
            Daftar
          </a>
        </p>

      </div>
    </div>
  );
}
