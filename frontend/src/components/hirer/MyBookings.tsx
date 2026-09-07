import { useState, useEffect } from "react";
import { ApiBooking } from "@/types/api";
import { bookingApi } from "@/services/bookingApi";

//the hirer's own booking requests, newest first, with a cancel button on the
//pending ones. data comes from /bookings/mine. takes a reloadSignal so the page
//can refresh the list the moment a new booking is submitted.
const MyBookings = ({ reloadSignal }: { reloadSignal?: number }) => {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    bookingApi.mine()
      .then(setBookings)
      .catch(() => setError("Could not load your bookings."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [reloadSignal]);

  //cancel a pending request. the backend blocks cancelling approved/rejected ones,
  //so the button only shows while it's still pending.
  const cancel = async (id: number) => {
    try {
      await bookingApi.cancel(id);
      setBookings((prev) => prev.filter((b) => b.id !== id)); //drop it from the list
    } catch {
      setError("Could not cancel that booking.");
    }
  };

  //colour the status so it reads at a glance
  const statusClass = (s: string) =>
    s === "approved" ? "text-green-600" : s === "rejected" ? "text-red-500" : "text-amber-600";

  if (loading) return <p className="text-sm text-gray-500">Loading your bookings...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="border rounded p-4 mb-6">
      <h3 className="text-xl font-semibold mb-3">My Bookings</h3>
      {bookings.length === 0 ? (
        <p className="text-sm text-gray-500">You have not made any bookings yet.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Event</th>
              <th>Venue</th>
              <th>Date</th>
              <th>Guests</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="py-2">{b.eventName}</td>
                <td>{b.timeslot?.venue?.name ?? "-"}</td>
                <td>{b.eventDate}</td>
                <td>{b.expectedGuests}</td>
                <td className={statusClass(b.status)}>{b.status}</td>
                <td>
                  {b.status === "pending" && (
                    <button onClick={() => cancel(b.id)}
                      className="text-red-500 hover:underline">Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyBookings;