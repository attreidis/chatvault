import { useChats } from "@/hooks/use-chats";
import { AppLayout } from "@/components/AppLayout";
import { Link } from "wouter";
import { Search, Plus, Calendar, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function AllChats() {
  const { data: chats, isLoading } = useChats();
  const [search, setSearch] = useState("");

  const filteredChats = chats?.filter(chat => 
    chat.title.toLowerCase().includes(search.toLowerCase()) || 
    chat.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
    chat.agent.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Archives</h1>
            <p className="text-muted-foreground mt-1">Manage and export your full history</p>
          </div>
          <Link href="/chats/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <Plus size={18} className="mr-2" />
              New Archive
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title, tag, or agent..." 
            className="pl-10 h-12 bg-card/50 border-border/50 text-base" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid of Chats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-card border border-border/50 p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4 bg-secondary" />
                  <Skeleton className="h-4 w-1/4 bg-secondary" />
                </div>
                <Skeleton className="h-4 w-1/2 bg-secondary" />
              </div>
            ))
          ) : filteredChats.length > 0 ? (
            filteredChats.map(chat => (
              <Link key={chat.id} href={`/chats/${chat.id}`}>
                <div className="group h-full flex flex-col justify-between bg-card hover:bg-secondary/20 border border-border/50 hover:border-primary/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Bot className="w-16 h-16" />
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary capitalize">
                        {chat.agent}
                      </Badge>
                      {formatDistanceToNow(new Date(chat.createdAt!), { addSuffix: true }) === "less than a minute ago" && (
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
                        {chat.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {chat.content}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDistanceToNow(new Date(chat.createdAt!), { addSuffix: true })}
                    </div>
                    <div className="flex gap-1">
                      {chat.tags && chat.tags.length > 0 && (
                        <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] border border-border">
                          {chat.tags[0]}
                          {chat.tags.length > 1 && ` +${chat.tags.length - 1}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No archives found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
