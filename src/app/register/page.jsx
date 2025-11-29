"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const { username, email, phone, password } = form;

    if (!username || !email || !phone || !password)
      return alert("Lengkapi semua data!");

    if (!phone.startsWith("08"))
      return alert("Nomor WhatsApp harus diawali 08!");

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error);
        setLoading(false);
        return;
      }

      // redirect ke verify OTP
      router.push(`/verify?phone=${phone}`);
    } catch (err) {
      console.error(err);
      alert("Server error!");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 px-6">
      <div className="w-full max-w-sm bg-gray-800 p-8 rounded-2xl shadow-lg">

        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Daftar Akun
        </h1>

        <div className="space-y-4">

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white outline-none border border-gray-600 focus:border-blue-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white outline-none border border-gray-600 focus:border-blue-500"
          />

          <input
            type="text"
            name="phone"
            placeholder="Nomor WhatsApp (08xxxx)"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white outline-none border border-gray-600 focus:border-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white outline-none border border-gray-600 focus:border-blue-500"
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-blue-600 py-3 rounded-lg font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={() => signIn("google")}
            className="w-full py-3 rounded-lg border border-gray-600 text-white hover:bg-gray-700 flex justify-center items-center gap-2"
          >
            <img src="/google.svg" className="w-5 h-5" />
            Daftar dengan Google
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-4">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
