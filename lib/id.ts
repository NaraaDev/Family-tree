// Энгийн давхцалгүй ID үүсгэгч (client/server хоёуланд ажиллана).

export function createId(prefix = "p"): string {
  const rand = Math.random().toString(36).slice(2, 9);
  const time = Date.now().toString(36);
  return `${prefix}_${time}${rand}`;
}
