import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Shield } from "lucide-react";

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();


    // ADD THIS DEBUG LINE
  console.log('Header - user:', user, 'isAdmin():', isAdmin());

  
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div 
  className="text-2xl font-bold cursor-pointer" 
  onClick={async () => {
    // Redirect to status page if they have a submission, otherwise intake
    const submissions = await api.getMySubmissions();
    if (submissions && submissions.length > 0) {
      navigate(`/status/${submissions[0].id}`);
    } else {
      navigate("/intake");
    }
  }}
>
  Estate Guru Settlement
</div>

        <div className="flex items-center gap-4">
          {isAdmin() && (
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin")}
              className="hidden sm:flex"
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin Portal
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {user.first_name} {user.last_name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              {isAdmin() && (
                <DropdownMenuItem onClick={() => navigate("/admin")} className="sm:hidden">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Portal
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;