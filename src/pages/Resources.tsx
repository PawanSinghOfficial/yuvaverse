import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Upload, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export default function Resources() {
  const resources = useQuery(api.resources.list, {});
  const generateUploadUrl = useMutation(api.resources.generateUploadUrl);
  const createResource = useMutation(api.resources.create);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    semester: "1",
    type: "note",
    file: null as File | null,
  });

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

      toast.success("Resource uploaded successfully!");
      setIsOpen(false);
      setFormData({ title: "", subject: "", semester: "1", type: "note", file: null });
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload resource");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
          <p className="text-muted-foreground mt-2">Access study materials, notes, and past papers.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resources?.map((resource) => (
          <Card key={resource._id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">{resource.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{resource.subject} • Sem {resource.semester}</p>
                <p className="text-xs text-muted-foreground">By {resource.uploaderName}</p>
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
                <Button variant="ghost" size="sm" className="h-8 gap-2" asChild>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-3 w-3" />
                    Download
                  </a>
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