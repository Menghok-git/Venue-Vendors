import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
  PieChart, Pie, Cell,
  ResponsiveContainer,
} from "recharts";
import { VendorStatsResponse } from "@/services/vendorApi";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

type View = "bar" | "line" | "pie";

interface Props {
  data: VendorStatsResponse;
}

const renderPieLabel = (props: any) => `${props.hirerName}: ${props.count}`;

const VendorCharts = ({ data }: Props) => {
  const [view, setView] = useState<View>("bar");

  return (
    <div>
      <h2 style={{ marginBottom: "12px" }}>Booking Analytics</h2>

      {/* toggle buttons */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button
          className={`tab-btn ${view === "bar" ? "active" : ""}`}
          onClick={() => setView("bar")}
        >
          By Venue
        </button>
        <button
          className={`tab-btn ${view === "line" ? "active" : ""}`}
          onClick={() => setView("line")}
        >
          Over Time
        </button>
        <button
          className={`tab-btn ${view === "pie" ? "active" : ""}`}
          onClick={() => setView("pie")}
        >
          By Hirer
        </button>
      </div>

      {/* bar chart — bookings by venue */}
      {view === "bar" && (
        <div>
          <h3 style={{ marginBottom: "12px", fontSize: "14px", color: "#6b7280" }}>
            Bookings by Venue
          </h3>
          {data.bookingsByVenue.length === 0
            ? <p style={{ color: "#6b7280" }}>No data yet.</p>
            : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.bookingsByVenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="venueName" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="approved" stackId="a" fill="#10b981" name="Approved" />
                  <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                  <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>
      )}

      {/* line chart — bookings over time */}
      {view === "line" && (
        <div>
          <h3 style={{ marginBottom: "12px", fontSize: "14px", color: "#6b7280" }}>
            Bookings Over Time
          </h3>
          {data.bookingsOverTime.length === 0
            ? <p style={{ color: "#6b7280" }}>No data yet.</p>
            : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.bookingsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Bookings" />
                </LineChart>
              </ResponsiveContainer>
            )}
        </div>
      )}

      {/* pie chart — bookings by hirer */}
      {view === "pie" && (
        <div>
          <h3 style={{ marginBottom: "12px", fontSize: "14px", color: "#6b7280" }}>
            Most Active Hirers
          </h3>
          {data.bookingsByHirer.length === 0
            ? <p style={{ color: "#6b7280" }}>No data yet.</p>
            : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.bookingsByHirer}
                    dataKey="count"
                    nameKey="hirerName"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={renderPieLabel}
                  >
                    {data.bookingsByHirer.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            )}
        </div>
      )}
    </div>
  );
};

export default VendorCharts;