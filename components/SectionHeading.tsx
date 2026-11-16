interface Props {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  invert?: boolean;
}

export default function SectionHeading({ id, eyebrow, title, subtitle, align = "left", invert = false }: Props) {
  const center = align === "center";
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className={invert ? "eyebrow text-sage-100" : "eyebrow"}>{eyebrow}</p>
      <h2 id={id} className={`h2 ${invert ? "text-white" : ""}`}>{title}</h2>
      {subtitle && (
        <p className={`lede ${center ? "mx-auto" : ""} ${invert ? "text-sage-100" : ""}`}>{subtitle}</p>
      )}
    </div>
  );
}
