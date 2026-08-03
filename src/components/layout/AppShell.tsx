import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import {
  Home,
  BookOpen,
  ScrollText,
  Hand,
  Compass,
  CalendarDays,
  Sparkles,
  User,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  Film,

} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png.asset.json";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";


const nav = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/quran", label: "Quran", Icon: BookOpen },
  { to: "/reels", label: "Reels", Icon: Film },
  { to: "/hadith", label: "Hadith", Icon: ScrollText },
  { to: "/duas", label: "Duas", Icon: Hand },
  { to: "/qibla", label: "Qibla", Icon: Compass },
  { to: "/calendar", label: "Hijri", Icon: CalendarDays },
  { to: "/assistant", label: "AI Assistant", Icon: Sparkles },
] as const;


export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("iw:theme");
    const isDark =
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("iw:theme", next ? "dark" : "light");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 glass border-b">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 mr-2">
            <img
              src={logo.url}
              alt="Islamic World logo"
              className="h-10 w-10 rounded-full shadow-gold ring-1 ring-gold/40"
              width={40}
              height={40}
            />
            <div className="hidden sm:block leading-tight">
              <div className="font-display text-lg">Islamic World</div>
              <div className="text-[10px] uppercase tracking-widest gold-text -mt-0.5">
                Nur · Ilm · Amal
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4 flex-1">
            {nav.map(({ to, label, Icon }) => {
              const active = pathname === to || (to !== "/" && pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 h-9 text-sm transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-full"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {user ? (
              <>
                {isAdmin && (
                  <Button asChild variant="outline" size="sm" className="rounded-full gap-1.5">
                    <Link to="/admin">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Link>
                  </Button>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-2 pl-2 pr-1 rounded-full hover:bg-accent"
                  aria-label="My profile"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline text-sm max-w-[140px] truncate">
                    {user.email}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => signOut()}
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="rounded-full">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Mobile tab bar */}
      <nav className="md:hidden sticky bottom-0 z-40 glass border-t">
        <div className="grid grid-cols-5 h-16">
          {nav.slice(0, 5).map(({ to, label, Icon }) => {
            const active = pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 text-[11px]",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <footer className="hidden md:block border-t py-6 mt-8">
        <div className="mx-auto max-w-7xl px-4 text-xs text-muted-foreground flex items-center justify-between">
          <span>
            © {new Date().getFullYear()} Islamic World · Content sourced from
            authentic collections.
          </span>
          <span className="gold-text font-medium">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </span>
        </div>
      </footer>
    </div>
  );
}
