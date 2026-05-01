"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Calendar,
  UsersRound,
  Wallet,
  User,
  LogOut,
  LogIn,
  UserPlus,
  UserRound,
  Ticket,
  LayoutDashboard,
  Home,
  Instagram,
  Image as ImageIcon,
  CalendarCog,
  Settings2,
  ScanLine,
  ShieldUser,
  CreditCard,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useClubStore } from "@/stores/clubStore";
import LogoAnimated from "@/components/logo/LogoAnimated";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthDropdownButton } from "./authbutton/AuthDropdownButton";
import UserAvatar from "@/components/search/MatchResult/UserAvatar";

const SITE_URL = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
const TICKETING_URL =
  process.env.NEXT_PUBLIC_TICKETING_URL ?? "http://localhost:3001";
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3002";

type NavChild = { label: string; icon: React.ElementType; path: string };
type NavSite = {
  label?: string;
  baseUrl: string;
  current: boolean;
  children: NavChild[];
  separator?: boolean;
};

const homeSite: NavSite = {
  baseUrl: SITE_URL,
  current: true,
  children: [
    { label: "Home", icon: Home, path: "/" },
    { label: "Events", icon: Calendar, path: "/events" },
    { label: "Clubs", icon: UsersRound, path: "/clubs" },
    { label: "Pass", icon: Wallet, path: "/pass" },
  ],
};

const ticketingOrgSite: NavSite = {
  label: "TICKETING",
  baseUrl: TICKETING_URL,
  current: false,
  children: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Instagram", icon: Instagram, path: "/dashboard/instagram" },
    { label: "Media", icon: ImageIcon, path: "/dashboard/media" },
    { label: "Events", icon: Calendar, path: "/dashboard/events" },
  ],
};

const ticketingUserSite: NavSite = {
  label: "TICKETING",
  baseUrl: TICKETING_URL,
  current: false,
  children: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Tickets", icon: Ticket, path: "/dashboard/tickets" },
  ],
};

const ticketingClubSite: NavSite = {
  label: "",
  baseUrl: TICKETING_URL,
  current: false,
  separator: true,
  children: [
    { label: "Instagram", icon: Instagram, path: "/dashboard/instagram" },
    { label: "Media", icon: ImageIcon, path: "/dashboard/media" },
    { label: "Edit Events", icon: CalendarCog, path: "/dashboard/events" },
  ],
};

const adminSite: NavSite = {
  label: "ADMIN",
  baseUrl: ADMIN_URL,
  current: false,
  children: [
    { label: "Manage", icon: Settings2, path: "/dashboard" },
    { label: "Events", icon: ScanLine, path: "/dashboard/events" },
    { label: "Members", icon: UsersRound, path: "/dashboard/members" },
    { label: "Committee", icon: ShieldUser, path: "/dashboard/committee" },
    { label: "Payment", icon: CreditCard, path: "/dashboard/payment" },
  ],
};

