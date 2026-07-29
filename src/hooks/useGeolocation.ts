import { useEffect, useState } from "react";
import type { Coords } from "@/lib/prayer";

const CACHE_KEY = "iw:coords";

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setCoords({ lat: parsed.lat, lon: parsed.lon });
        setCity(parsed.city ?? null);
      }
    } catch {}

    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(c);
        setLoading(false);
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${c.lat}&lon=${c.lon}&zoom=10`,
            { headers: { Accept: "application/json" } },
          );
          const j = await r.json();
          const label =
            j.address?.city ||
            j.address?.town ||
            j.address?.village ||
            j.address?.state ||
            j.address?.country ||
            "";
          setCity(label);
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ ...c, city: label }),
          );
        } catch {}
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: false, maximumAge: 3600_000, timeout: 8000 },
    );
  }, []);

  return { coords, city, error, loading };
}
