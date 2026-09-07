import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import VenueList from "@/components/hirer/VenueList";
import VenueRanking from "@/components/hirer/VenueRanking";
import HireApplication from "@/components/hirer/HireApplication";
import HirerReputation from "@/components/hirer/HirerReputation";
import MyBookings from "@/components/hirer/MyBookings";

export default function HirerPage() {
  const { user } = useAuth();
  const router = useRouter();

  //bump a counter to tell a child component to reload its data. lets the sections
  //stay in sync without a page refresh
  const [candidatesVersion, setCandidatesVersion] = useState(0); //venue picks changed
  const [bookingsVersion, setBookingsVersion] = useState(0);     //a booking was made

  //redirect if not logged in or not a hirer
  useEffect(() => {
    if (!user) router.push("/signin");
    else if (user.role !== "hirer") router.push("/vendor");
  }, [user, router]);

  if (!user || user.role !== "hirer") return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Hirer Dashboard</h2>
      <VenueList onChange={() => setCandidatesVersion((n) => n + 1)} />
      <VenueRanking reloadSignal={candidatesVersion} />
      <HireApplication onBooked={() => setBookingsVersion((n) => n + 1)} />
      <MyBookings reloadSignal={bookingsVersion} />
      <HirerReputation />
    </div>
  );
}