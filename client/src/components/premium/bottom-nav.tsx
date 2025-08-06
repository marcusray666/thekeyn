import { Link, useLocation } from "wouter";
import { Home, Plus, FileText, Paintbrush, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", route: "/" },
  { icon: Plus, label: "Upload", route: "/upload" },
  { icon: FileText, label: "Certs", route: "/certificates" },
  { icon: Paintbrush, label: "Verify", route: "/verify" },
  { icon: User, label: "Profile", route: "/profile" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 z-40 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location === item.route || 
            (item.route === "/" && location === "/") ||
            location.startsWith(item.route);
          
          return (
            <Link key={item.route} href={item.route}>
              <div className={cn(
                "nav-item",
                isActive && "text-[#FE3F5E]"
              )}>
                <item.icon className={cn(
                  "h-6 w-6 transition-colors",
                  isActive ? "text-[#FE3F5E]" : "text-white/70"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? "text-[#FE3F5E]" : "text-white/70"
                )}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}