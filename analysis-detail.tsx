import { useGetAnalysis } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalysisDetail() {
  const { id } = useParams();
  const { data: analysis, isLoading } = useGetAnalysis(Number(id), { query: { enabled: !!id } });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!analysis) {
    return <div>Analysis not found.</div>;
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "spam": return "bg-destructive text-destructive-foreground";
      case "not_spam": return "bg-emerald-500 text-white";
      case "uncertain": return "bg-amber-500 text-white";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/analyses">
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">@{analysis.username}</h1>
        <Badge className={`text-sm px-3 py-1 ${getVerdictColor(analysis.verdict)}`}>
          {analysis.verdict.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Spam Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.indicators.length > 0 ? (
              <ul className="space-y-3">
                {analysis.indicators.map((ind, i) => (
                  <li key={i} className="flex items-start gap-3 bg-secondary/50 p-3 rounded-md border border-border">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No strong spam indicators detected.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className={`text-6xl font-bold font-mono tracking-tighter ${analysis.spamScore >= 80 ? 'text-destructive' : 'text-emerald-500'}`}>
              {analysis.spamScore}
            </div>
            <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest font-semibold">/ 100 Risk Score</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Account Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-secondary/30 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Followers</p>
                <p className="text-2xl font-mono">{analysis.followerCount ?? "N/A"}</p>
              </div>
              <div className="bg-secondary/30 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Following</p>
                <p className="text-2xl font-mono">{analysis.followingCount ?? "N/A"}</p>
              </div>
              <div className="bg-secondary/30 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Posts</p>
                <p className="text-2xl font-mono">{analysis.postCount ?? "N/A"}</p>
              </div>
              <div className="bg-secondary/30 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Account Age</p>
                <p className="text-2xl font-mono">{analysis.accountAgeDays !== null ? `${analysis.accountAgeDays}d` : "N/A"}</p>
              </div>
            </div>

            {analysis.bio && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Bio</h4>
                <div className="p-4 bg-muted/50 rounded-md border border-border whitespace-pre-wrap font-mono text-sm">
                  {analysis.bio}
                </div>
              </div>
            )}

            {analysis.notes && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Analyst Notes</h4>
                <div className="p-4 bg-muted/50 rounded-md border border-border whitespace-pre-wrap font-mono text-sm">
                  {analysis.notes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
