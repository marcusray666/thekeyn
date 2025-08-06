import { Link, useLocation } from "wouter";
import { Home, Plus, FileText, User } from "lucide-react";
import { LogoIcon } from "@/components/ui/logo-icon";
import { cn } from "@/lib/utils";
import { useScrollNavigation } from "@/hooks/use-scroll-navigation";

const navItems = [
  { icon: Home, label: "Home", route: "/" },
  { icon: Plus, label: "Upload", route: "/upload" },
  { icon: FileText, label: "Certs", route: "/certificates" },
  { icon: () => <LogoIcon size="sm" />, label: "Verify", route: "/verify" },
  { icon: User, label: "Profile", route: "/profile" },
];

export function BottomNav() {
  const [location] = useLocation();
  const { isVisible } = useScrollNavigation();

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 md:hidden transition-transform duration-300 ease-in-out",
      isVisible ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="flex justify-around items-center py-3 px-2">
        {navItems.map((item) => {
          const isActive = location === item.route || 
            (item.route === "/" && location === "/") ||
            location.startsWith(item.route);
          
          return (
            <Link key={item.route} href={item.route}>
              <div className={cn(
                "mobile-nav-item",
                isActive ? "text-[#FE3F5E]" : "text-white/70"
              )}>
                <item.icon className={cn(
                  "mobile-nav-icon",
                  isActive ? "text-[#FE3F5E]" : "text-white/70"
                )} />
                <span className={cn(
                  "mobile-nav-label",
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