export function combineDateTime(date: string, time: string) {
  return date || time ? `${date}${time ? `T${time}` : ""}` : "";
}

export function splitDateTime(val: string) {
  if (!val) return { d: "", t: "" } as const;
  const [d, t] = val.split("T");
  return { d: d ?? "", t: (t ?? "").slice(0, 5) } as const;
}


