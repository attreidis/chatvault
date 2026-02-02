import { useChat, useDeleteChat } from "@/hooks/use-chats";
import { AppLayout } from "@/components/AppLayout";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  Edit, 
  Bot, 
  Calendar,
  Hash
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function ChatDetail() {
  const [match, params] = useRoute("/chats/:id");
  const [, setLocation] = useLocation();
  const id = parseInt(params?.id || "0");
  const { data: chat, isLoading, isError } = useChat(id);
  const { mutate: deleteChat, isPending: isDeleting } = useDeleteChat();
  const [isExporting, setIsExporting] = useState(false);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !chat) return <div className="p-8 text-center">Chat not found</div>;

  const handleExport = () => {
    setIsExporting(true);
    try {
      // Create Obsidian-friendly Markdown content
      const frontmatter = [
        "---",
        `title: "${chat.title}"`,
        `agent: ${chat.agent}`,
        `date: ${format(new Date(chat.createdAt!), "yyyy-MM-dd HH:mm")}`,
        `tags: [${chat.tags?.join(", ")}]`,
        "---",
        "",
        `# ${chat.title}`,
        "",
        chat.content
      ].join("\n");

      const blob = new Blob([frontmatter], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    deleteChat(id, {
      onSuccess: () => setLocation("/dashboard"),
    });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-background/95 backdrop-blur z-20 py-4 border-b border-border/50 -mx-4 px-4 md:-mx-8 md:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold truncate max-w-xs md:max-w-md">{chat.title}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold">
                  {chat.agent}
                </Badge>
                <span>•</span>
                <span>{format(new Date(chat.createdAt!), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
              <Download className="w-4 h-4 mr-2" />
              Export to Obsidian
            </Button>
            
            <Button variant="outline" size="icon" onClick={() => setLocation(`/chats/${id}/edit`)}>
              <Edit className="w-4 h-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Archive?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this conversation from your vault.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Content */}
          <div className="lg:col-span-3">
            <Card className="p-8 bg-card border-border/50 min-h-[500px]">
              <div className="prose-custom">
                <ReactMarkdown>{chat.content}</ReactMarkdown>
              </div>
            </Card>
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-4">
            <Card className="p-4 bg-secondary/20 border-border/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Metadata</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Bot className="w-4 h-4" /> Agent
                  </div>
                  <p className="capitalize font-medium">{chat.agent}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" /> Archived
                  </div>
                  <p className="font-medium">{format(new Date(chat.createdAt!), "PPp")}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Hash className="w-4 h-4" /> Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {chat.tags && chat.tags.length > 0 ? (
                      chat.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-background/50 hover:bg-background">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground italic text-xs">No tags</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function DetailSkeleton() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-16 w-full bg-card rounded-lg border border-border/50" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Skeleton className="h-[500px] w-full bg-card" />
          </div>
          <div>
            <Skeleton className="h-[200px] w-full bg-card" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
