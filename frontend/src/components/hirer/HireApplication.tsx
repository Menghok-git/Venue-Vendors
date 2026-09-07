import { useState, useEffect } from "react";
import { ApiVenue } from "@/types/api";
import { venueApi } from "@/services/venueApi";
import { bookingApi } from "@/services/bookingApi";

//hirer books a real timeslot now, no more localStorage. venues come back from the
//API with their timeslots attached, so one call gives us everything to drive both
//pickers. the user can start from either the venue or the slot and the other fills in.
const HireApplication = ({ onBooked }: { onBooked?: () => void }) => {
  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  //form state
  const [venueId, setVenueId] = useState<number>(0);
  const [timeslotId, setTimeslotId] = useState<number>(0);
  const [eventName, setEventName] = useState("");
  const [guestCount, setGuestCount] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  //pull venues (+ their timeslots) once on mount. show a loading and error state
  //so the page never just sits there blank if the backend is down.
  useEffect(() => {
    venueApi.list()
      .then((data) => setVenues(data))
      .catch(() => setLoadError("Could not load venues. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  //flat list of every bookable slot tagged with its venue. lets us show all slots
  //when no venue is chosen yet and still know which venue each one belongs to.
  const allSlots = venues.flatMap((v) =>
    (v.timeslots ?? []).filter((s) => !s.isBlocked).map((s) => ({ slot: s, venue: v })),
  );

  //the venue currently in focus (picked directly, or inferred from the slot)
  const activeVenue = venues.find((v) => v.id === venueId) || null;

  //slots in the dropdown: narrow to the chosen venue, otherwise show them all
  const visibleSlots = venueId ? allSlots.filter((x) => x.venue.id === venueId) : allSlots;

  //pick a venue: if the slot we had no longer belongs to it, drop it
  const pickVenue = (id: number) => {
    setVenueId(id);
    if (id && timeslotId) {
      const stillValid = allSlots.some((x) => x.venue.id === id && x.slot.id === timeslotId);
      if (!stillValid) setTimeslotId(0);
    }
  };

  //pick a slot: point the venue at whoever owns that slot (the vice-versa bit)
  const pickSlot = (id: number) => {
    setTimeslotId(id);
    const match = allSlots.find((x) => x.slot.id === id);
    if (match) setVenueId(match.venue.id);
  };

  //slot times come back as ISO strings, format them for a Melbourne reader
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-AU", {
      weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
    });

  const handleApply = async () => {
    setError("");
    setSuccess(false);

    //1. same checks the server runs, done here first for instant feedback
    if (!timeslotId) { setError("Please choose a venue and timeslot."); return; }
    if (eventName.trim().length < 3) { setError("Event name must be at least 3 characters."); return; }
    const guests = parseInt(guestCount);
    if (!guests || guests <= 0) { setError("Guest count must be a positive number."); return; }
    if (activeVenue && guests > activeVenue.capacity) {
      setError(`Guest count exceeds the venue capacity of ${activeVenue.capacity}.`); return;
    }

    //2. the event date is just the day of the slot, so derive it instead of asking
    //twice. send it as YYYY-MM-DD which is what the backend validator wants.
    const chosen = allSlots.find((x) => x.slot.id === timeslotId)!;
    const eventDate = chosen.slot.startTime.slice(0, 10);

    //3. send it. if the server rejects it (capacity, dupe, etc) show its message.
    try {
      await bookingApi.create({
        timeslotId, eventName: eventName.trim(), expectedGuests: guests, eventDate,
      });
      setSuccess(true);
      //4. clear the form so they can book another, and tell the page to refresh.
      setVenueId(0); setTimeslotId(0); setEventName(""); setGuestCount("");
      onBooked?.();
    } catch (err: any) {
      //backend sends either { message } or { errors: [{ msg }] }, show whichever.
      const data = err?.response?.data;
      setError(data?.message || data?.errors?.[0]?.msg || "Something went wrong. Please try again.");
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading venues...</p>;
  if (loadError) return <p className="text-sm text-red-500">{loadError}</p>;

  return (
    <div className="border rounded p-4 mb-6">
      <h3 className="text-xl font-semibold mb-3">Apply for a Venue</h3>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-2">Booking request submitted!</p>}

      {/*venue preview: image + quick facts, shows once a venue is in focus*/}
      {activeVenue && (
        <div className="flex gap-4 mb-4">
          {activeVenue.imageUrl ? (
            <img src={activeVenue.imageUrl} alt={activeVenue.name}
              className="w-40 h-28 object-cover rounded" />
          ) : (
            <div className="w-40 h-28 rounded bg-amber-100 flex items-center justify-center text-amber-800 text-sm text-center px-2">
              {activeVenue.name}
            </div>
          )}
          <div className="text-sm">
            <p className="font-semibold">{activeVenue.name}</p>
            <p className="text-gray-600">{activeVenue.location}</p>
            <p className="text-gray-600">Holds up to {activeVenue.capacity} guests</p>
            {activeVenue.pricePerHour != null && (
              <p className="text-gray-600">${activeVenue.pricePerHour}/hour</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <select value={venueId} onChange={(e) => pickVenue(Number(e.target.value))}
          className="border rounded px-3 py-2">
          <option value={0}>-- Any venue --</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>{v.name} — {v.location}</option>
          ))}
        </select>

        <select value={timeslotId} onChange={(e) => pickSlot(Number(e.target.value))}
          className="border rounded px-3 py-2">
          <option value={0}>-- Select a timeslot --</option>
          {visibleSlots.map(({ slot, venue }) => (
            <option key={slot.id} value={slot.id}>
              {fmt(slot.startTime)}{venueId ? "" : ` (${venue.name})`}
            </option>
          ))}
        </select>

        <input value={eventName} onChange={(e) => setEventName(e.target.value)}
          placeholder="Event name" className="border rounded px-3 py-2" />
        <input value={guestCount} onChange={(e) => setGuestCount(e.target.value)}
          type="number" placeholder="Number of guests" className="border rounded px-3 py-2" />

        <button onClick={handleApply}
          className="bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800 col-span-2">
          Submit Application
        </button>
      </div>
    </div>
  );
};

export default HireApplication;