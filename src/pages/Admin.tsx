import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, CheckCircle, XCircle, MessageSquare, Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "@/convex/_generated/dataModel";

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const events = useQuery(api.events.list);
  const feedbacks = useQuery(api.feedback.list);
  const resources = useQuery(api.resources.list, {});
  const flaggedResources = useQuery(api.resources.getFlagged);
  const reportedGroups = useQuery(api.groups.getReportedGroups);
  
  const deleteEvent = useMutation(api.events.deleteEvent);
  const updateFeedback = useMutation(api.feedback.updateStatus);
  const deleteResource = useMutation(api.resources.deleteResource);
  const resolveFlag = useMutation(api.resources.resolveFlag);
  const dismissGroupReports = useMutation(api.groups.dismissReports);
  const deleteGroup = useMutation(api.groups.deleteGroup);

  const [replyText, setReplyText] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<Id<"feedback"> | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
      toast.error("Unauthorized access");
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  const handleDeleteEvent = async (id: Id<"events">) => {
    try {
      await deleteEvent({ id });
      toast.success("Event deleted");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const handleDeleteResource = async (id: Id<"resources">) => {
    try {
      await deleteResource({ id });
      toast.success("Resource deleted");
    } catch (error) {
      toast.error("Failed to delete resource");
    }
  };

  const handleResolveFlag = async (id: Id<"resources">, action: "keep" | "delete") => {
    try {
      await resolveFlag({ resourceId: id, action });
      toast.success(action === "delete" ? "Resource removed" : "Resource kept and unflagged");
    } catch (error) {
      toast.error("Failed to resolve flag");
    }
  };

  const handleDismissGroupReports = async (id: Id<"groups">) => {
    try {
      await dismissGroupReports({ groupId: id });
      toast.success("Group reports dismissed");
    } catch (error) {
      toast.error("Failed to dismiss reports");
    }
  };

  const handleDeleteGroup = async (id: Id<"groups">) => {
    try {
      await deleteGroup({ groupId: id });
      toast.success("Group deleted");
    } catch (error) {
      toast.error("Failed to delete group");
    }
  };

  const handleFeedbackAction = async (id: Id<"feedback">, status: string, reply?: string) => {
    try {
      await updateFeedback({ id, status, reply });
      toast.success(`Feedback marked as ${status}`);
      setSelectedFeedback(null);
      setReplyText("");
    } catch (error) {
      toast.error("Failed to update feedback");
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
        <p className="text-muted-foreground mt-2">Manage events, feedback, and resources.</p>
      </div>

      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="groups" className="text-orange-600">Reported Groups</TabsTrigger>
          <TabsTrigger value="flagged" className="text-destructive">Flagged Content</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          <div className="grid gap-4">
            {feedbacks?.map((item) => (
              <Card key={item._id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base font-medium">
                      {item.isAnonymous ? "Anonymous Student" : item.user?.name || "Unknown User"}
                    </CardTitle>
                    <CardDescription>{new Date(item._creationTime).toLocaleDateString()}</CardDescription>
                  </div>
                  <Badge variant={item.status === "resolved" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{item.content}</p>
                  {item.reply && (
                    <div className="bg-muted p-3 rounded-md mb-4 text-sm">
                      <span className="font-semibold">Admin Reply:</span> {item.reply}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedFeedback(item._id)}>
                          <MessageSquare className="mr-2 h-4 w-4" /> Reply
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reply to Feedback</DialogTitle>
                        </DialogHeader>
                        <Textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your response..."
                        />
                        <DialogFooter>
                          <Button onClick={() => handleFeedbackAction(item._id, "resolved", replyText)}>
                            Send & Resolve
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => handleFeedbackAction(item._id, "resolved")}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Resolve
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleFeedbackAction(item._id, "rejected")}>
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {feedbacks?.length === 0 && <p className="text-muted-foreground">No feedback found.</p>}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card className="border-orange-500/50">
            <CardHeader>
              <CardTitle className="text-orange-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Reported Groups
              </CardTitle>
              <CardDescription>Review groups flagged by users.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportedGroups?.map((group) => (
                  <div key={group._id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">{group.description}</p>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="outline">Type: {group.type}</Badge>
                          <Badge variant="destructive">{group.reports?.length || 0} Reports</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDismissGroupReports(group._id)}>
                          <CheckCircle className="h-4 w-4 mr-2" /> Dismiss Reports
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteGroup(group._id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Group
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-md text-sm">
                      <p className="font-semibold mb-2">Report Reasons:</p>
                      <ul className="space-y-2">
                        {group.detailedReports?.map((report, idx) => (
                          <li key={idx} className="flex flex-col gap-1 border-b last:border-0 pb-2 last:pb-0 border-border/50">
                            <span className="font-medium text-xs text-muted-foreground">Reported by {report.reporterName}:</span>
                            <span>"{report.reason}"</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
                {reportedGroups?.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No reported groups.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Flagged Resources
              </CardTitle>
              <CardDescription>Resources with more than 6 dislikes requiring review.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedResources?.map((res) => (
                  <div key={res._id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-lg">{res.title}</p>
                      <p className="text-sm text-muted-foreground">
                        By {res.uploaderName} • {res.subject} • {res.dislikes?.length || 0} Dislikes
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{res.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={res.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" /> Review
                        </a>
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleResolveFlag(res._id, "keep")}>
                        <CheckCircle className="h-4 w-4 mr-2" /> Keep
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleResolveFlag(res._id, "delete")}>
                        <Trash2 className="h-4 w-4 mr-2" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
                {flaggedResources?.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No flagged resources.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4">
            {events?.map((event) => (
              <Card key={event._id} className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
                </div>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteEvent(event._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Resources</CardTitle>
              <CardDescription>Manage and download student uploads.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {resources?.map((res) => (
                    <div key={res._id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{res.title}</p>
                        <p className="text-xs text-muted-foreground">
                          By {res.uploaderName} • {res.subject}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={res.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteResource(res._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}