import { useListFlaggedAccounts, useUpdateFlaggedAccountStatus, getListFlaggedAccountsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Link } from "wouter";

export default function FlaggedAccounts() {
  const { data: flagged, isLoading } = useListFlaggedAccounts();
  const updateStatus = useUpdateFlaggedAccountStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleUpdateStatus = (id: number, status: 'pending' | 'confirmed_spam' | 'false_positive') => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Status updated", description: `Account status changed to ${status.replace('_', ' ')}` });
        queryClient.invalidateQueries({ queryKey: getListFlaggedAccountsQueryKey() });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed_spam": return <Badge className="bg-destructive hover:bg-destructive/90"><CheckCircle2 className="w-3 h-3 mr-1"/> Confirmed</Badge>;
      case "false_positive": return <Badge className="bg-emerald-500 hover:bg-emerald-600"><XCircle className="w-3 h-3 mr-1"/> False Pos</Badge>;
      default: return <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Flagged Accounts</h1>
        <p className="text-muted-foreground mt-2">Review and verify accounts flagged as potential spam.</p>
      </div>

      <div className="border border-border rounded-md overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Flagged Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-40 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : flagged?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No flagged accounts found.
                </TableCell>
              </TableRow>
            ) : (
              flagged?.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    <Link href={`/analyses/${account.analysisId}`} className="hover:underline hover:text-primary">
                      @{account.username}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono">{account.spamScore}</TableCell>
                  <TableCell>{getStatusBadge(account.status)}</TableCell>
                  <TableCell>{new Date(account.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant={account.status === 'confirmed_spam' ? "default" : "outline"}
                        onClick={() => handleUpdateStatus(account.id, 'confirmed_spam')}
                        disabled={updateStatus.isPending}
                      >
                        Confirm Spam
                      </Button>
                      <Button 
                        size="sm" 
                        variant={account.status === 'false_positive' ? "default" : "outline"}
                        onClick={() => handleUpdateStatus(account.id, 'false_positive')}
                        disabled={updateStatus.isPending}
                      >
                        False Positive
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
