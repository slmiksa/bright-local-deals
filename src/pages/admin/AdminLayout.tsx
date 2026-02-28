import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Megaphone,
  FolderOpen,
  MapPin,
  BarChart3,
  LogOut,
  PanelLeft,
  Settings,
} from "lucide-react";

const menuItems = [
  { title: "الرئيسية", url: "/admin", icon: LayoutDashboard },
  { title: "الإعلانات", url: "/admin/ads", icon: Megaphone },
  { title: "التصنيفات", url: "/admin/categories", icon: FolderOpen },
  { title: "المدن", url: "/admin/cities", icon: MapPin },
  { title: "الإحصائيات", url: "/admin/stats", icon: BarChart3 },
  { title: "الإعدادات", url: "/admin/settings", icon: Settings },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-base font-black py-4 px-2">
              🕶 لوحة تحكم لمحة
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-muted/50 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                      activeClassName="bg-primary/10 text-primary font-bold"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>تسجيل خروج</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const AdminLayout = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div dir="rtl">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 flex items-center border-b border-border bg-card px-4 gap-3 sticky top-0 z-40">
              <SidebarTrigger>
                <PanelLeft className="w-5 h-5" />
              </SidebarTrigger>
              <h2 className="text-sm font-bold text-foreground">لوحة التحكم</h2>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
