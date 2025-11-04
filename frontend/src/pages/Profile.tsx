import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from '@/integrations/supabase/client';



const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={async () => {
              const submissions = await api.getMySubmissions();
              if (submissions && submissions.length > 0) {
                navigate(`/status/${submissions[0].id}`);
              } else {
                navigate("/intake");
              }
            }}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Submission
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>User Profile</CardTitle>
            </div>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Name</p>
                <p className="font-medium">{user?.first_name} {user?.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                <p className="font-medium capitalize">{user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;