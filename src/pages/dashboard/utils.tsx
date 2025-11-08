
export function seededCount(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 5) + 1; // 1..5
}

export function renderNumbersBold(
  text: string,
  keyPrefix: string,
  numberClass = "font-bold",
  textClass = "font-medium"
) {
  const parts = text
    // Capture numeric token with an optional short suffix (h, m, k, %, etc.)
    .split(/(\d+(?:[.,]\d+)?[a-zA-Z%]?)/g)
    .filter(Boolean);
  return (
    <>
      {parts.map((part, idx) => {
        const isNumber = /^\d+(?:[.,]\d+)?[a-zA-Z%]?$/.test(part);
        return (
          <span
            key={`${keyPrefix}-${idx}`}
            className={isNumber ? numberClass : textClass}
          >
            {part}
          </span>
        );
      })}
    </>
  );
}

