import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles } from "lucide-react";

export default function NotebookLM() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            AI Notebook Assistant
          </h1>
          <p className="text-muted-foreground text-sm">
            Powered by Google NotebookLM. Access your notebooks directly here.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
            <a href="https://notebooklm.google.com/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
            </a>
        </Button>
      </div>

      <div className="flex-1 border-2 border-border rounded-xl overflow-hidden bg-muted/20 relative shadow-sm">
        <iframe 
            src="https://notebooklm.google.com/" 
            className="w-full h-full absolute inset-0 border-0"
            title="NotebookLM"
            allow="clipboard-write; microphone; camera"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
        <div className="absolute inset-0 -z-10 flex items-center justify-center text-muted-foreground">
            Loading NotebookLM...
        </div>
      </div>
    </div>
  );
}