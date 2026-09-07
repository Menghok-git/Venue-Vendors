import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { validateEmail, validatePassword } from "@/utils/validation";

//sign-up: hashed password (backend), strong-password rule,
//confirm-password match, and role selection (hirer/vendor).
export default function SignUpPage() {
  const { user, register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "", confirm: "",
    role: "hirer" as "hirer" | "vendor",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace(user.role === "vendor" ? "/vendor" : "/hirer");
  }, [user, router]);

  //update a field AND clear its error as the user types
  const update = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
    setFormError("");
  };

  const handleSubmit = async () => {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    const eErr = validateEmail(form.email); if (eErr) next.email = eErr;
    const pErr = validatePassword(form.password); if (pErr) next.password = pErr;
    if (form.confirm !== form.password) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    const err = await register({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || undefined,
      password: form.password,
      role: form.role,
    });
    setSubmitting(false);
    if (err) setFormError(err); // success -> effect redirects
  };

  const field = "w-full border rounded px-3 py-2";
  const errText = "text-red-500 text-sm mt-1";

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Create your account</h2>

      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {formError}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Full name</label>
        <input className={field} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
        {errors.fullName && <p className={errText}>{errors.fullName}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" className={field} value={form.email} onChange={(e) => update("email", e.target.value)} />
        {errors.email && <p className={errText}>{errors.email}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Phone (optional)</label>
        <input className={field} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">I am a</label>
        <select className={field} value={form.role} onChange={(e) => update("role", e.target.value)}>
          <option value="hirer">Hirer (I want to book venues)</option>
          <option value="vendor">Vendor (I list venues)</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Password</label>
        <input type="password" className={field} value={form.password} onChange={(e) => update("password", e.target.value)} />
        {errors.password && <p className={errText}>{errors.password}</p>}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Confirm password</label>
        <input type="password" className={field} value={form.confirm} onChange={(e) => update("confirm", e.target.value)} />
        {errors.confirm && <p className={errText}>{errors.confirm}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800 disabled:opacity-60"
      >
        {submitting ? "Creating account..." : "Sign Up"}
      </button>

      <p className="text-sm text-gray-500 mt-4 text-center">
        Already have an account?{" "}
        <a href="/signin" className="text-amber-700 underline">Sign in</a>
      </p>
    </div>
  );
}
