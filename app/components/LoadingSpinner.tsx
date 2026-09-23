type LoadingSpinnerProps = {
  label?: string
  className?: string
}

const LoadingSpinner = ({
  label = "Loading",
  className = "",
}: LoadingSpinnerProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-10 ${className}`}
    >
      {/* Spinner */}
      <div className="relative h-14 w-14">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />

        {/* Rotating Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#D89267] animate-spin" />

        {/* Inner Pulse */}
        <div className="absolute inset-2 rounded-full border border-[#D89267]/40 animate-pulse" />
      </div>

      {/* Animated Dots */}
      <div className="flex items-center gap-1 text-sm tracking-wide text-[#D89267]">
        <span className="animate-pulse">{label}</span>

        <span
          className="animate-bounce"
          style={{ animationDelay: "0ms" }}
        >
          .
        </span>

        <span
          className="animate-bounce"
          style={{ animationDelay: "150ms" }}
        >
          .
        </span>

        <span
          className="animate-bounce"
          style={{ animationDelay: "300ms" }}
        >
          .
        </span>
      </div>
    </div>
  )
}

export default LoadingSpinner