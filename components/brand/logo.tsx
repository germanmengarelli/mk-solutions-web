import Image from "next/image";

export function BrandLogo({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: 40,
    md: 56,
    lg: 88,
  };

  return (
    <div className="flex items-center gap-3">
      <div
  className="relative flex items-center justify-center overflow-visible"
  style={{ width: sizes[size], height: sizes[size] }}
>

        <Image
          src="/logo-mk.png"
          alt="MK Solutions"
          fill
          className="object-contain scale-150 drop-shadow-[0_0_25px_rgba(56,189,248,0.45)]"
          priority
        />
      </div>
      <span className="sr-only">MK Solutions</span>
    </div>
  );
}
