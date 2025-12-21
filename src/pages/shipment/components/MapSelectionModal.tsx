import {useState, useCallback, useRef, useEffect} from "react";
import {XIcon, MapPin} from "lucide-react";
import Map, {
  NavigationControl,
  type MapMouseEvent,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type {Map as MapboxMap, MapboxEvent} from "mapbox-gl";
import {useTranslation} from "react-i18next";

const GREEN_MAP_STYLE = "mapbox://styles/mapbox/navigation-day-v1";

type MapSelectionModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (
    latitude: number,
    longitude: number,
    city?: string,
    country?: string
  ) => void;
  initialLatitude?: number;
  initialLongitude?: number;
};

export function MapSelectionModal({
  open,
  onClose,
  onSelect,
  initialLatitude,
  initialLongitude,
}: MapSelectionModalProps) {
  const {t} = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const mapRef = useRef<MapRef | null>(null);
  const mapInstanceRef = useRef<MapboxMap | null>(null);

  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  // Initialize selected location when modal opens with initial coordinates
  useEffect(() => {
    if (open && initialLatitude && initialLongitude) {
      setSelectedLocation({
        latitude: initialLatitude,
        longitude: initialLongitude,
      });
    } else if (open) {
      setSelectedLocation(null);
    }
  }, [open, initialLatitude, initialLongitude]);

  // Reverse geocode function using Mapbox Geocoding API
  const reverseGeocode = useCallback(
    async (
      latitude: number,
      longitude: number
    ): Promise<{
      city?: string;
      country?: string;
    }> => {
      if (!token) return {};

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&types=place,locality,neighborhood`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const context = feature.context || [];

          // Extract city
          const cityFeature =
            context.find(
              (ctx: any) =>
                ctx.id?.startsWith("place.") || ctx.id?.startsWith("locality.")
            ) || feature;
          const city = cityFeature.text || feature.text || "";

          // Extract country
          const countryFeature = context.find((ctx: any) =>
            ctx.id?.startsWith("country.")
          );
          const country = countryFeature?.text || "";

          return {city, country};
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
      }

      return {};
    },
    [token]
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
      try {
        const layer = map.getLayer(layerId);
        if (layer) {
          map.setPaintProperty(layerId, property, value);
        }
      } catch (error) {
        // Layer doesn't exist or doesn't support this paint property, skip silently
        // This is expected for some layers that may not exist in all map styles
        // or don't support the specific paint property being set
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

  const handleMapClick = useCallback((e: MapMouseEvent) => {
    if (e.lngLat) {
      setSelectedLocation({
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng,
      });
    }
  }, []);

  // Handle map move end to update selected location to center
  const handleMapMoveEnd = useCallback((e: ViewStateChangeEvent) => {
    if (e.viewState) {
      // Update selected location to center when map stops moving
      setSelectedLocation({
        latitude: e.viewState.latitude,
        longitude: e.viewState.longitude,
      });
    }
  }, []);

  const handleSelect = async () => {
    if (selectedLocation) {
      setIsReverseGeocoding(true);
      try {
        const {city, country} = await reverseGeocode(
          selectedLocation.latitude,
          selectedLocation.longitude
        );
        onSelect(
          selectedLocation.latitude,
          selectedLocation.longitude,
          city,
          country
        );
        onClose();
      } catch (error) {
        console.error("Error during reverse geocoding:", error);
        // Still select even if reverse geocoding fails
        onSelect(selectedLocation.latitude, selectedLocation.longitude);
        onClose();
      } finally {
        setIsReverseGeocoding(false);
      }
    }
  };

  const handleBack = () => {
    setSelectedLocation(null);
    onClose();
  };

  if (!open) return null;

  const initialViewState = selectedLocation
    ? {
        longitude: selectedLocation.longitude,
        latitude: selectedLocation.latitude,
        zoom: 10,
      }
    : initialLongitude && initialLatitude
    ? {
        longitude: initialLongitude,
        latitude: initialLatitude,
        zoom: 10,
      }
    : {
        longitude: 105.0,
        latitude: 35.0,
        zoom: 4,
      };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={handleBack} />
      <div className="relative w-full max-w-4xl h-[80vh] rounded-2xl bg-white shadow-xl border border-slate-200 flex flex-col">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100"
            aria-label={t("shipment.addModal.close")}
            onClick={handleBack}
          >
            <XIcon className="size-5 text-slate-500" />
          </button>
          <h3 className="text-slate-900 font-semibold">
            {t("shipment.addModal.selectFromMap")}
          </h3>
        </div>

        <div className="flex-1 relative overflow-hidden">
          {!token ? (
            <div className="flex h-full w-full items-center justify-center p-6 text-center">
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Mapbox token missing
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Add <span className="font-semibold">VITE_MAPBOX_TOKEN</span>{" "}
                  to your <span className="font-mono">.env</span>, then restart
                  the dev server.
                </div>
              </div>
            </div>
          ) : (
            <>
              <Map
                ref={mapRef}
                mapboxAccessToken={token}
                initialViewState={initialViewState}
                mapStyle={GREEN_MAP_STYLE}
                onClick={handleMapClick}
                onMoveEnd={handleMapMoveEnd}
                onLoad={handleMapLoad}
                onError={(e) => {
                  console.error("Map error:", e);
                }}
                pitch={0}
                bearing={0}
                dragRotate={false}
                touchPitch={false}
                touchZoomRotate={{around: "center"}}
              >
                <NavigationControl position="top-right" showCompass={false} />
              </Map>

              {/* Center pin that stays in the middle of the map */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="relative">
                  <MapPin className="size-8 text-red-500 drop-shadow-lg" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200">
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={handleBack}
          >
            {t("shipment.addModal.back")}
          </button>
          <button
            type="button"
            className={`rounded-xl px-4 py-2 text-sm text-white ${
              selectedLocation && !isReverseGeocoding
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-slate-400 cursor-not-allowed"
            }`}
            onClick={handleSelect}
            disabled={!selectedLocation || isReverseGeocoding}
          >
            {isReverseGeocoding
              ? t("shipment.addModal.loadingLocation")
              : t("shipment.addModal.select")}
          </button>
        </div>
      </div>
    </div>
  );
}
