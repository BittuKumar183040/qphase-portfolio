import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { PipelineNode } from "../../config/QphasePipeline";
import { Box } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PipelineStepCardProps = {
  /** Counter shown on the left. Omit for a plain dot. */
  index?: string | number;
  label: string;
  /** Subtitle under the label. */
  description?: string;
  /** Logo image URL for the right side. Omit for the default glyph. */
  logo?: string | LucideIcon;
  /** Brand-highlighted variant. */
  accent?: boolean;
  /** Hide the logo when the card is too narrow. */
  compact?: boolean;
  /** Auto-height card with a 2-line description (main graph). Default is a fixed-height, 1-line card (dialog diagrams). */
  multiline?: boolean;
  /** Makes the card a keyboard-accessible button that opens the dialog. */
  onOpen?: () => void;
};

/** Left: counter. Middle: title + description. Right: logo. */
export function PipelineStepCard({
  index,
  label,
  description,
  logo,
  accent,
  compact,
  multiline,
  onOpen,
}: PipelineStepCardProps) {
  const interactive = onOpen
    ? {
        role: "button",
        tabIndex: 0,
        "aria-haspopup": "dialog" as const,
        "aria-label": `Open details for ${label}`,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        },
      }
    : {};

  return (
    <div
      {...interactive}
      className={[
        "flex h-full w-full gap-2.5 rounded-xl border px-3",
        multiline ? "items-start px-4 py-3.5" : "items-center",
        "bg-white text-black dark:bg-black dark:text-white",
        onOpen
          ? "cursor-pointer transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#733d22]"
          : "",
        accent
          ? `border-2 border-[#733d22]/50 ${onOpen ? "hover:border-[#733d22]" : ""}`
          : `border-black/15 dark:border-white/15 ${
              onOpen ? "hover:border-black/30 dark:hover:border-white/30" : ""
            }`,
      ].join(" ")}
    >
      <span
        className={[
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-medium",
          String(index ?? "").length > 1 ? "text-[8px]" : "text-[10px]",
          accent
            ? "border-[#733d22]/50 text-[#733d22]"
            : "border-black/15 text-black/45 dark:border-white/15 dark:text-white/45",
        ].join(" ")}
      >
        {index ?? <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "tracking-tight",
            multiline
              ? "truncate text-xs sm:text-sm"
              : "line-clamp-2 text-[11px] leading-tight sm:text-xs",
            accent ? "font-bold text-[#733d22]" : "font-medium",
          ].join(" ")}
        >
          {label}
        </p>
        {description && (
          <p
            className={[
              "text-[9px] text-black/50 sm:text-[10px] dark:text-white/50",
              multiline ? "mt-1 line-clamp-2 leading-relaxed" : "truncate",
            ].join(" ")}
          >
            {description}
          </p>
        )}
      </div>

      {!compact && (
        <span
          className={[
            "flex size-7 shrink-0 items-center justify-center rounded-lg border overflow-hidden",
            accent
              ? "border-[#733d22]/30 bg-[#733d22]/10 text-[#733d22]"
              : "border-black/10 bg-black/3 text-black/40 dark:border-white/10 dark:bg-white/6 dark:text-white/40",
          ].join(" ")}
        >
          {typeof logo === "string" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="size-7 object-cover dark:grayscale grayscale-0" />
          ) : logo ? (
            (() => {
              const Logo = logo;
              return <Logo size={15} />;
            })()
          ) : (
            <Box size={15} />
          )}
        </span>
      )}
    </div>
  );
}

/** React Flow node for the main pipeline graph (`nodeTypes.pipeline`). */
export function PipelineFlowNode({ data }: NodeProps<PipelineNode>) {
  return (
    <div className="relative w-full">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-1.5 !w-1.5 !border-0 !bg-black/25 dark:!bg-white/25"
      />

      <PipelineStepCard
        multiline
        index={data.number}
        label={data.label}
        description={data.description}
        logo={data.logo}
        accent={data.accent}
        onOpen={data.onOpen}
      />

      <Handle
        type="source"
        position={Position.Right}
        className="!h-1.5 !w-1.5 !border-0 !bg-black/25 dark:!bg-white/25"
      />
    </div>
  );
}
