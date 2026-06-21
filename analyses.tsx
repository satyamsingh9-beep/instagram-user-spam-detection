import { useState } from "react";
import { useListAnalyses, useDeleteAnalysis, getListAnalysesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Trash2, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function AnalysisHistory() {
  const [search, setSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<string>("all");
  
  const { data: analyses, isLoading } = useListAnalyses({ 
    verdict: verdictFilter !== "all" ? verdictFilter as any : undefined 
  });
  
  const deleteAnalysis = useDeleteAnalysis();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this analysis?")) {
      deleteAnalysis.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Deleted", description: "Analysis removed." });
          queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() });
        }
      });
    }
  };

  const filteredAnalyses = analyses?.filter(a => a.username.toLowerCase().includes(search.toLowerCase()));

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "spam": return "bg-destructive text-destructive-foreground";
      case "not_spam": return "bg-emerald-500 text-white";
      case "uncertain": return "bg-amber-500 text-white";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search username..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9"
          />
        </div>
        <Select value={verdictFilter} onValueChange={setVerdictFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by verdict" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Verdicts</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
            <SelectItem value="not_spam">Not Spam</SelectItem>
            <SelectItem value="uncertain">Uncertain</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-md overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Verdict</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredAnalyses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No analyses found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAnalyses?.map((analysis) => (
                <TableRow key={analysis.id}>
                  <TableCell className="font-medium">@{analysis.username}</TableCell>
                  <TableCell>{new Date(analysis.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getVerdictColor(analysis.verdict)}>
                      {analysis.verdict.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-mono ${analysis.spamScore >= 80 ? 'text-destructive font-bold' : ''}`}>
                      {analysis.spamScore}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/analyses/${analysis.id}`}>
                        <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(analysis.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
