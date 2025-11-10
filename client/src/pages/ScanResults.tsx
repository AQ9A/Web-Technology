import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Shield, ArrowLeft, Loader2, CheckCircle2, XCircle, AlertTriangle, Server, Globe, Lock, Bug, Trash2, Clock, Activity, Code, FileText } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function ScanResults() {
  const { user, loading: authLoading } = useAuth();
  const [, params] = useRoute("/scan/:id");
  const [, setLocation] = useLocation();
  const scanId = params?.id ? parseInt(params.id) : 0;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = trpc.scan.delete.useMutation({
    onSuccess: () => {
      toast.success('Scan deleted successfully');
      setLocation('/history');
    },
    onError: (error) => {
      toast.error(`Failed to delete scan: ${error.message}`);
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate({ scanId });
  };

  const { data: results, isLoading, refetch } = trpc.scan.getResults.useQuery(
    { scanId },
    { 
      enabled: !!scanId && !!user,
      refetchInterval: (query) => {
        // Refetch every 2 seconds if scan is still running
        const data = query.state.data;
        if (data?.scan?.status === 'running' || data?.scan?.status === 'pending') {
          return 2000;
        }
        return false;
      }
    }
  );

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/');
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!results || !results.scan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardHeader>
            <CardTitle>Scan Not Found</CardTitle>
            <CardDescription>The requested scan does not exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { scan, subdomains, ports, technologies, dnsRecords, whoisInfo, sslCertificate, vulnerabilities, historicalDns, historicalWhois, historicalIps } = results;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running': return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">{APP_TITLE}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Scan
              </Button>
              <Button variant="ghost" onClick={() => setLocation('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="space-y-6">
          {/* Scan Header */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {getStatusIcon(scan.status)}
                    {scan.domain}
                  </CardTitle>
                  <CardDescription>
                    Scan ID: {scan.id} • Started: {new Date(scan.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                <Badge variant={scan.status === 'completed' ? 'default' : 'secondary'}>
                  {scan.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            {(scan.status === 'running' || scan.status === 'pending') && (
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Scanning Progress</span>
                    <span>{scan.progress}%</span>
                  </div>
                  <Progress value={scan.progress} className="h-2" />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Results Tabs */}
          {scan.status === 'completed' && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="subdomains">Subdomains</TabsTrigger>
                <TabsTrigger value="ports">Ports</TabsTrigger>
                <TabsTrigger value="tech">Technologies</TabsTrigger>
                <TabsTrigger value="dns">DNS</TabsTrigger>
                <TabsTrigger value="ssl">SSL/TLS</TabsTrigger>
                <TabsTrigger value="vulns">Vulnerabilities</TabsTrigger>
                <TabsTrigger value="historical">Historical</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Subdomains
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{subdomains.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Open Ports
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{ports.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Technologies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{technologies.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Vulnerabilities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{vulnerabilities.length}</div>
                    </CardContent>
                  </Card>
                </div>

                {whoisInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        WHOIS Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {whoisInfo.registrar && (
                        <div className="grid grid-cols-4 gap-2">
                          <span className="text-sm font-medium">Registrar:</span>
                          <span className="text-sm col-span-3">{whoisInfo.registrar}</span>
                        </div>
                      )}
                      {whoisInfo.creationDate && (
                        <div className="grid grid-cols-4 gap-2">
                          <span className="text-sm font-medium">Created:</span>
                          <span className="text-sm col-span-3">{whoisInfo.creationDate}</span>
                        </div>
                      )}
                      {whoisInfo.expirationDate && (
                        <div className="grid grid-cols-4 gap-2">
                          <span className="text-sm font-medium">Expires:</span>
                          <span className="text-sm col-span-3">{whoisInfo.expirationDate}</span>
                        </div>
                      )}
                      {whoisInfo.nameServers && (
                        <div className="grid grid-cols-4 gap-2">
                          <span className="text-sm font-medium">Name Servers:</span>
                          <span className="text-sm col-span-3">{whoisInfo.nameServers}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Subdomains Tab */}
              <TabsContent value="subdomains">
                <Card>
                  <CardHeader>
                    <CardTitle>Discovered Subdomains</CardTitle>
                    <CardDescription>Found {subdomains.length} subdomains</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subdomains.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subdomain</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subdomains.map((sub) => (
                            <TableRow key={sub.id}>
                              <TableCell className="font-mono">{sub.subdomain}</TableCell>
                              <TableCell className="font-mono">{sub.ipAddress || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={sub.isAlive ? 'default' : 'secondary'}>
                                  {sub.isAlive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No subdomains found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Ports Tab */}
              <TabsContent value="ports">
                <Card>
                  <CardHeader>
                    <CardTitle>Open Ports</CardTitle>
                    <CardDescription>
                      Found {ports.length} open ports. Only ports that accept TCP connections are shown (verified with real connection tests).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ports.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Port</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Version</TableHead>
                            <TableHead>State</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ports.map((port) => (
                            <TableRow key={port.id}>
                              <TableCell className="font-mono">{port.port}</TableCell>
                              <TableCell>{port.service || 'Unknown'}</TableCell>
                              <TableCell className="font-mono text-sm">{port.version || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant="default">{port.state}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No open ports detected</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Technologies Tab */}
              <TabsContent value="tech">
                <Card>
                  <CardHeader>
                    <CardTitle>Detected Technologies</CardTitle>
                    <CardDescription>Found {technologies.length} technologies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {technologies.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Technology</TableHead>
                            <TableHead>Version</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Confidence</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {technologies.map((tech) => (
                            <TableRow key={tech.id}>
                              <TableCell className="font-medium">{tech.name}</TableCell>
                              <TableCell className="font-mono">{tech.version || 'N/A'}</TableCell>
                              <TableCell>{tech.category || 'Unknown'}</TableCell>
                              <TableCell>
                                {tech.confidence ? `${tech.confidence}%` : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No technologies detected</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DNS Tab */}
              <TabsContent value="dns">
                <Card>
                  <CardHeader>
                    <CardTitle>DNS Records</CardTitle>
                    <CardDescription>Found {dnsRecords.length} DNS records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dnsRecords.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dnsRecords.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                <Badge variant="outline">{record.recordType}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{record.value}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No DNS records found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SSL Tab */}
              <TabsContent value="ssl">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      SSL/TLS Certificate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sslCertificate ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-2">
                          <span className="text-sm font-medium">Issuer:</span>
                          <span className="text-sm col-span-3">{sslCertificate.issuer}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <span className="text-sm font-medium">Subject:</span>
                          <span className="text-sm col-span-3">{sslCertificate.subject}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <span className="text-sm font-medium">Valid From:</span>
                          <span className="text-sm col-span-3">{sslCertificate.validFrom}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <span className="text-sm font-medium">Valid To:</span>
                          <span className="text-sm col-span-3">{sslCertificate.validTo}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <span className="text-sm font-medium">Serial Number:</span>
                          <span className="text-sm col-span-3 font-mono">{sslCertificate.serialNumber}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <span className="text-sm font-medium">Signature Algorithm:</span>
                          <span className="text-sm col-span-3">{sslCertificate.signatureAlgorithm}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <span className="text-sm font-medium">Status:</span>
                          <span className="text-sm col-span-3">
                            <Badge variant={sslCertificate.isValid ? 'default' : 'destructive'}>
                              {sslCertificate.isValid ? 'Valid' : 'Invalid/Expired'}
                            </Badge>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No SSL certificate information available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Vulnerabilities Tab */}
              <TabsContent value="vulns">
                <Card>
                  <CardHeader>
                    <CardTitle>Potential Vulnerabilities</CardTitle>
                    <CardDescription>Found {vulnerabilities.length} potential issues</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {vulnerabilities.length > 0 ? (
                      <div className="space-y-4">
                        {vulnerabilities.map((vuln) => (
                          <Card key={vuln.id} className="border-l-4" style={{
                            borderLeftColor: vuln.severity === 'critical' || vuln.severity === 'high' ? 'hsl(var(--destructive))' : 
                                           vuln.severity === 'medium' ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
                          }}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-base">{vuln.title}</CardTitle>
                                <Badge variant={getSeverityColor(vuln.severity)}>
                                  {vuln.severity.toUpperCase()}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div>
                                <span className="text-sm font-medium">Description:</span>
                                <p className="text-sm text-muted-foreground mt-1">{vuln.description}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium">Recommendation:</span>
                                <p className="text-sm text-muted-foreground mt-1">{vuln.recommendation}</p>
                              </div>
                              {vuln.affectedUrl && (
                                <div>
                                  <span className="text-sm font-medium">Affected URL:</span>
                                  <p className="text-sm text-muted-foreground font-mono mt-1">{vuln.affectedUrl}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No vulnerabilities detected</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Historical Data Tab */}
              <TabsContent value="historical" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Historical DNS Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{historicalDns?.length || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Historical WHOIS</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{historicalWhois?.length || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Historical IPs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{historicalIps?.length || 0}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Historical DNS Records */}
                <Card>
                  <CardHeader>
                    <CardTitle>Historical DNS Records</CardTitle>
                    <CardDescription>DNS record changes over time from SecurityTrails</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historicalDns && historicalDns.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>First Seen</TableHead>
                            <TableHead>Last Seen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historicalDns.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                <Badge variant="outline">{record.recordType}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{record.value}</TableCell>
                              <TableCell className="text-sm">{record.firstSeen || 'N/A'}</TableCell>
                              <TableCell className="text-sm">{record.lastSeen || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No historical DNS data available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Historical IPs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Historical IP Addresses</CardTitle>
                    <CardDescription>IP address changes over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historicalIps && historicalIps.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>IP Address</TableHead>
                            <TableHead>First Seen</TableHead>
                            <TableHead>Last Seen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historicalIps.map((ip) => (
                            <TableRow key={ip.id}>
                              <TableCell className="font-mono">{ip.ipAddress}</TableCell>
                              <TableCell className="text-sm">{ip.firstSeen || 'N/A'}</TableCell>
                              <TableCell className="text-sm">{ip.lastSeen || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No historical IP data available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Historical WHOIS */}
                <Card>
                  <CardHeader>
                    <CardTitle>Historical WHOIS Data</CardTitle>
                    <CardDescription>WHOIS information changes over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historicalWhois && historicalWhois.length > 0 ? (
                      <div className="space-y-4">
                        {historicalWhois.map((whois) => (
                          <Card key={whois.id} className="bg-muted/50">
                            <CardContent className="pt-6 space-y-2">
                              {whois.registrar && (
                                <div className="grid grid-cols-4 gap-2">
                                  <span className="text-sm font-medium">Registrar:</span>
                                  <span className="text-sm col-span-3">{whois.registrar}</span>
                                </div>
                              )}
                              {whois.created && (
                                <div className="grid grid-cols-4 gap-2">
                                  <span className="text-sm font-medium">Created:</span>
                                  <span className="text-sm col-span-3">{whois.created}</span>
                                </div>
                              )}
                              {whois.expires && (
                                <div className="grid grid-cols-4 gap-2">
                                  <span className="text-sm font-medium">Expires:</span>
                                  <span className="text-sm col-span-3">{whois.expires}</span>
                                </div>
                              )}
                              {whois.registrantName && (
                                <div className="grid grid-cols-4 gap-2">
                                  <span className="text-sm font-medium">Registrant:</span>
                                  <span className="text-sm col-span-3">{whois.registrantName}</span>
                                </div>
                              )}
                              {whois.registrantOrg && (
                                <div className="grid grid-cols-4 gap-2">
                                  <span className="text-sm font-medium">Organization:</span>
                                  <span className="text-sm col-span-3">{whois.registrantOrg}</span>
                                </div>
                              )}
                              {whois.nameServers && (
                                <div className="grid grid-cols-4 gap-2">
                                  <span className="text-sm font-medium">Name Servers:</span>
                                  <span className="text-sm col-span-3">{whois.nameServers}</span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No historical WHOIS data available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {scan.status === 'failed' && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="w-5 h-5" />
                  Scan Failed
                </CardTitle>
                <CardDescription>
                  The scan encountered an error and could not be completed.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this scan and all its results. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
