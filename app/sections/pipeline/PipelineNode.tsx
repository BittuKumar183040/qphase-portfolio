import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import type { ReactNode } from "react";

export type PipelineNodeData = {
  number: string;
  label: string;
  description: string;
  accent?: boolean;
  /** Extra content shown in the dialog when the node is clicked. */
  details?: ReactNode;
  /** Optional longer text for the dialog (falls back to `description`). */
  longDescription?: string;
  /** Injected by PipelineGraph so the node can be opened with the keyboard. */
  onOpen?: () => void;
};

export type PipelineNode = Node<PipelineNodeData>;

export function PipelineNode({ data }: NodeProps<PipelineNode>) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`Open details for ${data.label}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          data.onOpen?.();
        }
      }}
      className={[
        "relative w-full cursor-pointer rounded-xl border px-4 py-3.5",
        "bg-white text-black dark:bg-black dark:text-white",
        "transition-colors duration-300",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#733d22]",
        data.accent
          ? "border-2 border-[#733d22]/50 hover:border-[#733d22]"
          : "border border-black/15 hover:border-black/30 dark:border-white/15 dark:hover:border-white/30",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-1.5 !w-1.5 !border-0 !bg-black/25 dark:!bg-white/25"
      />

      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[8px] font-medium",
            data.accent
              ? "border-[#733d22]/50 text-[#733d22]"
              : "border-black/15 text-black/45 dark:border-white/15 dark:text-white/45",
          ].join(" ")}
        >
          {data.number}
        </div>

        <div className="min-w-0">
          <p
            className={`truncate tracking-tight sm:text-sm ${
              data.accent ? "text-md font-bold text-[#733d22]" : "text-xs font-medium"
            }`}
          >
            {data.label}
          </p>

          <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-black/50 dark:text-white/50 sm:text-[10px]">
            {data.description}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-1.5 !w-1.5 !border-0 !bg-black/25 dark:!bg-white/25"
      />
    </div>
  );
}
