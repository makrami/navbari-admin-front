import { useEffect, useState, useCallback } from "react";
import type { Shipment } from "../../shared/types/shipment";
import type { SegmentData } from "../../shared/types/segmentData";
import { listShipments, getShipment, getShipmentSegments } from "./shipment.api.service";

export function useShipments() {
  const [data, setData] = useState<Shipment[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listShipments()
      .then((res) => {
        if (!mounted) return;
        setData(res);
        setLoading(false);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e as Error);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  return { data, loading, error, refresh } as const;
}

export function useShipment(id: string | null) {
  const [data, setData] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!id) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    getShipment(id)
      .then((res) => {
        if (!mounted) return;
        setData(res ?? null);
        setLoading(false);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e as Error);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  return { data, loading, error } as const;
}

export function useShipmentSegments(shipmentId: string | null) {
  const [data, setData] = useState<SegmentData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(shipmentId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!shipmentId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    getShipmentSegments(shipmentId)
      .then((res) => {
        if (!mounted) return;
        setData(res);
        setLoading(false);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e as Error);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [shipmentId]);

  return { data, loading, error } as const;
}
