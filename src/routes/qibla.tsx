import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useGeolocation } from "@/hooks/useGeolocation";
import { computeQiblaBearing, distanceToKaabaKm } from "@/lib/prayer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { Compass, MapPin } from "lucide-react";

export const Route = createFileRoute("/qibla")({
  head: () => ({
    meta: [
      { title: "Qibla Compass — Islamic World" },
      {
        name: "description",
        content:
          "Live Qibla direction from your location, distance to the Kaaba in Makkah, and a rotating compass.",
      },
      { property: "og:title", content: "Qibla Compass — Islamic World" },
    ],
  }),
  component: QiblaPage,
});

function QiblaPage() {
  const { coords, city } = useGeolocation();
  const [heading, setHeading] = useState<number | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);

  const bearing = useMemo(
    () => (coords ? computeQiblaBearing(coords) : null),
    [coords],
  );
  const distance = useMemo(
    () => (coords ? distanceToKaabaKm(coords) : null),
    [coords],
  );

  const requestOrientation = () => {
    const handler = (ev: DeviceOrientationEvent) => {
      const alpha =
        // iOS
        (ev as any).webkitCompassHeading ?? (ev.alpha != null ? 360 - ev.alpha : null);
      if (typeof alpha === "number") setHeading(alpha);
    };
    const need = (DeviceOrientationEvent as any).requestPermission;
    if (typeof need === "function") {
      need()
        .then((r: string) => {
          if (r === "granted") {
            setSupported(true);
            window.addEventListener("deviceorientation", handler as any, true);
          } else setSupported(false);
        })
        .catch(() => setSupported(false));
    } else if ("DeviceOrientationEvent" in window) {
      setSupported(true);
      window.addEventListener("deviceorientationabsolute", handler as any, true);
      window.addEventListener("deviceorientation", handler as any, true);
    } else {
      setSupported(false);
    }
  };

  useEffect(() => {
    // auto-init on non-iOS
    if (typeof window === "undefined") return;
    if (!(DeviceOrientationEvent as any)?.requestPermission) requestOrientation();
  }, []);

  const rotation =
    heading != null && bearing != null ? bearing - heading : bearing ?? 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6 text-center">
          <div className="text-xs uppercase tracking-widest gold-text">
            Ittijāh al-Qiblah
          </div>
          <h1 className="font-display text-4xl md:text-5xl mt-1">Qibla Compass</h1>
          <p className="text-muted-foreground mt-2 inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {city ?? (coords ? "Locating…" : "Enable location to begin")}
          </p>
        </header>

        <Card className="glass">
          <CardContent className="p-8">
            <div className="relative mx-auto h-72 w-72 sm:h-80 sm:w-80 rounded-full border-4 border-primary/20 grid place-items-center overflow-hidden"
              style={{ backgroundImage: "var(--gradient-surface)" }}
            >
              {/* Compass ticks */}
              <div className="absolute inset-0">
                {["N", "E", "S", "W"].map((dir, i) => (
                  <div
                    key={dir}
                    className="absolute inset-0 grid place-items-center text-xs font-medium text-muted-foreground"
                    style={{ transform: `rotate(${i * 90}deg)` }}
                  >
                    <span
                      className="absolute top-2"
                      style={{ transform: `rotate(${-i * 90}deg)` }}
                    >
                      {dir}
                    </span>
                  </div>
                ))}
              </div>
              {/* Kaaba pointer */}
              <div
                className="absolute inset-0 transition-transform duration-300 ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="absolute left-1/2 top-2 -translate-x-1/2 flex flex-col items-center">
                  <div
                    className="w-0 h-0"
                    style={{
                      borderLeft: "14px solid transparent",
                      borderRight: "14px solid transparent",
                      borderBottom: "24px solid var(--gold)",
                      filter:
                        "drop-shadow(0 4px 10px color-mix(in oklab, var(--gold) 50%, transparent))",
                    }}
                  />
                  <div className="mt-2 h-2 w-2 rounded-full bg-gold" />
                </div>
              </div>
              {/* Center */}
              <div
                className="h-16 w-16 rounded-full grid place-items-center text-primary-foreground shadow-elegant"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                <Compass className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl border bg-card p-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Bearing
                </div>
                <div className="font-display text-3xl mt-1">
                  {bearing != null ? `${Math.round(bearing)}°` : "—"}
                </div>
              </div>
              <div className="rounded-2xl border bg-card p-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Distance to Kaaba
                </div>
                <div className="font-display text-3xl mt-1">
                  {distance != null ? `${distance.toLocaleString()} km` : "—"}
                </div>
              </div>
            </div>

            {supported === false && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Live compass isn't available on this device — the pointer shows
                the fixed bearing from north.
              </p>
            )}
            {(DeviceOrientationEvent as any)?.requestPermission && !heading && (
              <div className="mt-4 text-center">
                <Button onClick={requestOrientation} className="rounded-full">
                  Enable live compass
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
