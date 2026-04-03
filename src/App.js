import { supabase } from './supabase'
import { useState } from "react";

const MOVIES = [
  {
    id: 1,
    title: "Interstellar Echoes",
    genre: "Sci-Fi",
    duration: "2h 28m",
    rating: "PG-13",
    score: "9.1",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    color: "#0f172a",
    accent: "#6366f1",
    desc: "A crew of astronauts travels through a wormhole near Saturn in search of a new home for humanity.",
    showtimes: ["10:00 AM", "1:30 PM", "5:00 PM", "8:30 PM"],
  },
  {
    id: 2,
    title: "Crimson Tides",
    genre: "Thriller",
    duration: "1h 58m",
    rating: "R",
    score: "8.4",
    poster: "https://image.tmdb.org/t/p/w500/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg",
    color: "#1a0a0a",
    accent: "#ef4444",
    desc: "A detective uncovers a web of corruption stretching from the ocean floor to the highest offices.",
    showtimes: ["11:15 AM", "2:45 PM", "6:00 PM", "9:15 PM"],
  },
  {
    id: 3,
    title: "The Last Garden",
    genre: "Drama",
    duration: "2h 10m",
    rating: "PG",
    score: "8.8",
    poster: "https://image.tmdb.org/t/p/w500/9Gtg2DzbZmatoNnhZmBkrkEYfzj.jpg",
    color: "#091a0a",
    accent: "#22c55e",
    desc: "An elderly botanist races to preserve the world's rarest seeds before a global catastrophe.",
    showtimes: ["10:30 AM", "1:00 PM", "4:30 PM", "7:45 PM"],
  },
  {
    id: 4,
    title: "Neon Phantom",
    genre: "Action",
    duration: "2h 02m",
    rating: "PG-13",
    score: "7.9",
    poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    color: "#0d0d1a",
    accent: "#a855f7",
    desc: "A vigilante with supernatural abilities fights to protect a city drowning in crime and shadows.",
    showtimes: ["12:00 PM", "3:15 PM", "6:45 PM", "10:00 PM"],
  },
  {
    id: 5,
    title: "Dunes of Time",
    genre: "Adventure",
    duration: "2h 45m",
    rating: "PG",
    score: "8.6",
    poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    color: "#1a1000",
    accent: "#f59e0b",
    desc: "Across shifting sands and ancient ruins, one archaeologist holds the key to rewriting history.",
    showtimes: ["9:45 AM", "1:15 PM", "5:30 PM", "9:00 PM"],
  },
  {
    id: 6,
    title: "Cold Harbor",
    genre: "Horror",
    duration: "1h 52m",
    rating: "R",
    score: "7.6",
    poster: "https://image.tmdb.org/t/p/w500/ArAGHbCTSSeQeT4MiuwFMrLToGo.jpg",
    color: "#050a14",
    accent: "#38bdf8",
    desc: "A remote arctic research station becomes a nightmare when the crew makes a terrifying discovery.",
    showtimes: ["11:00 AM", "2:00 PM", "6:30 PM", "9:30 PM"],
  },
];

const ROWS = ["A","B","C","D","E","F","G","H"];
const COLS = 10;

function generateSeats() {
  const taken = new Set();
  const total = ROWS.length * COLS;
  while (taken.size < Math.floor(total * 0.35)) {
    taken.add(`${ROWS[Math.floor(Math.random() * ROWS.length)]}${Math.floor(Math.random() * COLS) + 1}`);
  }
  return taken;
}

const TICKET_PRICE = 350;

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [takenSeats] = useState(generateSeats);
  const [chosenSeats, setChosenSeats] = useState([]);
  const [, setBooked] = useState(false);
  const [filterGenre, setFilterGenre] = useState("All");
  const [user, setUser] = useState(null);
  const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) console.error('Login error:', error);
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  setUser(null);
};

