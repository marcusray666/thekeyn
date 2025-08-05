import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn(
      "min-h-screen",
      "bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]",
      "ml-0 md:ml-64 transition-all duration-300",
      className
    )}>
      <div className="p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}