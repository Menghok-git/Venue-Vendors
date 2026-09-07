import { useState, useEffect } from "react";
import { RankedVenue } from "@/types/api";
import { hirerApi } from "@/services/hirerApi";

//the hirer's chosen venues in preference order, from the DB now. the arrows reorder
//them and the new order saves straight back through /hirer/candidates.
const VenueRanking = ({ reloadSignal }: { reloadSignal?: number }) => {
  const [ranked, setRanked] = useState<RankedVenue[]>([]);

  //load on mount, and reload when the page bumps reloadSignal (after VenueList changes)
  useEffect(() => {
    hirerApi.candidates().then(setRanked).catch(() => setRanked([]));
  }, [reloadSignal]);

  //save whatever order we're now showing
  const saveOrder = (list: RankedVenue[]) => {
    setRanked(list);
    hirerApi.saveCandidates(list.map((v) => v.id)).catch(() => {});
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...ranked];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]]; //swap with the one above
    saveOrder(updated);
  };

  const moveDown = (idx: number) => {
    if (idx === ranked.length - 1) return;
    const updated = [...ranked];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]]; //swap with the one below
    saveOrder(updated);
  };

  if (ranked.length === 0) return null; //nothing selected yet, show nothing

  return (
    <div className="border rounded p-4 mb-6">
      <h3 className="text-xl font-semibold mb-3">Your Venue Ranking</h3>
      <p className="text-sm text-gray-500 mb-2">Use arrows to reorder by preference</p>
      {ranked.map((v, idx) => (
        <div key={v.id} className="flex items-center justify-between border-b py-2">
          <span>#{idx + 1} — {v.name} ({v.location})</span>
          <div className="flex gap-2">
            <button onClick={() => moveUp(idx)} disabled={idx === 0}
              className="px-2 py-1 bg-gray-200 rounded disabled:opacity-30">▲</button>
            <button onClick={() => moveDown(idx)} disabled={idx === ranked.length - 1}
              className="px-2 py-1 bg-gray-200 rounded disabled:opacity-30">▼</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VenueRanking;