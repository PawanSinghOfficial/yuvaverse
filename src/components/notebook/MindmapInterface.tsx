import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Network, Plus, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function MindmapInterface({ notebookId }: { notebookId: Id<"ai_notebooks"> }) {
    const mindmaps = useQuery(api.ai_notebook.getMindmaps, { notebookId });
    const generateMindmap = useAction(api.ai_notebook_actions.generateMindmap);
    const deleteMindmap = useMutation(api.ai_notebook.deleteMindmap);
    const [activeMindmapId, setActiveMindmapId] = useState<Id<"ai_mindmaps"> | null>(null);

    const handleGenerate = async () => {
        try {
            toast.info("Generating mindmap structure...");
            await generateMindmap({ notebookId });
            toast.success("Mindmap generated!");
        } catch (error) {
            toast.error("Failed to generate mindmap. Ensure you have sources.");
        }
    };

    if (activeMindmapId) {
        const mindmap = mindmaps?.find(m => m._id === activeMindmapId);
        if (!mindmap) return <div onClick={() => setActiveMindmapId(null)}>Mindmap not found.</div>;
        return <MindmapViewer data={mindmap.rootNode} title={mindmap.title} onBack={() => setActiveMindmapId(null)} />;
    }

    return (
        <div className="p-6 h-full flex flex-col max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Network className="h-6 w-6 text-blue-600" />
                        Mind Maps
                    </h2>
                    <p className="text-muted-foreground">Visualize connections between concepts.</p>
                </div>
                <Button onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Generate Mindmap
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mindmaps?.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed">
                        <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-muted-foreground">No mindmaps yet</h3>
                        <p className="text-sm text-muted-foreground/80 mb-4">Generate a visual map of your study materials.</p>
                        <Button variant="outline" onClick={handleGenerate}>Generate First Mindmap</Button>
                    </div>
                )}
                {mindmaps?.map((map) => (
                    <motion.div
                        key={map._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        className="group relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
                        onClick={() => setActiveMindmapId(map._id)}
                    >
                        <div className="h-32 bg-blue-50/50 flex items-center justify-center border-b">
                            <Network className="h-12 w-12 text-blue-200" />
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold truncate mb-1">{map.title}</h3>
                            <p className="text-xs text-muted-foreground">Click to view visualization</p>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteMindmap({ mindmapId: map._id });
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// Simple Recursive Tree Visualizer
function MindmapViewer({ data, title, onBack }: { data: any, title: string, onBack: () => void }) {
    const [scale, setScale] = useState(1);

    return (
        <div className="h-full flex flex-col bg-slate-50">
            <div className="h-14 border-b bg-white px-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack}>← Back</Button>
                    <h3 className="font-bold truncate max-w-md">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
                    <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
                    <Button variant="outline" size="icon" onClick={() => setScale(s => Math.min(2, s + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto p-8 flex items-center justify-center cursor-grab active:cursor-grabbing">
                <motion.div 
                    style={{ scale }}
                    className="min-w-max"
                >
                    <TreeNode node={data} isRoot />
                </motion.div>
            </div>
        </div>
    );
}

function TreeNode({ node, isRoot = false }: { node: any, isRoot?: boolean }) {
    return (
        <div className="flex flex-col items-center">
            <div className={`
                relative z-10 px-6 py-3 rounded-full border-2 shadow-sm font-bold text-center transition-all hover:scale-105
                ${isRoot 
                    ? "bg-blue-600 text-white border-blue-700 text-lg shadow-blue-200" 
                    : "bg-white text-slate-700 border-slate-200 text-sm hover:border-blue-400 hover:text-blue-600"
                }
            `}>
                {node.label}
            </div>
            
            {node.children && node.children.length > 0 && (
                <div className="flex flex-col items-center">
                    <div className="h-8 w-px bg-slate-300"></div>
                    <div className="flex gap-8 relative">
                        {/* Horizontal connector line */}
                        {node.children.length > 1 && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] h-px bg-slate-300 -translate-y-px"></div>
                        )}
                        
                        {node.children.map((child: any, idx: number) => (
                            <div key={child.id || idx} className="flex flex-col items-center relative">
                                <div className="h-8 w-px bg-slate-300"></div>
                                <TreeNode node={child} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
