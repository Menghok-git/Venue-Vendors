import { useState } from "react";
import { ApiVenue } from "@/types/api";

interface Props {
  initial: Partial<ApiVenue>;
  onSubmit: (data: Partial<ApiVenue>) => Promise<void>;
  onCancel: () => void;
}

export default function VenueForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial.name ?? "");
  const [location, setLocation] = useState(initial.location ?? "");
  const [capacity, setCapacity] = useState(initial.capacity?.toString() ?? "");
  const [pricePerHour, setPricePerHour] = useState(initial.pricePerHour?.toString() ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Venue name is required.");
    if (!location.trim()) return setError("Location is required.");
    if (!capacity || isNaN(Number(capacity)) || Number(capacity) < 1)
      return setError("Capacity must be at least 1.");
    if (pricePerHour && (isNaN(Number(pricePerHour)) || Number(pricePerHour) < 0))
      return setError("Price must be 0 or more.");

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        location: location.trim(),
        capacity: Number(capacity),
        pricePerHour: pricePerHour ? Number(pricePerHour) : undefined,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save venue.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "8px" }}>

      {error && <div className="vf-error">{error}</div>}

      <div className="vf-field">
        <label className="vf-label">Venue Name *</label>
        <input className="vf-input" placeholder="e.g. Crown Palladium" value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className="vf-field">
        <label className="vf-label">Location *</label>
        <input className="vf-input" placeholder="e.g. Southbank, Melbourne" value={location} onChange={e => setLocation(e.target.value)} />
      </div>

      <div className="vf-grid-2">
        <div>
          <label className="vf-label">Capacity *</label>
          <input className="vf-input" type="number" placeholder="e.g. 200" min={1} value={capacity} onChange={e => setCapacity(e.target.value)} />
        </div>
        <div>
          <label className="vf-label">Price per hour ($)</label>
          <input className="vf-input" type="number" placeholder="e.g. 300" min={0} step={0.01} value={pricePerHour} onChange={e => setPricePerHour(e.target.value)} />
        </div>
      </div>

      <div className="vf-field">
        <label className="vf-label">Description</label>
        <textarea className="vf-input" placeholder="Describe your venue..." value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      <div className="vf-field">
        <label className="vf-label">Image URL</label>
        <input className="vf-input" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
        <button type="submit" disabled={saving} className="vf-btn-primary">
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="vf-btn-secondary">
          Cancel
        </button>
      </div>

    </form>
  );
}