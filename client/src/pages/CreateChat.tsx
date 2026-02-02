import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertChatSchema } from "@shared/schema";
import { useCreateChat } from "@/hooks/use-chats";
import { AppLayout } from "@/components/AppLayout";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { z } from "zod";

// Enhance schema for form validation
const formSchema = insertChatSchema.extend({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  agent: z.string().min(1, "Please select an agent"),
  tagsStr: z.string().optional(), // Helper for comma-separated input
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateChat() {
  const [, setLocation] = useLocation();
  const { mutate, isPending } = useCreateChat();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      agent: "chatgpt",
      tags: [],
      tagsStr: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // Process tags string into array
    const tags = data.tagsStr 
      ? data.tagsStr.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    mutate(
      { ...data, tags },
      {
        onSuccess: () => setLocation("/dashboard"),
      }
    );
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">New Archive</h1>
            <p className="text-sm text-muted-foreground">Store a conversation for safekeeping</p>
          </div>
        </div>

        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. React Query Setup Guide" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select an agent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="chatgpt">ChatGPT</SelectItem>
                          <SelectItem value="claude">Claude</SelectItem>
                          <SelectItem value="gemini">Gemini</SelectItem>
                          <SelectItem value="llama">Llama</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tagsStr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="coding, react, frontend (comma separated)" className="bg-background/50" {...field} />
                    </FormControl>
                    <FormDescription>Used for Obsidian frontmatter and searching</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conversation Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Paste your chat history here..." 
                        className="min-h-[300px] font-mono text-sm bg-background/50 resize-y" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setLocation("/dashboard")}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Archive
                    </>
                  )}
                </Button>
              </div>

            </form>
          </Form>
        </Card>
      </div>
    </AppLayout>
  );
}
