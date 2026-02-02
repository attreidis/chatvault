import { useChats } from "@/hooks/use-chats";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Bot, MessageSquare, Plus, Search, Calendar, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: chats, isLoading, isError } = useChats();
  const [search, setSearch] = useState("");

  const filteredChats = chats?.filter(chat => 
    chat.title.toLowerCase().includes(search.toLowerCase()) || 
    chat.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
    chat.agent.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const recentChats = filteredChats.slice(0, 5);

  if (isError) return <div>Error loading chats.</div>;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your archived conversations</p>
          </div>
          <Link href="/chats/new">
            <div className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
              <Plus size={18} />
              New Archive
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            label="Total Archives" 
            value={isLoading ? "..." : chats?.length.toString() || "0"} 
            icon={<MessageSquare className="text-blue-400" />} 
          />
          <StatCard 
            label="Agents Used" 
            value={isLoading ? "..." : new Set(chats?.map(c => c.agent)).size.toString() || "0"} 
            icon={<Bot className="text-purple-400" />} 
          />
          <StatCard 
            label="Obsidian Ready" 
            value={isLoading ? "..." : chats?.length.toString() || "0"} 
            icon={<img src="https://upload.wikimedia.org/wikipedia/commons/1/10/2023_Obsidian_logo.svg" className="w-5 h-5 opacity-70 grayscale" alt="Obsidian" />} 
          />
        </div>

        {/* Recent Chats Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Archives</h2>
            <Link href="/chats" className="text-sm text-primary hover:underline">View All</Link>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search recent archives..." 
              className="pl-10 bg-secondary/30 border-border/50 focus-visible:ring-primary/30" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid gap-3">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <ChatSkeleton key={i} />)
            ) : recentChats.length > 0 ? (
              recentChats.map(chat => (
                <Link key={chat.id} href={`/chats/${chat.id}`}>
                  <div className="group bg-card hover:bg-secondary/40 border border-border/50 hover:border-primary/20 rounded-xl p-4 transition-all duration-200 cursor-pointer relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {chat.title}
                          </h3>
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-primary/5 border-primary/20 text-primary capitalize">
                            {chat.agent}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                          {chat.content.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDistanceToNow(new Date(chat.createdAt!), { addSuffix: true })}
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card/30">
                <p className="text-muted-foreground">No chats found. Time to archive something?</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 bg-secondary rounded-xl">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function ChatSkeleton() {
  return (
    <div className="w-full h-20 rounded-xl bg-card border border-border/50 p-4 flex flex-col justify-center gap-2">
      <Skeleton className="h-5 w-1/3 bg-secondary" />
      <Skeleton className="h-4 w-2/3 bg-secondary/50" />
    </div>
  );
}
