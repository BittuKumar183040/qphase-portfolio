export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-black/10 bg-white px-6 py-10 text-black dark:border-white/10 dark:bg-black dark:text-white sm:px-5 md:px-10 lg:px-20">
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        {/* Brand + parent-project credit */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium tracking-tight">QPhase</span>
          <span className="h-px w-6 bg-black/20 dark:bg-white/20" />
          <span className="text-xs text-black/50 dark:text-white/50">
            A{" "}
            <a
              href="https://rexcrux.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-black/20 underline-offset-2 transition-colors hover:text-black hover:decoration-black/50 dark:decoration-white/20 dark:hover:text-white dark:hover:decoration-white/50"
            >
              Rexcrux
            </a>{" "}
            project
          </span>
        </div>


        {/* Copyright */}
        <span className="text-xs text-black/40 dark:text-white/40">
          © {year} QPhase. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
