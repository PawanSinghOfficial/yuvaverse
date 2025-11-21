import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Lock, Globe } from "lucide-react";

export default function Groups() {
  const groups = useQuery(api.groups.list);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study & Social Groups</h1>
          <p className="text-muted-foreground mt-2">Connect with peers, join discussions, and collaborate.</p>
        </div>
        <Button>Create Group</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups?.map((group) => (
          <Card key={group._id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">{group.name}</CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {group.isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                  <span className="capitalize">{group.type} Group</span>
                </div>
              </div>
              <div className="p-2 bg-muted rounded-md">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {group.description || "No description provided."}
              </p>
              <Button className="w-full mt-4" variant="outline">Join Group</Button>
            </CardContent>
          </Card>
        ))}
         {groups?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
                No groups found. Create one to get started!
            </div>
        )}
      </div>
    </div>
  );
}
