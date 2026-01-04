import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Link as LinkIcon, Plus, MoreVertical, BookOpen, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function SourcesPanel({ notebookId, isOpen }: { notebookId: Id<"ai_notebooks">, isOpen: boolean }) {
    const sources = useQuery(api.ai_notebook.getSources, { notebookId });

    return (
        <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: isOpen ? 300 : 0, opacity: isOpen ? 1 : 0 }}
            className="border-r bg-white flex flex-col h-full shadow-xl z-10 overflow-hidden"
        >
            <div className="p-4 border-b flex items-center justify-between bg-slate-50/50 min-w-[300px]">
                <h3 className="font-bold flex items-center gap-2 text-slate-800">
                    <BookOpen className="h-4 w-4 text-purple-600" /> Sources
                </h3>
                <div className="text-xs font-medium px-2 py-1 bg-slate-200 rounded-full text-slate-600">
                    {sources?.length || 0} files
                </div>
            </div>
            <ScrollArea className="flex-1 p-4 min-w-[300px]">
                <div className="space-y-3">
                    <AddSourceButton notebookId={notebookId} />
                    {sources?.map((source) => (
                        <Card key={source._id} className="p-3 hover:bg-slate-50 transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-purple-500 group shadow-sm hover:shadow-md relative overflow-hidden">
                            {source.isProcessing && (
                                <div className="absolute top-0 right-0 p-1">
                                    <span className="flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                    </span>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-1.5 bg-slate-100 rounded-md" title={source.summary || "No summary available"}>
                                    {source.type === "pdf" ? (
                                        <FileText className="h-4 w-4 text-red-500" />
                                    ) : source.type === "url" ? (
                                        <LinkIcon className="h-4 w-4 text-blue-500" />
                                    ) : (
                                        <FileText className="h-4 w-4 text-slate-500" />
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="text-sm font-bold truncate text-slate-800" title={source.summary || source.title}>{source.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground truncate capitalize">{source.type} Source</p>
                                        {source.isProcessing && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full animate-pulse">
                                                Processing...
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Add delete functionality here if needed, or keep the menu
                                    }}
                                >
                                    <MoreVertical className="h-3 w-3" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </motion.div>
    );
}

function AddSourceButton({ notebookId }: { notebookId: Id<"ai_notebooks"> }) {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<"text" | "url" | "pdf">("text");
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const addSource = useMutation(api.ai_notebook.addSource);
    const generateUploadUrl = useMutation(api.ai_notebook.generateUploadUrl);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;
        
        setIsUploading(true);
        try {
            let storageId = undefined;
            let contentToSave = content;

            if (type === "pdf" && file) {
                // 1. Get upload URL
                const postUrl = await generateUploadUrl();
                
                // 2. Upload file
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });
                
                if (!result.ok) throw new Error("Upload failed");
                const { storageId: id } = await result.json();
                storageId = id;
                contentToSave = "PDF Document"; // Placeholder content
            } else if (type !== "pdf" && !content) {
                 setIsUploading(false);
                 return;
            }

            await addSource({
                notebookId,
                title,
                type,
                content: contentToSave,
                fileId: storageId,
            });
            setIsOpen(false);
            setContent("");
            setTitle("");
            setFile(null);
            setType("text");
            toast.success("Source added successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to add source");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-dashed border-2 border-black/30 hover:border-black hover:bg-yellow-50 hover:text-black transition-all font-bold uppercase tracking-wide">
                    <Plus className="mr-2 h-4 w-4" /> Add New Source
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase">Add Knowledge Source</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2 mb-4 p-1 bg-yellow-50 border-2 border-black rounded-sm">
                    <Button 
                        variant={type === "text" ? "default" : "ghost"} 
                        onClick={() => setType("text")}
                        className={`flex-1 rounded-sm font-bold uppercase ${type === "text" ? "bg-black text-white shadow-none" : "hover:bg-black/10"}`}
                    >
                        <FileText className="mr-2 h-4 w-4" /> Text
                    </Button>
                    <Button 
                        variant={type === "url" ? "default" : "ghost"} 
                        onClick={() => setType("url")}
                        className={`flex-1 rounded-sm font-bold uppercase ${type === "url" ? "bg-black text-white shadow-none" : "hover:bg-black/10"}`}
                    >
                        <LinkIcon className="mr-2 h-4 w-4" /> URL
                    </Button>
                    <Button 
                        variant={type === "pdf" ? "default" : "ghost"} 
                        onClick={() => setType("pdf")}
                        className={`flex-1 rounded-sm font-bold uppercase ${type === "pdf" ? "bg-black text-white shadow-none" : "hover:bg-black/10"}`}
                    >
                        <Upload className="mr-2 h-4 w-4" /> PDF
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input 
                            placeholder="e.g. Chapter 1 Summary" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="font-medium border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Content</label>
                        {type === "text" ? (
                            <textarea 
                                className="w-full min-h-[150px] p-3 rounded-md border-2 border-black bg-transparent text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                                placeholder="Paste your study material text here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        ) : type === "url" ? (
                            <Input 
                                placeholder="https://example.com/article" 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            />
                        ) : (
                            <div className="border-2 border-dashed border-black rounded-md p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative bg-slate-50/50">
                                <input 
                                    type="file" 
                                    accept=".pdf"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                            setFile(f);
                                            if (!title) setTitle(f.name.replace(".pdf", ""));
                                        }
                                    }}
                                    required={type === "pdf"}
                                />
                                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                                {file ? (
                                    <div className="text-sm font-bold text-purple-600">{file.name}</div>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-slate-600">Click to upload PDF</p>
                                        <p className="text-xs text-slate-400">Max size 10MB</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <Button type="submit" disabled={isUploading} className="w-full font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isUploading ? "Uploading..." : "Add to Notebook"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}