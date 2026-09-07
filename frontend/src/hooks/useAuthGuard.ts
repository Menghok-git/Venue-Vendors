import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";

//Page-level guard. Call at the top of a protected page:
//   const { user, loading } = useAuthGuard("hirer");
//Redirects to /signin if not logged in, or to the user's own area if the role
//doesn't match (blocks cross-role access).
export function useAuthGuard(requiredRole?: UserRole) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/signin"); return; }
    if (requiredRole && user.role !== requiredRole) {
      router.replace(user.role === "vendor" ? "/vendor" : "/hirer");
    }
  }, [user, loading, requiredRole, router]);

  return { user, loading };
}
