import {useState, useEffect} from "react";
import {Navigate} from "react-router-dom";
import {ShipmentPageSkeleton} from "./components/ShipmentSkeleton";
import {ShipmentContainer} from "./components/ShipmentContainer";
import {useShipments} from "../../services/shipment/hooks";
import {useCurrentUser} from "../../services/user/hooks";

export function ShipmentPage() {
  const [isLoading, setIsLoading] = useState(true);
  const {loading: serviceLoading} = useShipments();
  const {data: user} = useCurrentUser();

  // Get permissions array from user data
  const userRecord = user as Record<string, unknown> | undefined;
  const permissions = (userRecord?.permissions as string[] | undefined) || [];
  const hasShipmentsRead = permissions.includes("shipments:read");
  const hasSegmentsRead = permissions.includes("segments:read");

  // Redirect to segments page if user doesn't have shipments:read but has segments:read
  useEffect(() => {
    if (!hasShipmentsRead && hasSegmentsRead) {
      setIsLoading(false);
    }
  }, [hasShipmentsRead, hasSegmentsRead]);

  useEffect(() => {
    // Simulate loading for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Redirect if user doesn't have shipments:read but has segments:read
  if (!hasShipmentsRead && hasSegmentsRead) {
    return <Navigate to="/segments" replace />;
  }

  if (isLoading || serviceLoading) {
    return <ShipmentPageSkeleton />;
  }

  return <ShipmentContainer />;
}
