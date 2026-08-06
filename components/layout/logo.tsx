import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
  markOnly?: boolean;
};

/** Cores do padrão da marca UNICENTROMA */
const GREEN = "#A3B95F";
const BLUE = "#1C81C4";

export function Logo({
  className,
  showWordmark = true,
  markOnly = false,
}: LogoProps) {
  if (markOnly || !showWordmark) {
    return (
      <span className={cn("inline-flex shrink-0 items-center", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/image/logo_sen_mark.png"
          alt="UNICENTROMA"
          className="h-10 w-10 object-contain"
          draggable={false}
        />
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex min-w-0 items-center gap-2.5", className)}
      aria-label="UNICENTROMA"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/image/logo_sen_mark.png"
        alt=""
        className="h-11 w-11 shrink-0 object-contain"
        draggable={false}
      />
      <span className="flex min-w-0 flex-col pt-2.5 leading-none">
        <span className="text-[21px] font-extrabold tracking-tight uppercase">
          <span style={{ color: GREEN }}>UNI</span>
          <span style={{ color: BLUE }}>CENTRO</span>
          <span style={{ color: GREEN }}>MA</span>
        </span>
        <span className="mt-1 whitespace-nowrap text-[5px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Compromisso com o presente, transformando o futuro
        </span>
      </span>
    </span>
  );
}