useState(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });
});  
const genres = ["All", ...new Set(MOVIES.map(m => m.genre))];

  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const formatDate = (d) =>
    d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });

  const toggleSeat = (seat) => {
    if (takenSeats.has(seat)) return;
    setChosenSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  const handleBook = (movie) => {
    setSelectedMovie(movie);
    setSelectedDate(dates[0]);
    setSelectedTime(null);
    setChosenSeats([]);
    setBooked(false);
    setPage("booking");
  };

  const handleConfirm = async () => {
    if (!selectedTime || chosenSeats.length === 0) return;
    
    const { error } = await supabase
      .from('bookings')
      .insert([{
        movie_title: selectedMovie.title,
        show_date: selectedDate.toISOString().split('T')[0],
        show_time: selectedTime,
        seats: chosenSeats.sort().join(', '),
        total_price: chosenSeats.length * TICKET_PRICE
      }]);

    if (error) {
      console.error('Booking error:', error);
      alert('Something went wrong! Please try again.');
      return;
    }

    setBooked(true);
    setPage("confirmation");
  };

  const filtered = filterGenre === "All" ? MOVIES : MOVIES.filter(m => m.genre === filterGenre);

  if (page === "confirmation") {
    return (
      <div style={{ minHeight: "100vh", background: "#080c14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif" }}>
        <div style={{ textAlign: "center", padding: "3rem", maxWidth: 480 }}>
          <div style={{ fontSize: 72, marginBottom: "1.5rem" }}>🎟️</div>
          <h1 style={{ color: "#fff", fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "'Georgia', serif" }}>Booking Confirmed!</h1>
          <p style={{ color: "#94a3b8", marginBottom: "2rem", fontSize: "1rem" }}>Your tickets are ready. See you at the cinema!</p>

          <div style={{ background: "#111827", borderRadius: 16, padding: "1.5rem", textAlign: "left", marginBottom: "2rem", border: "1px solid #1e293b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "1.5rem" }}>
              <span style={{ fontSize: 36 }}>{selectedMovie.poster}</span>
              <div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: "1.1rem" }}>{selectedMovie.title}</div>
                <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{selectedMovie.genre} · {selectedMovie.rating}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                ["Date", formatDate(selectedDate)],
                ["Time", selectedTime],
                ["Seats", chosenSeats.sort().join(", ")],
                ["Total", `₹${(chosenSeats.length * TICKET_PRICE).toLocaleString("en-IN")}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>{k}</div>
                  <div style={{ color: "#e2e8f0", fontWeight: 500, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => { setPage("home"); setSelectedMovie(null); }}
            style={{ background: selectedMovie.accent, color: "#fff", border: "none", borderRadius: 10, padding: "0.85rem 2.5rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  if (page === "booking") {
    return (
      <div style={{ minHeight: "100vh", background: "#080c14", fontFamily: "'Georgia', serif", color: "#fff" }}>
        {/* Header */}
        <div style={{ padding: "1.25rem 2rem", display: "flex", alignItems: "center", gap: "1rem", borderBottom: "1px solid #1e293b" }}>
          <button onClick={() => setPage("home")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.5rem", lineHeight: 1 }}>←</button>
          <span style={{ fontSize: 24 }}>{selectedMovie.poster}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{selectedMovie.title}</div>
            <div style={{ color: "#64748b", fontSize: "0.8rem" }}>{selectedMovie.duration} · {selectedMovie.rating}</div>
          </div>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1.5rem" }}>

          {/* Date Picker */}
          <Section title="Select Date" accent={selectedMovie.accent}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {dates.map((d, i) => {
                const active = selectedDate && d.toDateString() === selectedDate.toDateString();
                return (
                  <button key={i} onClick={() => { setSelectedDate(d); setSelectedTime(null); setChosenSeats([]); }}
                    style={{ background: active ? selectedMovie?.accent : "#111827", color: active ? "#fff" : "#94a3b8", border: active ? "none" : "1px solid #1e293b", borderRadius: 10, padding: "0.65rem 1rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: active ? 600 : 400, fontFamily: "inherit" }}>
                    {i === 0 ? "Today" : i === 1 ? "Tomorrow" : formatDate(d)}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Showtime Picker */}
          <Section title="Select Showtime" accent={selectedMovie.accent}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(selectedMovie?.showtimes || []).map(t =>{
                const active = selectedTime === t;
                return (
                  <button key={t} onClick={() => { setSelectedTime(t); setChosenSeats([]); }}
                    style={{ background: active ? selectedMovie?.accent : "#111827", color: active ? "#fff" : "#94a3b8", border: active ? "none" : "1px solid #1e293b", borderRadius: 10, padding: "0.65rem 1.25rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: active ? 600 : 400, fontFamily: "inherit" }}>
                    {t}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Seat Map */}
          {selectedTime && (
            <Section title="Select Seats" accent={selectedMovie.accent}>
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "inline-block", background: selectedMovie.accent + "22", border: `1px solid ${selectedMovie.accent}44`, borderRadius: 6, padding: "0.3rem 2rem", fontSize: "0.75rem", color: selectedMovie.accent, marginBottom: "1.5rem", letterSpacing: "0.15em" }}>SCREEN</div>

                <div style={{ overflowX: "auto" }}>
                  <div style={{ display: "inline-block", minWidth: 340 }}>
                    {ROWS.map(row => (
                      <div key={row} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, justifyContent: "center" }}>
                        <span style={{ color: "#475569", fontSize: "0.75rem", width: 16, textAlign: "right" }}>{row}</span>
                        {Array.from({ length: COLS }, (_, i) => {
                          const seat = `${row}${i + 1}`;
                          const taken = takenSeats.has(seat);
                          const chosen = chosenSeats.includes(seat);
                          return (
                            <button key={seat} onClick={() => toggleSeat(seat)} disabled={taken}
                              title={seat}
                              style={{
                                width: 28, height: 28, borderRadius: 5, border: "none",
                                background: taken ? "#1e293b" : chosen ? selectedMovie.accent : "#1a2744",
                                cursor: taken ? "not-allowed" : "pointer",
                                transition: "transform 0.1s",
                              }} />
                          );
                        })}
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: "1.25rem", fontSize: "0.75rem", color: "#64748b" }}>
                      <span><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "#1a2744", marginRight: 5, verticalAlign: "middle" }} />Available</span>
                      <span><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: selectedMovie.accent, marginRight: 5, verticalAlign: "middle" }} />Selected</span>
                      <span><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "#1e293b", marginRight: 5, verticalAlign: "middle" }} />Taken</span>
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* Summary & CTA */}
          {chosenSeats.length > 0 && (
            <div style={{ background: "#111827", borderRadius: 14, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #1e293b", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{chosenSeats.length} seat{chosenSeats.length > 1 ? "s" : ""} · {chosenSeats.sort().join(", ")}</div>
                <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700, marginTop: 2 }}>₹{(chosenSeats.length * TICKET_PRICE).toLocaleString("en-IN")}</div>
              </div>
              <button onClick={handleConfirm}
                style={{ background: selectedMovie.accent, color: "#fff", border: "none", borderRadius: 10, padding: "0.85rem 2rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Confirm Booking →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Home page
  return (
    <div style={{ minHeight: "100vh", background: "#080c14", fontFamily: "'Georgia', serif", color: "#fff" }}>
      {/* Nav */}
      <nav style={{ padding: "1.25rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #0f172a" }}>
  <div style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.03em" }}>
    <span style={{ color: "#f59e0b" }}>■</span> CineMax
  </div>
  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
    {["Movies", "Cinemas", "Offers"].map(item => (
      <span key={item} style={{ color: "#475569", fontSize: "0.9rem", cursor: "pointer" }}>{item}</span>
    ))}
    {user ? (
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>👋 {user.user_metadata.full_name}</span>
        <button onClick={handleLogout}
          style={{ background: "none", border: "1px solid #475569", borderRadius: 8, padding: "0.4rem 1rem", color: "#94a3b8", cursor: "pointer", fontSize: "0.85rem", fontFamily: "Georgia, serif" }}>
          Logout
        </button>
      </div>
    ) : (
      <button onClick={handleGoogleLogin}
        style={{ background: "#f59e0b", border: "none", borderRadius: 8, padding: "0.4rem 1rem", color: "#000", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700, fontFamily: "Georgia, serif" }}>
        Sign in with Google
      </button>
    )}
  </div>
</nav>

      {/* Hero */}
      <div style={{ padding: "3rem 2rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: "0.5rem", color: "#f59e0b", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Now Showing</div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 2rem", letterSpacing: "-0.03em" }}>
          Book Your<br /><span style={{ color: "#f59e0b" }}>Perfect Seat.</span>
        </h1>

        {/* Genre Filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "2.5rem" }}>
          {genres.map(g => (
            <button key={g} onClick={() => setFilterGenre(g)}
              style={{ background: filterGenre === g ? "#f59e0b" : "#111827", color: filterGenre === g ? "#0a0a00" : "#64748b", border: "1px solid", borderColor: filterGenre === g ? "#f59e0b" : "#1e293b", borderRadius: 20, padding: "0.4rem 1rem", fontSize: "0.82rem", fontWeight: filterGenre === g ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
              {g}
            </button>
          ))}
        </div>

        {/* Movie Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {filtered.map(movie => (
            <MovieCard key={movie.id} movie={movie} onBook={handleBook} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MovieCard({ movie, onBook }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: "#0d1117", border: "1px solid", borderColor: hovered ? movie.accent + "66" : "#1e293b", borderRadius: 16, overflow: "hidden", transition: "border-color 0.25s, transform 0.2s", transform: hovered ? "translateY(-3px)" : "none", cursor: "default" }}>
      {/* Poster */}
      <div style={{ height: 240, position: "relative", overflow: "hidden" }}>
  <img src={movie.poster} alt={movie.title}
    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 12, right: 12, background: "#00000066", borderRadius: 8, padding: "3px 10px", fontSize: "0.78rem", fontWeight: 600, color: "#fbbf24", backdropFilter: "blur(4px)" }}>
          ★ {movie.score}
        </div>
        <div style={{ position: "absolute", top: 12, left: 12, background: movie.accent + "33", border: `1px solid ${movie.accent}55`, borderRadius: 8, padding: "3px 10px", fontSize: "0.72rem", color: movie.accent }}>
          {movie.rating}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 2 }}>{movie.title}</div>
            <div style={{ color: "#475569", fontSize: "0.78rem" }}>{movie.genre} · {movie.duration}</div>
          </div>
        </div>
        <p style={{ color: "#64748b", fontSize: "0.82rem", lineHeight: 1.6, margin: "0.75rem 0 1.25rem" }}>{movie.desc}</p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
          {movie.showtimes.slice(0, 3).map(t => (
            <span key={t} style={{ background: "#111827", color: "#94a3b8", border: "1px solid #1e293b", borderRadius: 7, padding: "3px 10px", fontSize: "0.75rem" }}>{t}</span>
          ))}
          {movie.showtimes.length > 3 && <span style={{ color: "#475569", fontSize: "0.75rem", alignSelf: "center" }}>+{movie.showtimes.length - 3}</span>}
        </div>

        <button onClick={() => onBook(movie)}
          style={{ width: "100%", background: movie.accent, color: "#fff", border: "none", borderRadius: 10, padding: "0.75rem", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", fontFamily: "Georgia, serif", transition: "opacity 0.2s" }}
          onMouseEnter={e => e.target.style.opacity = 0.88}
          onMouseLeave={e => e.target.style.opacity = 1}>
          Book Tickets · ₹{TICKET_PRICE}
        </button>
      </div>
    </div>
  );
}

function Section({ title, accent, children }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
        <span style={{ display: "inline-block", width: 3, height: 18, borderRadius: 2, background: accent }} />
        <h3 style={{ fontWeight: 600, fontSize: "0.95rem", color: "#e2e8f0", margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}
