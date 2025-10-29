import driver1 from "../../../assets/images/drivers/driver1.png";
import driver2 from "../../../assets/images/drivers/driver2.png";
import driver3 from "../../../assets/images/drivers/driver3.png";
import driver4 from "../../../assets/images/drivers/driver4.png";

export type Driver = {
  id: string;
  name: string;
  avatarUrl: string;
};

export const DRIVER_LIST: Driver[] = [
  { id: "drv_xin_zhao", name: "Xin Zhao", avatarUrl: driver1 },
  { id: "drv_li_chen", name: "Li Chen", avatarUrl: driver2 },
  { id: "drv_wang_ming", name: "Wang Ming", avatarUrl: driver3 },
  { id: "drv_amina_li", name: "Amina Li", avatarUrl: driver4 },
];

export const DRIVER_BY_ID: Record<string, Driver> = Object.fromEntries(
  DRIVER_LIST.map((d) => [d.id, d])
);


