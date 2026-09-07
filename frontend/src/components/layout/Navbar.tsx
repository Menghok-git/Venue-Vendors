import Link from "next/link"; {/*users can switch between pages without reloading*/}
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

const Navbar = () => { //nav bar will links for sign up, sign in and sign out
    
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
    logout();
    router.push("/"); //send to home after logging out
  };
    
    return (
        <nav className="bg-amber-200 font-semibold text-[#556B2F] px-6 py-3 flex justify-between items-center">
            <div className="flex gap-4">
                <Link href="/" className="hover:text-blue-700">
                Venue Vendors
                </Link>
            </div>           
            <div className="flex gap-4">
                {user ? (
                    <>
                    <Link href={user.role === "hirer" ? "/hirer" : "/vendor"}
                    className="hover:text-amber-700" //only shows when logged in, conditional rendering
                    >
                        Dashboard
                    </Link>
                    <Link href="/profile" className="hover:text-amber-700">
                        Profile
                    </Link>
                    <span className="text-amber-800">Hi, {user.name || user.email}</span>
                    <button onClick={handleLogout} className="bg-amber-800 
                    text-white px-3 py-1 rounded hover:bg-amber-900"> 
                        Sign Out
                    </button>
                    </>
                ) : (
                <>
                    <Link href="/signin" className="hover:text-blue-700"> {/*shows when not logged in*/}
                    Sign In
                    </Link>
                    <Link href="/signup" className="hover:text-blue-700"> Sign Up </Link>
                </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;