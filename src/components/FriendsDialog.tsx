import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, UserPlus, Users, Check, X, Copy } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface FriendsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FriendsDialog({ open, onOpenChange }: FriendsDialogProps) {
  const { user } = useAuth();
  const ensureCode = useMutation(api.friends.ensureFriendCode);
  const sendRequest = useMutation(api.friends.sendFriendRequest);
  const respondToRequest = useMutation(api.friends.respondToRequest);
  const friends = useQuery(api.friends.getFriends);
  const requests = useQuery(api.friends.getIncomingRequests);
  
  const [friendCode, setFriendCode] = useState<string>("");
  const [inputCode, setInputCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      if (user.friendCode) {
        setFriendCode(user.friendCode);
      } else {
        ensureCode().then((code) => {
          if (code) setFriendCode(code);
        });
      }
    }
  }, [open, user, ensureCode]);

  const handleSendRequest = async () => {
    if (inputCode.length !== 4) {
      toast.error("Please enter a valid 4-digit code");
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await sendRequest({ friendCode: inputCode });
      toast.success(result.message);
      setInputCode("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (requestId: any, accept: boolean) => {
    try {
      await respondToRequest({ requestId, accept });
      toast.success(accept ? "Friend request accepted!" : "Friend request rejected");
    } catch (error) {
      toast.error("Failed to respond to request");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(friendCode);
    toast.success("Code copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Friends & Connections
          </DialogTitle>
          <DialogDescription>
            Connect with other students using your unique friend code.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="bg-muted p-4 rounded-lg border-2 border-black flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Your Friend Code</p>
              <p className="text-3xl font-black tracking-widest">{friendCode || "...."}</p>
            </div>
            <Button variant="outline" size="icon" onClick={copyCode} className="border-2 border-black hover:bg-primary/20">
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="grid w-full grid-cols-3 border-2 border-black p-0 h-auto bg-transparent gap-1">
              <TabsTrigger value="friends" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-r-2 border-transparent data-[state=active]:border-black rounded-none h-9">Friends</TabsTrigger>
              <TabsTrigger value="add" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-r-2 border-transparent data-[state=active]:border-black rounded-none h-9">Add Friend</TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none h-9 relative">
                Requests
                {requests && requests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-black">
                    {requests.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="mt-4">
              <ScrollArea className="h-[300px] pr-4">
                {friends === undefined ? (
                  <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No friends yet. Add some!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friend: any) => (
                      <div key={friend._id} className="flex items-center justify-between p-3 bg-card border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3">
                          <Avatar className="border border-black">
                            <AvatarImage src={friend.image} />
                            <AvatarFallback>{friend.name?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm">{friend.name}</p>
                            <p className="text-xs text-muted-foreground">{friend.points} XP</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="add" className="mt-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Enter Friend Code</p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. 1234" 
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="border-2 border-black text-lg tracking-widest font-bold"
                    maxLength={4}
                  />
                  <Button onClick={handleSendRequest} disabled={isLoading || inputCode.length !== 4} className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ask your friend for their 4-digit code found in their profile.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="requests" className="mt-4">
              <ScrollArea className="h-[300px] pr-4">
                {requests === undefined ? (
                  <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No pending requests.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((req: any) => (
                      <div key={req._id} className="flex items-center justify-between p-3 bg-card border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3">
                          <Avatar className="border border-black">
                            <AvatarImage src={req.sender.image} />
                            <AvatarFallback>{req.sender.name?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm">{req.sender.name}</p>
                            <p className="text-xs text-muted-foreground">wants to be friends</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100" onClick={() => handleRespond(req._id, true)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => handleRespond(req._id, false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
