import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateAnalysis } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const analyzeSchema = z.object({
  username: z.string().min(1, "Username is required"),
  followerCount: z.coerce.number().optional().nullable(),
  followingCount: z.coerce.number().optional().nullable(),
  postCount: z.coerce.number().optional().nullable(),
  accountAgeDays: z.coerce.number().optional().nullable(),
  bio: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type AnalyzeFormValues = z.infer<typeof analyzeSchema>;

export default function AnalyzeAccount() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createAnalysis = useCreateAnalysis();

  const form = useForm<AnalyzeFormValues>({
    resolver: zodResolver(analyzeSchema),
    defaultValues: {
      username: "",
      followerCount: null,
      followingCount: null,
      postCount: null,
      accountAgeDays: null,
      bio: "",
      notes: "",
    },
  });

  const onSubmit = (data: AnalyzeFormValues) => {
    createAnalysis.mutate({ data }, {
      onSuccess: (result) => {
        toast({ title: "Analysis complete", description: `Account @${result.username} analyzed.` });
        setLocation(`/analyses/${result.id}`);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to analyze account.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle>Analyze Instagram Account</CardTitle>
          <CardDescription>Submit an account for spam analysis. Metadata is optional but improves accuracy.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. john_doe" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="followerCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Followers</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="followingCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Following</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Count</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountAgeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Age (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio Text</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Account bio..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Analyst Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any internal notes..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={createAnalysis.isPending}>
                {createAnalysis.isPending ? "Analyzing..." : "Run Analysis"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
