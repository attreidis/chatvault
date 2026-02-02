import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { BrainCircuit, FileDown, Shield, Database, ArrowRight } from "lucide-react";

export default function Landing() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    // Redirect logic handled in App.tsx or user can click Dashboard
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] opacity-50 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] opacity-40" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl tracking-tight">ChatVault</span>
        </div>
        <a href="/api/login">
          <Button variant="outline" className="border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors">
            Login
          </Button>
        </a>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs font-medium text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Secure storage for your AI conversations
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Your AI Second Brain, <br />
          <span className="text-primary">Archived & Obsidian Ready.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          Stop losing valuable insights in chat history. Store your ChatGPT and Claude conversations centrally and export them directly to your Obsidian vault.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <a href="/api/login">
            <Button size="lg" className="h-12 px-8 text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1">
              Start Archiving Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>
          <a href="#features">
            <Button size="lg" variant="secondary" className="h-12 px-8 text-base bg-secondary/50 border border-border/50 hover:bg-secondary">
              How it Works
            </Button>
          </a>
        </div>

        {/* Hero Image / Graphic */}
        <div className="mt-20 relative w-full max-w-5xl rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          {/* Mockup UI */}
          <div className="p-4 border-b border-border/30 flex items-center gap-4 bg-black/20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>
            <div className="h-6 w-64 bg-white/5 rounded-md" />
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
             <div className="space-y-4">
               <div className="h-4 w-3/4 bg-white/10 rounded" />
               <div className="h-4 w-1/2 bg-white/10 rounded" />
               <div className="h-24 w-full bg-white/5 rounded-lg border border-white/5 p-4" />
             </div>
             <div className="space-y-4 opacity-50">
               <div className="h-4 w-2/3 bg-white/10 rounded" />
               <div className="h-4 w-full bg-white/10 rounded" />
               <div className="h-4 w-5/6 bg-white/10 rounded" />
             </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="py-24 px-6 relative z-10 border-t border-border/30 bg-black/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Database className="w-8 h-8 text-primary" />}
            title="Centralized Archive"
            description="Keep all your AI conversations from different agents in one secure, searchable place."
          />
          <FeatureCard 
            icon={<FileDown className="w-8 h-8 text-blue-500" />}
            title="Obsidian Export"
            description="One-click export to Markdown with proper frontmatter, ready for your Second Brain."
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-green-500" />}
            title="Private & Secure"
            description="Your data is yours. Simple, secure storage with no tracking or data mining."
          />
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/30">
        <p>© 2024 ChatVault. Built for the future of thought.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors group">
      <div className="mb-4 p-3 bg-secondary/50 rounded-xl w-fit group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
