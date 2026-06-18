// Чимэглэл мод — канвасын ард зурагдах усан будгийн мод (public/backgrond.png).
// Их бие доод төвд, навч дээш дэлгэгдэнэ. Картууд уншигдахаар зөөлөн тунгалаг.

interface Props {
  readonly width: number;
  readonly height: number;
}

export function TreeBackdrop({ width, height }: Props) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0"
      style={{
        width,
        height,
        backgroundImage: "url('/backgrond.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center bottom",
        backgroundSize: "contain",
        opacity: 0.6,
      }}
    />
  );
}
