// Minimal fallback to silence editor complaints if react-map-gl types are unresolved.
// If your IDE still errors, ensure node_modules is indexed and TS server restarted.
declare module "react-map-gl" {
  import type { ReactNode } from "react";
  export type MapLayerMouseEvent = any;
  export default function Map(props: any): ReactNode;
  export const Source: (props: any) => ReactNode;
  export const Layer: (props: any) => ReactNode;
  export const Marker: (props: any) => ReactNode;
  export const NavigationControl: (props: any) => ReactNode;
}


