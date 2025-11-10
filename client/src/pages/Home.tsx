import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Shield, Search, Globe, Lock, Activity, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [domain, setDomain] = useState("");
  
  const createScan = trpc.scan.create.useMutation({
    onSuccess: (data) => {
      toast.success("Scan started successfully!");
      setLocation(`/scan/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to start scan: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }
    
    // Remove protocol if present
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    createScan.mutate({ domain: cleanDomain });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background cyber-grid">
        <div className="container max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <Shield className="w-20 h-20 mx-auto text-primary glow" />
            <h1 className="text-5xl font-bold gradient-text glow-text">
              {APP_TITLE}
            </h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive reconnaissance and penetration testing tool for bug hunters
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <Globe className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Subdomain Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Discover all subdomains associated with your target
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <Activity className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Port Scanning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Identify open ports and running services
                </p>
              </CardContent>
            </Card>
            

          </div>

          <Button size="lg" asChild className="glow">
            <a href={getLoginUrl()}>
              <Lock className="w-4 h-4 mr-2" />
              Sign In to Start Scanning
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">{APP_TITLE}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setLocation('/history')}>
                Scan History
              </Button>
              <span className="text-sm text-muted-foreground">
                {user.name || user.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Start Your Reconnaissance</h2>
            <p className="text-lg text-muted-foreground">
              Enter a domain to begin comprehensive security analysis
            </p>
          </div>

          <Card className="border-primary/20 glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Domain Scanner
              </CardTitle>
              <CardDescription>
                Enter the target domain (e.g., example.com)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Target Domain</Label>
                  <Input
                    id="domain"
                    type="text"
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={createScan.isPending}
                    className="text-lg"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={createScan.isPending}
                >
                  {createScan.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Scan...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Start Reconnaissance
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">What We Scan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>WHOIS Information & Domain Registration</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>DNS Records (A, AAAA, MX, NS, TXT, CNAME)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Subdomain Enumeration</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Port Scanning & Service Detection</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Technology Stack Detection</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>SSL/TLS Certificate Analysis</span>
                </div>

              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">Important Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Only scan domains you own or have permission to test</span>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Scans may take 1-3 minutes depending on the target</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>All scan results are private and stored securely</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
