import { useEffect, useMemo, useState } from "react";
import type { Shipment } from "../../shared/types/shipment";
import { ShipmentService } from "./ShipmentService";

export function useShipments() {
  const service = useMemo(() => new ShipmentService(), []);
  const [data, setData] = useState<Shipment[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    service
      .list()
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
  }, [service]);

  return { data, loading, error, service } as const;
}

export function useShipment(id: string | null) {
  const service = useMemo(() => new ShipmentService(), []);
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
    service
      .get(id)
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
  }, [id, service]);

  return { data, loading, error, service } as const;
}
