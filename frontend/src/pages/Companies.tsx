import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Building2, TrendingUp, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Companies = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">
            Discover companies, connect with organizations, and track your professional interests.
          </p>

          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search companies..."
              className="flex-1"
            />
            <Button>Search</Button>
          </div>
        </div>

        {/* Coming Soon Card */}
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Companies Feature Coming Soon</h2>
            <p className="text-muted-foreground">
              We're working on bringing you company pages, job postings, and professional
              insights. Stay tuned for updates!
            </p>
          </div>
        </Card>

        {/* Feature Preview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6">
            <Building2 className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Company Profiles</h3>
            <p className="text-sm text-muted-foreground">
              Browse detailed profiles of companies in your industry
            </p>
          </Card>

          <Card className="p-6">
            <Users className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Follow Companies</h3>
            <p className="text-sm text-muted-foreground">
              Stay updated with news and job postings from companies you follow
            </p>
          </Card>

          <Card className="p-6">
            <TrendingUp className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Industry Insights</h3>
            <p className="text-sm text-muted-foreground">
              Get insights into company growth, culture, and opportunities
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Companies;
