import { SearchShipment, AddShipment, ShipmentItem } from "../../../components";
import AddShipmentModal, {
  type AddShipmentInput as AddShipmentFormInput,
} from "./AddShipmentModal";
import type { ShipmentData } from "../types/shipmentTypes";

type ShipmentListViewProps = {
  shipments: ShipmentData[];
  onShipmentSelect: (id: string) => void;
  onAddShipment: () => void;
  showAddShipment: boolean;
  onCloseAddShipment: () => void;
  onCreateShipment: (shipment: ShipmentData) => void;
};

export function ShipmentListView({
  shipments,
  onShipmentSelect,
  onAddShipment,
  showAddShipment,
  onCloseAddShipment,
  onCreateShipment,
}: ShipmentListViewProps) {
  return (
    <div className="flex w-full h-screen bg-slate-100 overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto p-9">
        <AddShipmentModal
          open={showAddShipment}
          onClose={onCloseAddShipment}
          onCreate={(data: AddShipmentFormInput) => {
            const newShipment: ShipmentData = {
              title: data.title,
              id: data.id,
              status: "In Origin",
              fromCountryCode: "CN",
              toCountryCode: "RU",
              progressPercent: 0,
              userName: data.driverName,
              rating: data.driverRating || 0,
              vehicle: "Unknown",
              weight: "0 KG",
              localCompany: "N/A",
              destination: data.destination || "",
              lastActivity: "Created",
              lastActivityTime: "Just now",
              currentSegmentIndex: 0,
              isNew: true,
              segments: [
                {
                  step: 1,
                  place: data.place,
                  datetime: data.datetime,
                  isCompleted: false,
                  driverName: data.driverName,
                  driverPhoto: data.driverPhoto,
                  driverRating: data.driverRating || 0,
                },
              ],
              activities: [],
            };
            onCreateShipment(newShipment);
          }}
        />
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1">
            <SearchShipment />
          </div>
          <AddShipment onClick={onAddShipment} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shipments.map((item) => (
            <ShipmentItem
              key={item.id}
              title={item.title}
              id={item.id}
              status={item.status}
              fromCountryCode={item.fromCountryCode}
              toCountryCode={item.toCountryCode}
              progressPercent={item.progressPercent}
              userName={item.userName}
              rating={item.rating}
              segments={item.segments}
              selected={false}
              onClick={() => onShipmentSelect(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
