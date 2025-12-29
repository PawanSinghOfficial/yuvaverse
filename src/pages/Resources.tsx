import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Upload, Loader2, Code, ThumbsUp, ThumbsDown, AlertTriangle, Search, Flag, Filter, BrainCircuit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "@/convex/_generated/dataModel";
import { FlashcardGenerator } from "@/components/FlashcardGenerator";

export default function Resources() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const resources = useQuery(api.resources.list, { search: debouncedSearch === "" ? undefined : debouncedSearch });
  
  // Extract unique subjects with codes
  const uniqueSubjects = resources 
    ? Array.from(new Map(resources.map(r => [r.subject, r.subjectCode])).entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
    : [];

  const filteredResources = resources?.filter(r => 
    selectedSubject === "all" || r.subject === selectedSubject
  );
  const generateUploadUrl = useMutation(api.resources.generateUploadUrl);
  const createResource = useMutation(api.resources.create);
  const toggleLike = useMutation(api.resources.toggleLike);
  const toggleDislike = useMutation(api.resources.toggleDislike);
  const reportResource = useMutation(api.resources.report);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    semester: "1",
    type: "note",
    file: null as File | null,
  });

  // Reporting state
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [resourceToReport, setResourceToReport] = useState<Id<"resources"> | null>(null);
  const [isConfirmReportOpen, setIsConfirmReportOpen] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get upload URL
      const postUrl = await generateUploadUrl();
      
      // 2. Upload file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": formData.file.type },
        body: formData.file,
      });
      
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

      // 3. Create resource record
      await createResource({
        title: formData.title,
        subject: formData.subject,
        semester: parseInt(formData.semester),
        type: formData.type,
        fileId: storageId,
      });

      confetti({
        particleCount: 150,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF0080', '#00FF80', '#FFD700']
      });

      toast.success("Resource uploaded successfully! +Points earned");
      setIsOpen(false);
      setFormData({ title: "", subject: "", semester: "1", type: "note", file: null });
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload resource");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLike = async (id: any) => {
    try {
      await toggleLike({ resourceId: id });
    } catch (error) {
      toast.error("Failed to like resource");
    }
  };

  const handleDislike = async (id: any) => {
    try {
      await toggleDislike({ resourceId: id });
    } catch (error) {
      toast.error("Failed to dislike resource");
    }
  };

  const openReportDialog = (resourceId: Id<"resources">) => {
    setResourceToReport(resourceId);
    setReportReason("");
    setIsReportDialogOpen(true);
  };

  const handleReportSubmitClick = () => {
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting.");
      return;
    }
    setIsConfirmReportOpen(true);
  };

  const handleConfirmReport = async () => {
    if (!resourceToReport) return;

    try {
      await reportResource({ resourceId: resourceToReport, reason: reportReason });
      toast.success("Resource reported to admins.");
      setIsConfirmReportOpen(false);
      setIsReportDialogOpen(false);
      setResourceToReport(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to report resource");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 w-full min-h-full bg-pink-50 dark:bg-background">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
          <p className="text-muted-foreground mt-2">Access study materials, notes, and past papers.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          {/* Subject Filter */}
          <div className="w-full sm:w-48">
             <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                   <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by Subject" />
                   </div>
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">All Subjects</SelectItem>
                   {uniqueSubjects.map(([name, code]) => (
                      <SelectItem key={name} value={name}>
                        {name} {code ? `(${code})` : ""}
                      </SelectItem>
                   ))}
                </SelectContent>
             </Select>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black font-bold" />
            <Input
              type="search"
              placeholder="Search resources..."
              className="pl-10 w-full h-10 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                <Upload className="mr-2 h-4 w-4" />
                Upload New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Resource</DialogTitle>
                <DialogDescription>Share your notes and study materials with the community.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    required 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Data Structures Notes Unit 1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="e.g., CS-101"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select 
                      value={formData.semester} 
                      onValueChange={(v) => setFormData({...formData, semester: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sem" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v) => setFormData({...formData, type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="note">Notes</SelectItem>
                      <SelectItem value="paper">Question Paper</SelectItem>
                      <SelectItem value="practical">Practical File</SelectItem>
                      <SelectItem value="book">Book/Reference</SelectItem>
                      <SelectItem value="code">Code/Snippet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input 
                    id="file" 
                    type="file" 
                    required
                    onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Resource</DialogTitle>
            <DialogDescription>Please explain why you are reporting this resource. Admins will review your report.</DialogDescription>
          </DialogHeader>
          <Textarea 
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Reason for reporting (e.g., inappropriate content, copyright violation)..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReportSubmitClick}>Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmReportOpen} onOpenChange={setIsConfirmReportOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to report this resource? False reporting may lead to account restrictions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirm Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources?.map((resource) => {
          const hasLiked = user && resource.likes?.includes(user._id);
          const hasDisliked = user && resource.dislikes?.includes(user._id);
          const isReported = resource.reports && resource.reports.length > 0;
          
          return (
          <Card 
            key={resource._id} 
            onClick={() => window.open(resource.url, "_blank")}
            className={`cursor-pointer border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${resource.isFlagged || isReported ? "bg-red-50" : "bg-white"}`}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  {resource.title}
                  {(resource.isFlagged || isReported) && <AlertTriangle className="h-4 w-4 text-destructive" />}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 border border-black rounded-none">
                        {resource.subject}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 bg-pink-100 text-pink-700 border border-black rounded-none">
                        Sem {resource.semester}
                    </span>
                </div>
                <p className="text-xs font-medium text-muted-foreground mt-1">By {resource.uploaderName}</p>
              </div>
              <div className="p-2 bg-yellow-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {resource.type === "code" ? (
                  <Code className="h-5 w-5 text-black" />
                ) : (
                  <FileText className="h-5 w-5 text-black" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-8 px-2 gap-1 border border-transparent hover:border-black hover:bg-gray-100 ${hasLiked ? "text-blue-600 bg-blue-50 border-blue-200" : "text-muted-foreground"}`}
                    onClick={(e) => { e.stopPropagation(); handleLike(resource._id); }}
                   >
                     <ThumbsUp className={`h-3 w-3 ${hasLiked ? "fill-current" : ""}`} />
                     <span className="text-xs font-bold">{resource.likes?.length || 0}</span>
                   </Button>
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-8 px-2 gap-1 border border-transparent hover:border-black hover:bg-gray-100 ${hasDisliked ? "text-red-600 bg-red-50 border-red-200" : "text-muted-foreground"}`}
                    onClick={(e) => { e.stopPropagation(); handleDislike(resource._id); }}
                   >
                     <ThumbsDown className={`h-3 w-3 ${hasDisliked ? "fill-current" : ""}`} />
                     <span className="text-xs font-bold">{resource.dislikes?.length || 0}</span>
                   </Button>
                </div>
                <div className="flex items-center gap-2">
                    <div onClick={(e) => e.stopPropagation()}>
                        <FlashcardGenerator 
                            title={resource.title} 
                            sourceType="resource" 
                            sourceId={resource._id}
                            trigger={
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50" title="Generate Flashcards">
                                    <BrainCircuit className="h-4 w-4" />
                                </Button>
                            }
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => { e.stopPropagation(); openReportDialog(resource._id); }}
                        title="Report Resource"
                    >
                        <Flag className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="default" 
                        size="sm" 
                        className="h-8 w-8 p-0 bg-black text-white hover:bg-gray-800 border-2 border-transparent hover:border-black shadow-none hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" 
                        asChild
                        onClick={(e) => e.stopPropagation()}
                    >
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" title="Download">
                        <Download className="h-4 w-4" />
                    </a>
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )})}
        {filteredResources?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
                No resources found matching your criteria.
            </div>
        )}
      </div>
    </div>
  );
}