export default function HomePage() {
  return (
    <div>
      {/* hero */}
      <section className="text-center py-16 px-4 bg-gradient-to-b from-amber-100 to-white rounded-lg">
        <h2 className="text-4xl font-bold mb-4 text-[#556B2F]">Venue Vendors</h2>
        <p className="text-lg text-amber-700 max-w-2xl mx-auto">
          Venue Vendors connects event organizers with the perfect venues.
          Looking for a venue for a corporate function in the CBD, or a wedding
          reception in the Yarra Valley? Venue Vendors has got you covered.
        </p>
      </section>

      {/* hero image. swap the src for a real venue photo, see note */}
      <img src="https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="An event venue set up for a function"
        className="w-full h-60 object-cover rounded-lg mt-6" />

      {/* built for melbourne */}
      <section className="flex flex-col md:flex-row gap-6 items-center py-8 px-6 mt-6 bg-amber-100 rounded-lg">
        <img src="https://images.unsplash.com/photo-1648862459464-f465d8a4a484?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Melbourne"
          className="w-full md:w-1/3 h-48 object-cover rounded" />
        <div className="flex-1">
          <h3 className="text-2xl font-semibold mb-3 text-[#556B2F]">Built for Melbourne</h3>
          <p className="text-amber-700">
            Melbourne is well known for the best function rooms. Melbourne Park
            hosts concerts for major global artists, St Kilda has breathtaking
            beach views perfect for wedding ceremonies, and CBD pubs have a
            stylish, contemporary vibe best for personal events like birthday parties.
          </p>
        </div>
      </section>

      {/* hirers and vendors */}
      <div className="flex flex-col md:flex-row gap-8 py-8 px-4">
        {/* hirers */}
        <section className="flex-1 border border-amber-200 rounded-lg p-6">
          <h3 className="text-2xl font-semibold mb-3 text-[#556B2F]">Hirers</h3>
          <p className="text-amber-700">
            Venues of all capacities available for you. Browse beautiful venues,
            compare prices and suitability, rank your top picks, and submit an application.
          </p>
        </section>

        {/* vendors */}
        <section className="flex-1 border border-amber-200 rounded-lg p-6">
          <h3 className="text-2xl font-semibold mb-3 text-[#556B2F]">Vendors</h3>
          <p className="text-amber-700">
            From a small crowd to a big one, reach your next customers. Review
            applications from hirers, check their booking history and reputation,
            and approve or reject bookings for your venue.
          </p>
        </section>
      </div>
    </div>
  );
}