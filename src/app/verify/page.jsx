"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function VerifyPage() {
  const router = useRouter();
  const params = useSearchParams();

  // Data dari register redirect
  const phone = params.get("phone");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyOTP = async () => {
    if (otp.length !== 6) return alert("Masukkan 6 digit OTP!");

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "OTP salah!");
        setLoading(false);
        return;
      }

      // AUTO LOGIN
      await signIn("credentials", {
        login: phone,
        password: "none", // tidak dipakai (karena oauth/wa login)
        redirect: false,
      });

      router.push("/users/dashboard");
    } catch (err) {
      console.error(err);
      alert("Server error!");
    }

    setLoading(false);
  };

  const resendOTP = async () => {
    setResendCooldown(30);

    await fetch("/api/auth/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    alert("OTP sudah dikirim ulang!");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 px-6">
      <div className="w-full max-w-sm bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h1 className="text-xl font-bold text-center text-white mb-4">
          Verifikasi OTP
        </h1>

        <p className="text-gray-300 text-sm text-center mb-2">
          Kode OTP sudah dikirim ke:
        </p>
        <p className="text-blue-400 font-semibold text-center mb-6">{phone}</p>

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="Masukkan 6 digit OTP"
          className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white text-center text-xl tracking-widest outline-none border border-gray-600 focus:border-blue-500"
        />

        <button
          onClick={verifyOTP}
          disabled={loading}
          className="w-full mt-5 bg-blue-600 py-3 rounded-lg font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Mengautentikasi..." : "Verifikasi OTP"}
        </button>

        <button
          onClick={resendOTP}
          disabled={resendCooldown > 0}
          className="w-full mt-3 bg-transparent border border-blue-500 py-3 rounded-lg text-blue-400 hover:bg-blue-500/10 disabled:opacity-50"
        >
          {resendCooldown > 0
            ? `Kirim ulang dalam ${resendCooldown}s`
            : "Kirim Ulang OTP"}
        </button>
      </div>
    </div>
  );
}
