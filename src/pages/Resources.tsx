import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export default function Resources() {
  const resources = useQuery(api.resources.list, {});

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
          <p className="text-muted-foreground mt-2">Access study materials, notes, and past papers.</p>
        </div>
        <Button>Upload New</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resources?.map((resource) => (
          <Card key={resource._id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">{resource.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{resource.subject} • Sem {resource.semester}</p>
              </div>
              <div className="p-2 bg-muted rounded-md">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {resource.description || "No description provided."}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground capitalize">{resource.type}</span>
                <Button variant="ghost" size="sm" className="h-8 gap-2">
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {resources?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
                No resources found. Be the first to upload!
            </div>
        )}
      </div>
    </div>
  );
}
