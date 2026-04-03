import Link from "next/link";

interface Props {
  href?: string;
  onClick?: () => void;
}

const chevron = (
  <svg width="10" height="17" viewBox="0 0 10 17" fill="none" aria-hidden="true">
    <path
      d="M9 1L1 8.5L9 16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const cls =
  "flex items-center justify-center w-11 h-11 rounded-full flex-shrink-0";
const style = { background: "var(--border)" };

export default function BackButton({ href, onClick }: Props) {
  if (href) {
    return (
      <Link href={href} className={cls} style={style} aria-label="Back">
        {chevron}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls} style={style} aria-label="Back">
      {chevron}
    </button>
  );
}
