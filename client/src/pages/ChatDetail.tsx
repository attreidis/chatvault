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
  Hash,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";

const MAX_FILENAME_LEN = 120;

function yamlEscapeDoubleQuoted(s: string) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function yamlList(items: string[]) {
  if (!items.length) return "[]";
  return "\n" + items.map(t => `  - "${yamlEscapeDoubleQuoted(t)}"`).join("\n");
}

function slugifyFilename(input: string) {
  const normalized = input.normalize("NFKD");
  const stripped = normalized
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "");
  const slug = stripped
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "chat";
}

function truncateMiddle(s: string, maxLen: number) {
  if (s.length <= maxLen) return s;
  const half = Math.floor((maxLen - 3) / 2);
  return s.slice(0, half) + "..." + s.slice(s.length - half);
}

function formatAsRoleBlocks(content: string) {
  const text = content.replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const roleRegex = /^(user|assistant|system)\s*:\s*(.*)$/i;

  let found = false;
  const blocks: { role: string; lines: string[] }[] = [];
  let current: { role: string; lines: string[] } | null = null;

  for (const line of lines) {
    const m = line.match(roleRegex);
    if (m) {
      found = true;
      if (current) blocks.push(current);
      current = { role: m[1].toLowerCase(), lines: [m[2]] };
    } else {
      if (!current) return content;
      current.lines.push(line);
    }
  }
  if (current) blocks.push(current);
  if (!found || blocks.length < 2) return content;

  const roleTitle = (r: string) =>
    r === "user" ? "User" : r === "assistant" ? "Assistant" : "System";

  return blocks
    .map(b => `## ${roleTitle(b.role)}\n\n${b.lines.join("\n").trim()}`)
    .join("\n\n");
}

export default function ChatDetail() {
  const [match, params] = useRoute("/chats/:id");
  const [, setLocation] = useLocation();
  const id = parseInt(params?.id || "0");
  const { data: chat, isLoading, isError } = useChat(id);
  const { mutate: deleteChat, isPending: isDeleting } = useDeleteChat();
  const [isExporting, setIsExporting] = useState(false);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !chat) return <div className="p-8 text-center">Chat not found</div>;

  const handleExport = (options?: { roleBlocks?: boolean }) => {
    setIsExporting(true);
    try {
      const created = new Date(chat.createdAt!);
      const dateForFrontmatter = format(created, "yyyy-MM-dd HH:mm");
      const dateForFilename = format(created, "yyyy-MM-dd");

      const safeTitle = yamlEscapeDoubleQuoted(chat.title);
      const tags = Array.isArray(chat.tags) ? chat.tags : [];

      const frontmatter = [
        "---",
        `title: "${safeTitle}"`,
        `agent: "${chat.agent}"`,
        `date: "${dateForFrontmatter}"`,
        `tags: ${yamlList(tags)}`,
        "---",
        "",
        `# ${chat.title}`,
        "",
        options?.roleBlocks ? formatAsRoleBlocks(chat.content) : chat.content,
        "",
      ].join("\n");

      const base = `${dateForFilename} - ${slugifyFilename(chat.title)} - ${chat.id}.md`;
      const filename = truncateMiddle(base, MAX_FILENAME_LEN);

      const blob = new Blob([frontmatter], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 0);
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isExporting} data-testid="button-export">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport()} data-testid="export-raw">
                  Export as Raw Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport({ roleBlocks: true })} data-testid="export-formatted">
                  Export with Role Blocks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
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
              {/* Security: Do NOT add rehype-raw without sanitization (XSS risk) */}
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
