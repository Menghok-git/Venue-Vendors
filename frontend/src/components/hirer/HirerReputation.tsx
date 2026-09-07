import { useState, useEffect } from "react";
import { ApiReputationEntry } from "@/types/api";
import { hirerApi } from "@/services/hirerApi";

//reputation now comes from the DB (the reviews vendors leave)
//the token already tells the backend who the hirer is, so no email lookup needed
const HirerReputation = () => {
  const [history, setHistory] = useState<ApiReputationEntry[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    hirerApi.reputation()
      .then((data) => { setAverage(data.average); setHistory(data.history); })
      .catch(() => setError("Could not load your reputation."))
      .finally(() => setLoading(false));
  }, []);

  //star display: filled stars up to the rating, hollow for the rest
  const stars = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);

  if (loading) return <p className="text-sm text-gray-500">Loading your reputation...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="border rounded p-4 mb-6">
      <h3 className="text-xl font-semibold mb-1">Your Reputation</h3>
      {history.length === 0 ? (
        <p className="text-gray-500">No hire history yet.</p>
      ) : (
        <>
          <p className="text-amber-700 font-medium mb-3">Average rating: {average ?? "N/A"} / 5</p>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Venue</th>
                <th>Location</th>
                <th>Event</th>
                <th>Date</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{h.venueName}</td>
                  <td>{h.location}</td>
                  <td>{h.eventName}</td>
                  <td>{h.dateOfHire}</td>
                  <td className="text-amber-600">{stars(h.rating)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default HirerReputation;