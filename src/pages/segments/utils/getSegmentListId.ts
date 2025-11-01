export function getSegmentListId(shipmentId: string, step: number) {
  return `${shipmentId}-${step}`;
}

