import { pipelineSteps } from "@/app/config/content";

interface PipelineDiagramProps {
  highlight?: string;
}

function StepChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={
        active
          ? "rounded-sm border border-[#8C4A2A] bg-[#8C4A2A] px-3 py-1.5 text-[#F6F3EE]"
          : "rounded-sm border border-[#D8D2C4] px-3 py-1.5 text-[#3A362E]"
      }
    >
      {label}
    </span>
  );
}

export default function PipelineDiagram({
  highlight = "Invariant Broker"
}: PipelineDiagramProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 tracking-wide">
      {pipelineSteps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <StepChip label={step} active={step === highlight} />
          {i < pipelineSteps.length - 1 && <span className="text-[#B9B2A0]">→</span>}
        </div>
      ))}
    </div>
  );
}
