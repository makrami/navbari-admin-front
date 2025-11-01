import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import Map, {
  Layer,
  NavigationControl,
  Source,
  Marker,
  type MapMouseEvent,
  type MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { FeatureCollection, LineString, Position } from "geojson";
import { TruckIcon } from "lucide-react";
import type { Map as MapboxMap, MapboxEvent } from "mapbox-gl";

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
  mapboxToken?: string;
  onSegmentClick?: (segment: Segment, index: number) => void;
  onMapClick?: () => void;
};

const SEGMENT_DURATION_MS = 2000;
const ROUTING_PROFILE = "driving-traffic"; // or "driving"
const GREEN_MAP_STYLE = "mapbox://styles/mapbox/outdoors-v12";

export function CargoMap({
  segments,
  initialView,
  mapboxToken,
  onSegmentClick,
  onMapClick,
}: Props) {
  const token =
    mapboxToken ?? (import.meta.env.VITE_MAPBOX_TOKEN as string | undefined);
  const [progress, setProgress] = useState({ segmentIdx: 0, t: 0 });
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [hoveredSegmentIdx, setHoveredSegmentIdx] = useState<number | null>(
    null
  );

  const applyGreenPalette = useCallback((map: MapboxMap) => {
    type PaintProperty =
      | "background-color"
      | "fill-color"
      | "line-color"
      | "icon-color";

    const setPaint = (
      layerId: string,
      property: PaintProperty,
      value: string
    ) => {
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, property, value);
      }
    };

    const setPaintBulk = (
      layerIds: string[],
      property: PaintProperty,
      value: string
    ) => {
      layerIds.forEach((id) => setPaint(id, property, value));
    };

    setPaint("background", "background-color", "#e6f8eb");
    setPaintBulk(
      ["land", "landcover", "national-park", "landuse"],
      "fill-color",
      "#effcf3"
    );
    setPaintBulk(
      [
        "landcover_grass",
        "landcover_scrub",
        "landcover_crop",
        "landcover_wood",
      ],
      "fill-color",
      "#daf5e0"
    );
    setPaintBulk(
      ["water", "water-shadow", "waterway", "waterway-shadow"],
      "fill-color",
      "#c7f1d7"
    );

    setPaintBulk(
      [
        "road-primary",
        "road-primary-casing",
        "road-secondary",
        "road-secondary-casing",
        "road-tertiary",
        "road-tertiary-casing",
      ],
      "line-color",
      "#5aa469"
    );

    setPaintBulk(
      [
        "road-street",
        "road-street-casing",
        "road-pedestrian",
        "road-pedestrian-casing",
      ],
      "line-color",
      "#7fcf8a"
    );

    setPaintBulk(
      ["building", "building-outline", "structure-polygon"],
      "fill-color",
      "#d6f5de"
    );

    setPaintBulk(
      ["poi", "poi-scalerank1", "poi-parks", "poi-land"],
      "icon-color",
      "#2c6e49"
    );
  }, []);

  const handleMapLoad = useCallback(
    (event: MapboxEvent) => {
      const map = event.target as MapboxMap;
      mapRef.current = map as unknown as MapRef;
      const applyPalette = () => applyGreenPalette(map);
      applyPalette();
      map.on("styledata", applyPalette);
      map.once("remove", () => {
        map.off("styledata", applyPalette);
      });
    },
    [applyGreenPalette]
  );

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

  useEffect(() => {
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
  }, [segments.length, progress.segmentIdx]);

  const [routeSources, setRouteSources] = useState<
    {
      id: string;
      data: FeatureCollection<LineString>;
      color: string;
      segmentIdx: number;
    }[]
  >([]);

  useEffect(() => {
    let aborted = false;
    async function fetchAllRoutes() {
      if (!token) return;
      try {
        const results = await Promise.all(
          segments.map(async (segment, idx) => {
            const coordsParam = segment.path
              .map((p) => `${p[0]},${p[1]}`)
              .join(";");
            const url =
              `https://api.mapbox.com/directions/v5/mapbox/${ROUTING_PROFILE}/` +
              `${coordsParam}?geometries=geojson&overview=full&steps=false&alternatives=false&access_token=${token}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Directions error ${res.status}`);
            const json = (await res.json()) as {
              routes?: Array<{
                geometry?: { coordinates?: Position[]; type: string };
              }>;
            };
            const route = json.routes && json.routes[0];
            const geometry = route?.geometry?.coordinates as
              | Position[]
              | undefined;
            if (!geometry || geometry.length < 2) {
              return null; // skip rendering if route missing
            }
            const data: FeatureCollection<LineString> = {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: geometry,
                  },
                },
              ],
            };
            return {
              id: `segment-${idx}`,
              data,
              color: segment.color,
              segmentIdx: idx,
            };
          })
        );
        if (!aborted) {
          setRouteSources(
            results.filter(
              (
                r
              ): r is {
                id: string;
                data: FeatureCollection<LineString>;
                color: string;
                segmentIdx: number;
              } => r !== null
            )
          );
        }
      } catch (e) {
        if (!aborted) {
          setRouteSources([]);
          setMapError((e as Error).message || "Failed to fetch routes");
        }
      }
    }
    fetchAllRoutes();
    return () => {
      aborted = true;
    };
  }, [segments, token]);

  const labelPoints = useMemo(() => {
    if (routeSources.length > 0) {
      return routeSources.map((src) => {
        const geom = src.data.features[0]?.geometry;
        const coords = (geom && (geom as LineString).coordinates) as
          | Position[]
          | undefined;
        const midIdx =
          coords && coords.length ? Math.floor(coords.length / 2) : 0;
        const pos =
          coords && coords[midIdx] ? coords[midIdx] : ([0, 0] as Position);
        const segIdx = src.segmentIdx;
        const raw = segments[segIdx]?.meta?.trucksCount as
          | number
          | string
          | undefined;
        const count =
          typeof raw === "number" ? raw : raw ? parseInt(raw, 10) : 0;
        return {
          id: `label-${segIdx}`,
          lng: pos[0],
          lat: pos[1],
          count,
          color: src.color,
        };
      });
    }
    // Fallback to straight midpoint if routes not available
    return segments.map((segment, idx) => {
      const a = segment.path[0];
      const b = segment.path[segment.path.length - 1];
      const lng = (a[0] + b[0]) / 2;
      const lat = (a[1] + b[1]) / 2;
      const raw = segment.meta?.trucksCount as number | string | undefined;
      const count = typeof raw === "number" ? raw : raw ? parseInt(raw, 10) : 0;
      return { id: `label-${idx}`, lng, lat, count, color: segment.color };
    });
  }, [routeSources, segments]);

  const endpointMarkers = useMemo(
    () =>
      segments.flatMap((segment, idx) => {
        const start = segment.path[0];
        const end = segment.path[segment.path.length - 1];
        const originFlag =
          (segment.meta?.originFlag as string | undefined) || "";
        const destFlag = (segment.meta?.destFlag as string | undefined) || "";
        const originIso2 =
          (segment.meta?.originIso2 as string | undefined) || "";
        const destIso2 = (segment.meta?.destIso2 as string | undefined) || "";
        const markers: Array<{
          id: string;
          lng: number;
          lat: number;
          label: string;
          iso2: string;
          color: string;
        }> = [];
        // Always render endpoint markers; show flag image if available, otherwise emoji, otherwise a colored dot
        if (start) {
          markers.push({
            id: `start-${idx}`,
            lng: start[0],
            lat: start[1],
            label: originFlag,
            iso2: originIso2,
            color: segment.color,
          });
        }
        if (end) {
          markers.push({
            id: `end-${idx}`,
            lng: end[0],
            lat: end[1],
            label: destFlag,
            iso2: destIso2,
            color: segment.color,
          });
        }
        return markers;
      }),
    [segments]
  );

  const interactiveIds = useMemo(
    () => routeSources.map((s) => `${s.id}-line`),
    [routeSources]
  );

  const handleMapClick = (e: MapMouseEvent) => {
    const feature = e.features && e.features[0];
    if (!feature || !feature.layer?.id) {
      // Clicked on map but not on a segment
      onMapClick?.();
      return;
    }

    if (onSegmentClick) {
      const layerId = feature.layer.id as string;
      const i = routeSources.findIndex((s) => `${s.id}-line` === layerId);
      if (i >= 0) {
        const segIdx = routeSources[i].segmentIdx;
        onSegmentClick(segments[segIdx], segIdx);
      } else {
        // Clicked on map but not on a segment
        onMapClick?.();
      }
    } else {
      // No segment click handler, but still notify map click
      onMapClick?.();
    }
  };

  const handleMouseMove = (e: MapMouseEvent) => {
    if (!e.features || e.features.length === 0) {
      setHoveredSegmentIdx(null);
      return;
    }
    const feature = e.features[0];
    if (!feature || !feature.layer?.id) {
      setHoveredSegmentIdx(null);
      return;
    }
    const layerId = feature.layer.id as string;
    const segmentIdx = routeSources.findIndex(
      (s) => `${s.id}-line` === layerId
    );
    if (segmentIdx >= 0) {
      setHoveredSegmentIdx(segmentIdx);
    } else {
      setHoveredSegmentIdx(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredSegmentIdx(null);
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-white">
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
          ref={mapRef}
          mapboxAccessToken={token}
          initialViewState={center}
          mapStyle={GREEN_MAP_STYLE}
          interactiveLayerIds={interactiveIds}
          onClick={handleMapClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          cursor={hoveredSegmentIdx !== null ? "pointer" : "default"}
          onLoad={handleMapLoad}
          onError={(e) => {
            const msg =
              (e as unknown as { error?: Error }).error?.message ??
              "Map failed to load";
            setMapError(msg);
          }}
        >
          <NavigationControl position="top-right" />

          {routeSources.map((src, idx) => {
            const isHovered = hoveredSegmentIdx === idx;
            const hoverColor = isHovered ? "#ff6b35" : src.color; // Orange color on hover
            const lineWidth = isHovered ? 6 : 4;

            return (
              <Source key={src.id} id={src.id} type="geojson" data={src.data}>
                <Layer
                  id={`${src.id}-line`}
                  type="line"
                  layout={{ "line-cap": "round", "line-join": "round" }}
                  paint={{
                    "line-color": hoverColor,
                    "line-width": lineWidth,
                    "line-opacity": 0.9,
                  }}
                />
              </Source>
            );
          })}

          {labelPoints.map((p) => (
            <Marker
              key={p.id}
              longitude={p.lng}
              latitude={p.lat}
              anchor="center"
            >
              <div className="rounded-md bg-white text-slate-900 text-xs p-1 border border-slate-200  flex items-center gap-1">
                <TruckIcon className="size-4 text-slate-900" />
                <span>{p.count}</span>
              </div>
            </Marker>
          ))}

          {endpointMarkers.map((m) => (
            <Marker
              key={m.id}
              longitude={m.lng}
              latitude={m.lat}
              anchor="center"
            >
              {m.iso2 ? (
                <div
                  className="rounded-md p-1 bg-white flex items-center justify-center "
                  title={m.iso2}
                >
                  <ReactCountryFlag
                    svg
                    countryCode={(m.iso2 || "").toUpperCase()}
                    style={{ width: 20, height: 14, display: "block" }}
                  />
                </div>
              ) : m.label ? (
                <div
                  className="rounded-full bg-white flex items-center justify-center border shadow text-base leading-none"
                  style={{
                    width: 28,
                    height: 28,
                    borderColor: "rgba(0,0,0,0.2)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                  }}
                  title={m.label}
                >
                  {m.label}
                </div>
              ) : (
                <div
                  className="rounded-full border shadow"
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: m.color,
                    borderColor: "rgba(0,0,0,0.2)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                  }}
                  title="route endpoint"
                />
              )}
            </Marker>
          ))}
        </Map>
      )}

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
