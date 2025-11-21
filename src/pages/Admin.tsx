import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, CheckCircle, XCircle, MessageSquare, Download } from "lucide-react";
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
  
  const deleteEvent = useMutation(api.events.deleteEvent);
  const updateFeedback = useMutation(api.feedback.updateStatus);
  const deleteResource = useMutation(api.resources.deleteResource);

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