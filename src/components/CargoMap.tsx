import { useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapMouseEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { FeatureCollection, LineString, Position } from "geojson";

export type Segment = {
  color: string;
  path: readonly [number, number][]; // [lng, lat]
  meta?: Record<string, string | number>;
};

type Props = {
  segments: Segment[];
  initialView?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  onSegmentClick?: (segment: Segment, index: number) => void;
};

const SEGMENT_DURATION_MS = 2000;

export function CargoMap({ segments, initialView, onSegmentClick }: Props) {
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState({ segmentIdx: 0, t: 0 });
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const allCoords = useMemo(() => segments.flatMap((s) => s.path), [segments]);

  const center = useMemo(() => {
    if (initialView) return initialView;
    if (allCoords.length === 0) {
      return { longitude: 2.5, latitude: 48.8, zoom: 4 };
    }
    const lons = allCoords.map((c) => c[0]);
    const lats = allCoords.map((c) => c[1]);
    const longitude = (Math.min(...lons) + Math.max(...lons)) / 2;
    const latitude = (Math.min(...lats) + Math.max(...lats)) / 2;
    return { longitude, latitude, zoom: 4 };
  }, [allCoords, initialView]);

  const sources = useMemo(
    () =>
      segments.map((segment, idx) => ({
        id: `segment-${idx}`,
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: segment.path.map(
                  (p) => [p[0], p[1]] as Position
                ) as Position[],
              },
            },
          ],
        } satisfies FeatureCollection<LineString>,
        color: segment.color,
      })),
    [segments]
  );

  function interpolate(
    a: readonly [number, number],
    b: readonly [number, number],
    t: number
  ) {
    const lng = a[0] + (b[0] - a[0]) * t;
    const lat = a[1] + (b[1] - a[1]) * t;
    return [lng, lat] as [number, number];
  }

  const cargoLngLat = useMemo(() => {
    const seg = segments[progress.segmentIdx];
    if (!seg) return allCoords[allCoords.length - 1] ?? [0, 0];
    const [from, to] = seg.path;
    return interpolate(from, to, progress.t);
  }, [segments, progress, allCoords]);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startTimeRef.current = null;
      return;
    }
    const tick = (now: number) => {
      if (startTimeRef.current == null) {
        // resume from current progress.t
        startTimeRef.current = now - progress.t * SEGMENT_DURATION_MS;
      }
      const elapsed = now - startTimeRef.current;
      const t = Math.min(1, elapsed / SEGMENT_DURATION_MS);
      setProgress((prev) => ({ ...prev, t }));
      if (t >= 1) {
        setProgress((prev) => {
          const nextSeg = prev.segmentIdx + 1;
          if (nextSeg >= segments.length) {
            startTimeRef.current = now; // restart
            return { segmentIdx: 0, t: 0 };
          }
          startTimeRef.current = now;
          return { segmentIdx: nextSeg, t: 0 };
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, segments.length, progress.segmentIdx]);

  const interactiveIds = useMemo(
    () => sources.map((s) => `${s.id}-line`),
    [sources]
  );

  const handleMapClick = (e: MapMouseEvent) => {
    if (!onSegmentClick) return;
    const feature = e.features && e.features[0];
    if (!feature || !feature.layer?.id) return;
    const layerId = feature.layer.id as string;
    const idx = interactiveIds.findIndex((id) => id === layerId);
    if (idx >= 0) {
      onSegmentClick(segments[idx], idx);
    }
  };

  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-xl bg-white">
      {/* Fallback if token is missing */}
      {!token ? (
        <div className="flex h-full w-full items-center justify-center p-6 text-center">
          <div>
            <div className="text-sm font-semibold text-slate-800">
              Mapbox token missing
            </div>
            <div className="mt-1 text-xs text-slate-600">
              Add <span className="font-semibold">VITE_MAPBOX_TOKEN</span> to
              your <span className="font-mono">.env</span>, then restart the dev
              server.
            </div>
          </div>
        </div>
      ) : (
        <Map
          mapboxAccessToken={token}
          initialViewState={center}
          mapStyle="mapbox://styles/mapbox/light-v11"
          interactiveLayerIds={interactiveIds}
          onClick={handleMapClick}
          onError={(e) => {
            const msg =
              (e as unknown as { error?: Error }).error?.message ??
              "Map failed to load";
            setMapError(msg);
          }}
        >
          <NavigationControl position="top-right" />

          {sources.map((src) => (
            <Source key={src.id} id={src.id} type="geojson" data={src.data}>
              <Layer
                id={`${src.id}-line`}
                type="line"
                paint={{ "line-color": src.color, "line-width": 4 }}
              />
            </Source>
          ))}

          <Marker
            longitude={cargoLngLat[0]}
            latitude={cargoLngLat[1]}
            anchor="center"
          >
            <div className="grid size-4 place-items-center rounded-full bg-[#1b54fe] ring-4 ring-white shadow-lg" />
          </Marker>
        </Map>
      )}

      <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-full bg-white/90 px-3 py-2 shadow-md ring-1 ring-slate-200 backdrop-blur">
          <button
            className="rounded-md bg-[#1b54fe] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#1646d1]"
            onClick={() => setIsPlaying(true)}
          >
            Play
          </button>
          <button
            className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            onClick={() => setIsPlaying(false)}
          >
            Pause
          </button>
        </div>
      </div>

      {mapError && token && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center p-6">
          <div className="pointer-events-auto rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 shadow-sm">
            {mapError}
          </div>
        </div>
      )}
    </div>
  );
}

export default CargoMap;
