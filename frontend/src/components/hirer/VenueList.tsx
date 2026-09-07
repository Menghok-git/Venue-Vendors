import { useState, useEffect, useRef } from "react";
import { ApiVenue } from "@/types/api";
import { venueApi } from "@/services/venueApi";
import { hirerApi } from "@/services/hirerApi";

//browse + search venues from the DB, and tick the ones you want as candidates.
//the candidate list (ids + order) is saved in the DB now via /hirer/candidates
  const VenueList = ({ onChange }: { onChange?: () => void }) => {
  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [tagOptions, setTagOptions] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]); //ordered candidate ids
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //search fields
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [suitability, setSuitability] = useState("");

  //first load: all venues (for the table + tag options) plus the hirer's current
  //picks, so the checkboxes start in the right state
  useEffect(() => {
    Promise.all([venueApi.list(), hirerApi.candidates()])
      .then(([allVenues, candidates]) => {
        setVenues(allVenues);
        const tags = new Set<string>();
        allVenues.forEach((v) => (v.suitability ?? []).forEach((t) => tags.add(t)));
        setTagOptions([...tags].sort());
        setSelectedIds(candidates.map((c) => c.id));
      })
      .catch(() => setError("Could not load venues. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  //re-run the search when a filter changes, debounced, skipping the first render
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    const t = setTimeout(() => {
      venueApi.search({
        name: name || undefined,
        location: location || undefined,
        minCapacity: minCapacity ? Number(minCapacity) : undefined,
        suitability: suitability || undefined,
      })
        .then(setVenues)
        .catch(() => setError("Search failed. Please try again."));
    }, 300);
    return () => clearTimeout(t);
  }, [name, location, minCapacity, suitability]);

  //tick/untick a candidate. adding appends to the end of the order, removing drops
  //it. save the new list and tell the page so the ranking can refresh.
  const toggleSelect = async (venueId: number) => {
    const prev = selectedIds;
    const next = prev.includes(venueId)
      ? prev.filter((id) => id !== venueId)
      : [...prev, venueId];
    setSelectedIds(next); //optimistic so it feels instant
    try {
      await hirerApi.saveCandidates(next);
      onChange?.();
    } catch {
      setSelectedIds(prev); //roll back if the save failed
      setError("Could not save your selection.");
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading venues...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="border rounded p-4 mb-6">
      <h3 className="text-xl font-semibold mb-3">Available Venues</h3>

      {/*one search bar, four filters that all go to the backend together*/}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Search by name" className="border rounded px-3 py-2 text-sm" />
        <input value={location} onChange={(e) => setLocation(e.target.value)}
          placeholder="Search by location" className="border rounded px-3 py-2 text-sm" />
        <input value={minCapacity} onChange={(e) => setMinCapacity(e.target.value)}
          type="number" placeholder="Min capacity" className="border rounded px-3 py-2 text-sm" />
        <select value={suitability} onChange={(e) => setSuitability(e.target.value)}
          className="border rounded px-3 py-2 text-sm">
          <option value="">All types</option>
          {tagOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {venues.length === 0 ? (
        <p className="text-sm text-gray-500">No venues match your search.</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Venue</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Suitable for</th>
              <th>From</th>
              <th>Candidate</th>
            </tr>
          </thead>
          <tbody>
            {venues.map((v) => (
              <tr key={v.id} className="border-b align-top">
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt={v.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-amber-100" />
                    )}
                    <span>{v.name}</span>
                  </div>
                </td>
                <td>{v.location}</td>
                <td>{v.capacity}</td>
                <td className="text-sm text-gray-600">{(v.suitability ?? []).join(", ")}</td>
                <td>{v.pricePerHour != null ? `$${v.pricePerHour}/hr` : "-"}</td>
                <td>
                  <input type="checkbox" checked={selectedIds.includes(v.id)}
                    onChange={() => toggleSelect(v.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VenueList;