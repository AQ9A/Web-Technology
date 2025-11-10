import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Shield, Search, Globe, Lock, Activity, AlertTriangle, Loader2, Database, Zap, Target, Server, Eye } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/10">
        {/* Animated Background */}
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative container max-w-6xl mx-auto px-4 py-20">
          <div className="text-center space-y-8 mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-in fade-in slide-in-from-top duration-700">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Advanced Reconnaissance Platform</span>
            </div>
            
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-1000">
              <div className="flex items-center justify-center gap-4">
                <Shield className="w-16 h-16 text-primary glow animate-pulse" />
              </div>
              <h1 className="text-6xl md:text-7xl font-bold">
                <span className="gradient-text animate-gradient">{APP_TITLE}</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive domain intelligence gathering with real-time analysis and historical tracking
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
            <Card className="bg-card/40 backdrop-blur-xl border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Subdomain Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automated enumeration using multiple data sources including SecurityTrails
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Port Scanning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real-time detection with Shodan integration for accurate results
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Historical Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track domain changes over time with comprehensive history
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
            <Button size="lg" asChild className="text-lg px-8 py-6 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-105">
              <a href={getLoginUrl()}>
                <Lock className="w-5 h-5 mr-2" />
                Sign In to Start Scanning
              </a>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Professional reconnaissance tool for security researchers
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-xl bg-card/50 sticky top-0 z-50 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">{APP_TITLE}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setLocation('/history')} className="hover:bg-primary/10">
                <Eye className="w-4 h-4 mr-2" />
                Scan History
              </Button>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground hidden md:block">
                  {user.name || user.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-16">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-top duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-primary">Start Your Reconnaissance</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Discover the <span className="gradient-text animate-gradient">Digital Footprint</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive domain intelligence with WHOIS, DNS, subdomains, ports, and historical data
            </p>
          </div>

          {/* Scanner Card */}
          <Card className="border-primary/20 shadow-2xl shadow-primary/10 backdrop-blur-xl bg-card/80 animate-in fade-in slide-in-from-bottom duration-1000">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                Domain Scanner
              </CardTitle>
              <CardDescription className="text-base">
                Enter the target domain to begin comprehensive security analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="domain" className="text-base font-medium">Target Domain</Label>
                  <Input
                    id="domain"
                    type="text"
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={createScan.isPending}
                    className="text-lg h-14 border-primary/20 focus:border-primary/40 bg-background/50"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  disabled={createScan.isPending}
                >
                  {createScan.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting Scan...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Start Reconnaissance
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
            <Card className="bg-card/60 backdrop-blur-xl border-primary/10 hover:border-primary/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-primary" />
                  What We Scan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "WHOIS Information & Domain Registration",
                  "DNS Records (A, AAAA, MX, NS, TXT, CNAME)",
                  "Subdomain Enumeration",
                  "Port Scanning & Service Detection",
                  "Technology Stack Detection",
                  "SSL/TLS Certificate Analysis",
                  "Historical Data Tracking"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 group-hover:scale-150 transition-transform duration-300" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-xl border-yellow-500/20 hover:border-yellow-500/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Authorization Required</p>
                    <p className="text-sm text-muted-foreground">Only scan domains you own or have permission to test</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Activity className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Scan Duration</p>
                    <p className="text-sm text-muted-foreground">Scans may take 1-3 minutes depending on the target</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Privacy & Security</p>
                    <p className="text-sm text-muted-foreground">All scan results are private and stored securely</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20 bg-card/30 backdrop-blur-xl">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                © 2025 {APP_TITLE}. Advanced Reconnaissance Platform.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="hover:text-primary transition-colors cursor-pointer">Documentation</span>
              <span className="hover:text-primary transition-colors cursor-pointer">API</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
