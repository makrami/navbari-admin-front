import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import Map, {
  Layer,
  NavigationControl,
  Source,
  Marker,
  type MapMouseEvent,
  type MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type {FeatureCollection, LineString, Position} from "geojson";
import {TruckIcon} from "lucide-react";
import type {Map as MapboxMap, MapboxEvent} from "mapbox-gl";
import {useQueries} from "@tanstack/react-query";
import {shipmentKeys} from "../services/shipment/hooks";
import {getSegmentRoute} from "../services/shipment/shipment.api.service";

type Props = {
  segmentIds: string[];
  initialView?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  mapboxToken?: string;
  onSegmentClick?: (segmentId: string, index: number) => void;
  onMapClick?: () => void;
};

const GREEN_MAP_STYLE = "mapbox://styles/mapbox/navigation-day-v1";
const DEFAULT_COLOR = "#1b54fe";
const COLORS = ["#1b54fe", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function CargoMap({
  segmentIds,
  initialView,
  mapboxToken,
  onSegmentClick,
  onMapClick,
}: Props) {
  const token =
    mapboxToken ?? (import.meta.env.VITE_MAPBOX_TOKEN as string | undefined);
  const mapRef = useRef<MapRef | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [hoveredSegmentIdx, setHoveredSegmentIdx] = useState<number | null>(
    null
  );
  const hasFittedBoundsRef = useRef(false);
  const mapInstanceRef = useRef<MapboxMap | null>(null);

  // Reset bounds fitting when segmentIds change
  useEffect(() => {
    hasFittedBoundsRef.current = false;
  }, [segmentIds]);

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
      // Store the actual mapbox map instance for fitBounds
      mapInstanceRef.current = map;
      const applyPalette = () => applyGreenPalette(map);
      applyPalette();
      map.on("styledata", applyPalette);
      map.once("remove", () => {
        map.off("styledata", applyPalette);
        mapInstanceRef.current = null;
      });
    },
    [applyGreenPalette]
  );

  // Fetch routes using TanStack Query
  const routeQueries = useQueries({
    queries: segmentIds.map((segmentId) => ({
      queryKey: shipmentKeys.segmentRoute(segmentId),
      queryFn: () => getSegmentRoute(segmentId),
      enabled: !!segmentId,
      retry: 1,
    })),
  });

  // Process route queries into route sources
  const routeSources = useMemo(() => {
    const sources: {
      id: string;
      data: FeatureCollection<LineString>;
      color: string;
      segmentId: string;
      segmentIdx: number;
    }[] = [];

    routeQueries.forEach((query, idx) => {
      const segmentId = segmentIds[idx];
      if (!segmentId) return;

      if (query.isError) {
        return;
      }

      if (query.data) {
        const geometry = query.data.geometry;
        if (geometry && geometry.length > 0) {
          const coordinates = geometry;
          if (coordinates.length >= 2) {
            const color = COLORS[idx % COLORS.length] || DEFAULT_COLOR;
            const data: FeatureCollection<LineString> = {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: coordinates as unknown as Position[],
                  },
                },
              ],
            };
            sources.push({
              id: `segment-${idx}`,
              data,
              color,
              segmentId,
              segmentIdx: idx,
            });
          }
        }
      }
    });

    return sources;
  }, [routeQueries, segmentIds]);

  // Calculate center from route data
  const center = useMemo(() => {
    if (initialView) {
      return {...initialView, pitch: 0, bearing: 0};
    }

    const allCoords: Position[] = [];
    routeQueries.forEach((query) => {
      if (query.data?.geometry) {
        const coords = query.data.geometry as unknown as Position[];
        allCoords.push(...(coords as Position[]));
      }
    });

    if (allCoords.length === 0) {
      return {longitude: 105.0, latitude: 35.0, zoom: 4, pitch: 0, bearing: 0};
    }

    const lons = allCoords.map((c) => c[0]);
    const lats = allCoords.map((c) => c[1]);
    const longitude = (Math.min(...lons) + Math.max(...lons)) / 2;
    const latitude = (Math.min(...lats) + Math.max(...lats)) / 2;
    return {longitude, latitude, zoom: 4, pitch: 0, bearing: 0};
  }, [routeQueries, initialView]);

  // Set map error if any query failed
  useEffect(() => {
    const errorQuery = routeQueries.find((q) => q.isError);
    if (errorQuery?.error) {
      const errorMessage =
        errorQuery.error instanceof Error
          ? errorQuery.error.message
          : "Failed to fetch routes";
      setMapError(errorMessage);
    } else {
      setMapError(null);
    }
  }, [routeQueries]);

  // Create endpoint markers from route data
  const endpointMarkers = useMemo(() => {
    const markers: Array<{
      id: string;
      lng: number;
      lat: number;
      color: string;
    }> = [];

    routeQueries.forEach((query, idx) => {
      if (query.data) {
        const route = query.data;
        const color = COLORS[idx % COLORS.length] || DEFAULT_COLOR;

        // Origin marker
        markers.push({
          id: `start-${idx}`,
          lng: route.originLongitude,
          lat: route.originLatitude,
          color,
        });

        // Destination marker
        markers.push({
          id: `end-${idx}`,
          lng: route.destinationLongitude,
          lat: route.destinationLatitude,
          color,
        });
      }
    });

    return markers;
  }, [routeQueries]);

  // Create label points (midpoint of route)
  const labelPoints = useMemo(() => {
    return routeSources.map((src) => {
      const geom = src.data.features[0]?.geometry;
      const coords = (geom && (geom as LineString).coordinates) as
        | Position[]
        | undefined;
      const midIdx =
        coords && coords.length ? Math.floor(coords.length / 2) : 0;
      const pos =
        coords && coords[midIdx] ? coords[midIdx] : ([0, 0] as Position);
      return {
        id: `label-${src.segmentIdx}`,
        lng: pos[0],
        lat: pos[1],
        color: src.color,
      };
    });
  }, [routeSources]);

  // Fit map bounds to show all routes after they're loaded
  useEffect(() => {
    // Only fit bounds if we have routes and haven't done it yet
    // Note: We'll auto-fit even if initialView is provided, as routes may extend beyond it
    if (
      hasFittedBoundsRef.current ||
      routeSources.length === 0 ||
      !mapInstanceRef.current
    ) {
      return;
    }

    // Check if all routes are loaded
    const allLoaded = routeQueries.every(
      (query) => query.isSuccess || query.isError
    );
    if (!allLoaded) {
      return;
    }

    // Collect all coordinates from routes
    const allCoords: Position[] = [];
    routeSources.forEach((src) => {
      const geom = src.data.features[0]?.geometry;
      if (geom && (geom as LineString).coordinates) {
        const coords = (geom as LineString).coordinates as Position[];
        allCoords.push(...coords);
      }
    });

    // Also include endpoint markers
    endpointMarkers.forEach((marker) => {
      allCoords.push([marker.lng, marker.lat] as Position);
    });

    if (allCoords.length === 0) {
      return;
    }

    // Calculate bounds
    const lons = allCoords.map((c) => c[0]);
    const lats = allCoords.map((c) => c[1]);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    // Add padding to bounds
    const padding = {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    };

    // Fit bounds to show all routes using the actual mapbox map instance
    // Use a small timeout to ensure map is fully rendered
    const timeoutId = setTimeout(() => {
      try {
        const map = mapInstanceRef.current;
        if (map && typeof map.fitBounds === "function") {
          map.fitBounds(
            [
              [minLon, minLat],
              [maxLon, maxLat],
            ],
            {
              padding,
              duration: 1000, // Animation duration in ms
            }
          );
          hasFittedBoundsRef.current = true;
        }
      } catch (error) {
        // Ignore errors (e.g., if map is not ready)
        console.warn("Failed to fit bounds:", error);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [routeSources, routeQueries, endpointMarkers, segmentIds]);

  const interactiveIds = useMemo(
    () => routeSources.map((s) => `${s.id}-line`),
    [routeSources]
  );

  const handleMapClick = (e: MapMouseEvent) => {
    const feature = e.features && e.features[0];
    if (!feature || !feature.layer?.id) {
      onMapClick?.();
      return;
    }

    if (onSegmentClick) {
      const layerId = feature.layer.id as string;
      const i = routeSources.findIndex((s) => `${s.id}-line` === layerId);
      if (i >= 0) {
        const src = routeSources[i];
        onSegmentClick(src.segmentId, src.segmentIdx);
      } else {
        onMapClick?.();
      }
    } else {
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
              (e as unknown as {error?: Error}).error?.message ??
              "Map failed to load";
            setMapError(msg);
          }}
          pitch={0}
          bearing={0}
          dragRotate={false}
          touchPitch={false}
          touchZoomRotate={{around: "center"}}
        >
          <NavigationControl position="top-right" showCompass={false} />

          {routeSources.map((src, idx) => {
            const isHovered = hoveredSegmentIdx === idx;
            const hoverColor = isHovered ? "#ff6b35" : src.color;
            const lineWidth = isHovered ? 6 : 4;

            return (
              <Source key={src.id} id={src.id} type="geojson" data={src.data}>
                <Layer
                  id={`${src.id}-line`}
                  type="line"
                  layout={{"line-cap": "round", "line-join": "round"}}
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
              <div className="rounded-md bg-white text-slate-900 text-xs p-1 border border-slate-200 flex items-center gap-1">
                <TruckIcon className="size-4 text-slate-900" />
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
