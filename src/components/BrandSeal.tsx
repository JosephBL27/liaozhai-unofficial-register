import { useId } from "react";

type BrandSealProps = {
  className?: string;
  title?: string;
};

export function BrandSeal({ className, title = "Liaozhai seal" }: BrandSealProps) {
  const titleId = useId();

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>{title}</title>
      <path className="seal-fill" d="M7 6h48l2 4-2 47H9L6 53 7 6Z" />
      <path className="seal-cut" d="M16 14h14v7h-7v7h7v7H16V14Zm19 0h13v21H35v-7h6v-7h-6v-7ZM16 40h32v8H16z" />
    </svg>
  );
}
