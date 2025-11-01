import { useState, useEffect } from "react";
import { ShipmentPageSkeleton } from "./components/ShipmentSkeleton";
import { ShipmentContainer } from "./components/ShipmentContainer";
import { useShipments } from "../../services/shipment/hooks";

export function ShipmentPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { loading: serviceLoading } = useShipments();

  useEffect(() => {
    // Simulate loading for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || serviceLoading) {
    return <ShipmentPageSkeleton />;
  }

  return <ShipmentContainer />;
}