function isChildActive(pathname: string, path: string) {
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

interface NavItemProps {
  label: string;
  icon: React.ElementType;
  href: string;
  isActive: boolean;
  isExpanded: boolean;
  external?: boolean;
}

function NavItem({
  label,
  icon: Icon,
  href,
  isActive,
  isExpanded,
  external,
}: NavItemProps) {
  const Component = external ? "a" : Link;
  const props = { href };

  return (
    <Component
      {...props}
      className={cn(
        "relative flex items-center py-2 px-3 rounded-lg cursor-pointer select-none transition-colors duration-200 w-full",
        isActive
          ? "bg-[#F9ECFF] text-[#854ECB]"
          : "text-muted-foreground hover:bg-black/5 hover:text-black",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span
        className={cn(
          "ml-2 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200",
          isExpanded ? "max-w-[140px] opacity-100" : "max-w-0 opacity-0",
        )}
      >
        {label}
      </span>
    </Component>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuthStore();
  const { clubs, clubsLoading } = useClubStore();

  const [isDesktop, setIsDesktop] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [headerHovering, setHeaderHovering] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const checkScroll = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    requestAnimationFrame(() => setHasMounted(true));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !isDesktop &&
        mobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(target) &&
        !target.closest("[data-menu-button]")
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen, isDesktop]);

  useEffect(() => {
    if (!isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const isExpanded = isDesktop ? isHovered || dropdownOpen : mobileOpen;

  const isOrg = profile?.account_type === "organisation";
  const isClubAdmin = !isOrg && clubs.length > 0;
  const sites: NavSite[] = isOrg
    ? [homeSite, ticketingOrgSite, adminSite]
    : isClubAdmin
      ? [homeSite, ticketingUserSite, ticketingClubSite, adminSite]
      : [homeSite, ticketingUserSite, ticketingClubSite];

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  return (
    <>
      {/* Mobile sticky navbar */}
      <nav
        data-menu-button
        className={`${!isDesktop ? "sticky" : "hidden"} top-0 z-40 w-full md:hidden flex items-center justify-between px-4 py-3 safe-area-inset-top shrink-0 bg-white border-b border-neutral-200`}
      >
        <Link href="/" className="flex items-center p-1">
          <LogoAnimated width={20} height={20} onHover={true} />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          data-menu-button
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 transition-all hover:scale-105"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <div
            className={cn(
              "transition-all duration-200",
              mobileOpen ? "rotate-90" : "rotate-0",
            )}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </div>
        </button>
      </nav>

      {/* Sidebar container */}
      <div
        ref={sidebarRef}
        className={`fixed left-0 top-0 z-40 ${!isDesktop && !mobileOpen ? "pointer-events-none" : ""}`}
      >
        {/* Main sidebar */}
        <aside
          className={cn(
            "flex flex-col h-[100dvh] px-3 backdrop-blur-xl pt-4 pb-4 border-r bg-white z-50 transition-all",
            hasMounted
              ? isDesktop
                ? "duration-200"
                : "duration-300 ease-in-out"
              : "duration-0",
            isDesktop
              ? cn("translate-x-0", isExpanded ? "w-[200px]" : "w-[68px]")
              : cn(
                  mobileOpen
                    ? "translate-x-0 w-[200px]"
                    : "-translate-x-full w-fit",
                ),
          )}
          onMouseEnter={() => isDesktop && setIsHovered(true)}
          onMouseLeave={() => isDesktop && !dropdownOpen && setIsHovered(false)}
        >
          {/* Logo header */}
          <div className="-mx-3 px-3 pb-3 border-b border-gray-100 shrink-0">
            <Link
              href="/"
              className="flex items-center p-1.5 pl-3 rounded-lg hover:scale-105 transition-all duration-200 text-muted-foreground hover:text-black hover:bg-black/5 w-full"
              onMouseEnter={() => setHeaderHovering(true)}
              onMouseLeave={() => setHeaderHovering(false)}
            >
              <LogoAnimated
                width={20}
                height={20}
                onHover={true}
                hovering={headerHovering}
                className="shrink-0"
              />
              <span
                className={cn(
                  "ml-2 text-base font-semibold font-fredoka whitespace-nowrap overflow-hidden transition-all duration-200",
                  isExpanded
                    ? "max-w-[140px] opacity-100"
                    : "max-w-0 opacity-0",
                )}
              >
                Connect3
              </span>
            </Link>
          </div>

          {/* Scrollable middle nav */}
          <div className="relative flex-1 min-h-0">
            <nav
              ref={navRef}
              className="h-full overflow-y-auto overflow-x-hidden -mx-1 py-2 px-1 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex flex-col gap-1 w-full">
                {sites.map((site, idx) => {
                  if (
                    site.separator &&
                    !isOrg &&
                    !isClubAdmin &&
                    !clubsLoading
                  ) {
                    return null;
                  }
                  return (
                    <div
                      key={`${site.label}-${idx}`}
                      className="flex flex-col gap-1 w-full"
                    >
                      {site.separator ? (
                        <span className="w-full border-t border-gray-200 my-2" />
                      ) : site.label ? (
                        <div className="px-3 flex items-end h-7 pt-2">
                          <span
                            className={cn(
                              "text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground whitespace-nowrap transition-opacity duration-200",
                              isExpanded ? "opacity-100" : "opacity-0",
                            )}
                          >
                            {site.label}
                          </span>
                        </div>
                      ) : null}

                      {site.children.map((c) => {
                        const href = site.current
                          ? c.path
                          : `${site.baseUrl}${c.path}`;
                        const active =
                          site.current && isChildActive(pathname, c.path);
                        return (
                          <NavItem
                            key={`${site.label}-${c.path}`}
                            label={c.label}
                            icon={c.icon}
                            href={href}
                            isActive={active}
                            isExpanded={isExpanded}
                            external={!site.current}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </nav>
            {canScrollDown && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent" />
            )}
          </div>

          {/* Bottom section */}
          <div className="-mx-3 px-3 pt-3 border-t border-gray-100 shrink-0">
            <div className="flex flex-col items-center gap-1">
              {loading ? (
                <div
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg w-full",
                    !isExpanded && "justify-center",
                  )}
                >
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div
                    className={cn(
                      "min-w-0 overflow-hidden transition-all duration-200 flex flex-col gap-1",
                      isExpanded
                        ? "max-w-[120px] opacity-100"
                        : "max-w-0 opacity-0",
                    )}
                  >
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-2.5 w-20 rounded" />
                  </div>
                </div>
              ) : user && profile ? (
                <DropdownMenu
                  open={dropdownOpen}
                  onOpenChange={(open) => {
                    setDropdownOpen(open);
                    if (!open) setIsHovered(false);
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 transition-colors duration-200 w-full cursor-pointer select-none",
                        !isExpanded && "justify-center",
                      )}
                    >
                      <UserAvatar
                        avatarUrl={profile?.avatar_url}
                        fullName={profile?.first_name || "User"}
                        userId={profile?.id || ""}
                        size="sm"
                        isOrganisation={
                          profile?.account_type === "organisation"
                        }
                      />
                      <div
                        className={cn(
                          "min-w-0 overflow-hidden transition-all duration-200",
                          isExpanded
                            ? "max-w-[120px] opacity-100"
                            : "max-w-0 opacity-0",
                        )}
                      >
                        <p className="text-sm font-medium truncate whitespace-nowrap text-black w-full text-start">
                          {profile?.first_name ??
                            user?.email?.split("@")[0] ??
                            "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate whitespace-nowrap">
                          {user?.email}
                        </p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    side="right"
                    className="z-[110] w-44 rounded-xl border border-gray-200 bg-white p-1"
                  >
                    <AuthDropdownButton
                      onClick={handleProfile}
                      text="Profile"
                      icon={<User className="w-4 h-4" />}
                    />
                    <AuthDropdownButton
                      onClick={handleLogout}
                      text="Log Out"
                      icon={<LogOut className="w-4 h-4" />}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu
                  open={dropdownOpen}
                  onOpenChange={(open) => {
                    setDropdownOpen(open);
                    if (!open) setIsHovered(false);
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 transition-colors duration-200 w-full cursor-pointer select-none text-muted-foreground hover:text-black",
                        !isExpanded && "justify-center",
                      )}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border border-muted/50 shrink-0">
                        <UserRound className="w-4 h-4" />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200",
                          isExpanded
                            ? "max-w-[140px] opacity-100"
                            : "max-w-0 opacity-0",
                        )}
                      >
                        Login
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="right"
                    className="z-[110] w-44 rounded-xl border border-gray-200 bg-white p-1"
                  >
                    <AuthDropdownButton
                      onClick={() => router.push("/auth/login")}
                      text="Log In"
                      icon={<LogIn className="w-4 h-4" />}
                    />
                    <AuthDropdownButton
                      onClick={() => router.push("/auth/sign-up")}
                      text="Sign Up"
                      icon={<UserPlus className="w-4 h-4" />}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
