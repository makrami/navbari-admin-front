import type {CreateShipmentDto} from "../../../services/shipment/shipment.api.service";
import AddShipmentModal from "./AddShipmentModal";

type EmptyShipmentViewProps = {
  showAddShipment: boolean;
  onCloseAddShipment: () => void;
  onCreateShipment: (data: CreateShipmentDto) => void;
};

export function EmptyShipmentView({
  showAddShipment,
  onCloseAddShipment,
  onCreateShipment,
}: EmptyShipmentViewProps) {
  return (
    <div className="flex-1 h-screen bg-slate-100 max-w-4xl mx-auto overflow-hidden">
      <div className="h-full overflow-y-auto no-scrollbar">
        <div className="p-9 flex flex-col gap-4">
          <AddShipmentModal
            open={showAddShipment}
            onClose={onCloseAddShipment}
            onCreate={onCreateShipment}
          />
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>Select a shipment to view details</p>
          </div>
        </div>
      </div>
    </div>
  );
}
