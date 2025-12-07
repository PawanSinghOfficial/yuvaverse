import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Link as LinkIcon, Plus, MoreVertical, BookOpen } from "lucide-react";
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
                        <Card key={source._id} className="p-3 hover:bg-slate-50 transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-purple-500 group shadow-sm hover:shadow-md">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-1.5 bg-slate-100 rounded-md">
                                    {source.type === "pdf" ? <FileText className="h-4 w-4 text-red-500" /> : <LinkIcon className="h-4 w-4 text-blue-500" />}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="text-sm font-bold truncate text-slate-800" title={source.title}>{source.title}</h4>
                                    <p className="text-xs text-muted-foreground truncate capitalize">{source.type} Source</p>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
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
    const [type, setType] = useState<"text" | "url">("text");
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    
    const addSource = useMutation(api.ai_notebook.addSource);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content || !title) return;
        
        await addSource({
            notebookId,
            title,
            type,
            content,
        });
        setIsOpen(false);
        setContent("");
        setTitle("");
        toast.success("Source added successfully");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-dashed border-2 border-slate-300 hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 transition-all font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Add New Source
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black">Add Knowledge Source</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2 mb-4 p-1 bg-slate-100 rounded-lg">
                    <Button 
                        variant={type === "text" ? "default" : "ghost"} 
                        onClick={() => setType("text")}
                        className={`flex-1 rounded-md ${type === "text" ? "shadow-sm" : ""}`}
                    >
                        <FileText className="mr-2 h-4 w-4" /> Text Content
                    </Button>
                    <Button 
                        variant={type === "url" ? "default" : "ghost"} 
                        onClick={() => setType("url")}
                        className={`flex-1 rounded-md ${type === "url" ? "shadow-sm" : ""}`}
                    >
                        <LinkIcon className="mr-2 h-4 w-4" /> Website URL
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
                            className="font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Content</label>
                        {type === "text" ? (
                            <textarea 
                                className="w-full min-h-[150px] p-3 rounded-md border bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                                placeholder="Paste your study material text here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        ) : (
                            <Input 
                                placeholder="https://example.com/article" 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        )}
                    </div>
                    <Button type="submit" className="w-full font-bold">Add to Notebook</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
