import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, BarChart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your estate settlement dashboard
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>My Submissions</CardTitle>
              <CardDescription>View your estate settlement forms</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This will show your submission history once authentication is added.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Attorney Matches</CardTitle>
              <CardDescription>Attorneys matched to your case</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View recommended attorneys for your estate type.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Case Status</CardTitle>
              <CardDescription>Track your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor the status of your estate settlement.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => navigate("/intake")}>
              <FileText className="mr-2 h-4 w-4" />
              New Intake Form
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Landing
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;