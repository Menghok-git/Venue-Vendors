import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { validateEmail, validatePassword } from "@/utils/validation";

const SignInForm = () => {
  const { user, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  //once logged in (or already logged in), send the user to their own area.
  useEffect(() => {
    if (!user) return;
    router.replace(user.role === "vendor" ? "/vendor" : user.role === "admin" ? "/" : "/hirer");
  }, [user, router]);

  const handleSubmit = async () => {
    setEmailError(""); setPasswordError(""); setLoginError("");

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    if (eErr) setEmailError(eErr);
    if (pErr) setPasswordError(pErr);
    if (eErr || pErr) return;

    setSubmitting(true);
    const error = await login(email, password); //hits the backend
    setSubmitting(false);
    if (error) setLoginError(error); //success -> the effect above redirects
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Sign In</h2>

      {loginError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {loginError}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(""); setLoginError(""); }}
          className="w-full border rounded px-3 py-2"
          placeholder="e.g. hirer@vv.com"
        />
        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setPasswordError(""); setLoginError(""); }}
          className="w-full border rounded px-3 py-2"
          placeholder="Your password"
        />
        {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800 disabled:opacity-60"
      >
        {submitting ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-sm text-gray-500 mt-4 text-center">
        No account?{" "}
        <a href="/signup" className="text-amber-700 underline">Create one</a>
      </p>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Demo (after running the seed): hirer@vv.com / vendor@vv.com &nbsp;|&nbsp; Passw0rd!
      </p>
    </div>
  );
};

export default SignInForm;
