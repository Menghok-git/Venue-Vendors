import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  getMyVenues, createVenue, updateVenue, deleteVenue,
  addTimeslot, setTimeslotBlocked,
  getVendorBookings, setBookingStatus,
  getVendorStats, VendorStatsResponse,
} from "@/services/vendorApi";
import { ApiVenue, ApiBooking } from "@/types/api";
import VenueForm from "@/components/vendor/VenueForm";
import VendorCharts from "@/components/vendor/VendorCharts";


export default function VendorPage() {
  useAuthGuard("vendor");

  const [activeTab, setActiveTab] = useState("venues");
  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [stats, setStats] = useState<VendorStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<ApiVenue | null>(null);
  const [slotVenueId, setSlotVenueId] = useState<number | null>(null);
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [slotError, setSlotError] = useState("");

  useEffect(() => {
    if (activeTab === "venues") loadVenues();
    if (activeTab === "bookings") loadBookings();
    if (activeTab === "stats") loadStats();
  }, [activeTab]);

  async function loadVenues() {
    setLoading(true); setError("");
    try { setVenues(await getMyVenues()); }
    catch { setError("Failed to load venues"); }
    setLoading(false);
  }

  async function loadBookings() {
    setLoading(true); setError("");
    try { setBookings(await getVendorBookings()); }
    catch { setError("Failed to load bookings"); }
    setLoading(false);
  }

  async function loadStats() {
    setLoading(true); setError("");
    try { setStats(await getVendorStats()); }
    catch { setError("Failed to load stats"); }
    setLoading(false);
  }

  async function handleVenueSubmit(data: Partial<ApiVenue>) {
    if (editingVenue) {
      const updated = await updateVenue(editingVenue.id, data);
      setVenues(venues.map(v => v.id === updated.id ? updated : v));
    } else {
      const created = await createVenue(data);
      setVenues([created, ...venues]);
    }
    setShowForm(false);
    setEditingVenue(null);
  }

  async function handleDeleteVenue(id: number) {
    if (!confirm("Delete this venue?")) return;
    await deleteVenue(id);
    setVenues(venues.filter(v => v.id !== id));
  }

  async function handleAddTimeslot(venueId: number) {
    setSlotError("");
    if (!slotStart || !slotEnd) return setSlotError("Both start and end times are required");
    try {
      const newSlot = await addTimeslot(venueId, slotStart, slotEnd);
      setVenues(venues.map(v =>
        v.id === venueId ? { ...v, timeslots: [...(v.timeslots || []), newSlot] } : v
      ));
      setSlotVenueId(null); setSlotStart(""); setSlotEnd("");
    } catch (err: any) {
      setSlotError(err.response?.data?.message || "Failed to add timeslot");
    }
  }

  async function handleToggleBlock(timeslotId: number, venueId: number, currentBlocked: boolean) {
    const updated = await setTimeslotBlocked(timeslotId, !currentBlocked);
    setVenues(venues.map(v =>
      v.id !== venueId ? v :
      { ...v, timeslots: (v.timeslots || []).map(s => s.id === updated.id ? updated : s) }
    ));
  }

  async function handleBookingAction(id: number, status: "approved" | "rejected") {
    const updated = await setBookingStatus(id, status);
    setBookings(bookings.map(b => b.id === updated.id ? updated : b));
  }

  function openEdit(venue: ApiVenue) { setEditingVenue(venue); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditingVenue(null); }

  return (
    <div>
      <h1>Vendor Dashboard</h1>

      <div className="tab-bar">
        <button className={`tab-btn ${activeTab === "venues" ? "active" : ""}`} onClick={() => setActiveTab("venues")}>My Venues</button>
        <button className={`tab-btn ${activeTab === "bookings" ? "active" : ""}`} onClick={() => setActiveTab("bookings")}>Bookings</button>
        <button className={`tab-btn ${activeTab === "stats" ? "active" : ""}`} onClick={() => setActiveTab("stats")}>Charts</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* VENUES TAB */}
      {activeTab === "venues" && !loading && (
        <div>
          <button className="vf-btn-primary" onClick={() => { setEditingVenue(null); setShowForm(true); }}>
            + Add Venue
          </button>

          {showForm && (
            <div className="form-card">
              <h2>{editingVenue ? "Edit Venue" : "New Venue"}</h2>
              <VenueForm initial={editingVenue || {}} onSubmit={handleVenueSubmit} onCancel={closeForm} />
            </div>
          )}

          {venues.length === 0 && <p>No venues yet.</p>}

          {venues.map(venue => (
            <div key={venue.id} className="venue-card">
              <strong style={{ fontSize: "16px" }}>{venue.name}</strong>
              <p className="venue-meta">{venue.location} · Capacity: {venue.capacity}</p>
              {venue.pricePerHour !== null && <p className="venue-price">${venue.pricePerHour}/hr</p>}

              <div className="venue-actions">
                <button className="vf-btn-secondary" onClick={() => openEdit(venue)}>Edit</button>
                <button className="vf-btn-secondary" onClick={() => handleDeleteVenue(venue.id)}>Delete</button>
              </div>

              <div className="timeslot-section">
                <strong>Timeslots</strong>
                {(venue.timeslots || []).length === 0 && <p className="venue-meta">No timeslots yet.</p>}
                <div className="timeslot-list">
                  {(venue.timeslots || []).map(slot => (
                    <button
                      key={slot.id}
                      className="timeslot-btn"
                      onClick={() => handleToggleBlock(slot.id, venue.id, slot.isBlocked)}
                      style={{ background: slot.isBlocked ? "#fee2e2" : "#f0fdf4" }}
                    >
                      {new Date(slot.startTime).toLocaleString()} – {new Date(slot.endTime).toLocaleString()}
                      <span style={{ marginLeft: "8px", color: slot.isBlocked ? "#dc2626" : "#16a34a" }}>
                        {slot.isBlocked ? "● blocked" : "● open"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {slotVenueId === venue.id ? (
                <div className="slot-form">
                  <input type="datetime-local" value={slotStart} onChange={e => setSlotStart(e.target.value)} />
                  <input type="datetime-local" value={slotEnd} onChange={e => setSlotEnd(e.target.value)} />
                  <button className="vf-btn-primary" onClick={() => handleAddTimeslot(venue.id)}>Add</button>
                  <button className="vf-btn-secondary" onClick={() => setSlotVenueId(null)}>Cancel</button>
                  {slotError && <p style={{ color: "red", fontSize: "13px" }}>{slotError}</p>}
                </div>
              ) : (
                <button className="vf-btn-secondary" onClick={() => setSlotVenueId(venue.id)}>+ Add timeslot</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === "bookings" && !loading && (
        <div>
          <h2 style={{ marginBottom: "16px" }}>Booking Requests</h2>
          {bookings.length === 0 && <p style={{ color: "#6b7280" }}>No bookings yet.</p>}
          {bookings.map(b => (
            <div key={b.id} className="venue-card">
              <p><strong>{b.eventName}</strong></p>
              <p className="venue-meta">Date: {new Date(b.eventDate).toLocaleDateString()}</p>
              <p className="venue-meta">Guests: {b.expectedGuests}</p>
              <p className="venue-meta">Venue: {b.timeslot?.venue?.name ?? "—"}</p>
              <p className="venue-meta">Hirer: {b.hirer?.fullName ?? "Unknown"}</p>
              <p className="venue-meta">
                Reputation:{" "}
                {b.hirerReputation != null ? `${b.hirerReputation} / 5` : "No reviews yet"}
              </p>
              <p style={{ margin: "8px 0" }}>
                <span className={`status-badge status-${b.status}`}>{b.status}</span>
              </p>
              {b.status === "pending" && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-approve" onClick={() => handleBookingAction(b.id, "approved")}>
                    Approve
                  </button>
                  <button className="btn-reject" onClick={() => handleBookingAction(b.id, "rejected")}>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* STATS TAB */}
      {activeTab === "stats" && !loading && stats && <VendorCharts data={stats} />}
      {activeTab === "stats" && !loading && !stats && !error && <p>No stats available yet.</p>}
    </div>
  );
}