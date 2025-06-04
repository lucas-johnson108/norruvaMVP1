import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code } from "lucide-react";

interface ApiEndpointDocProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: { name: string; type: string; description: string; required?: boolean }[];
  responseExample: string;
}

export default function ApiEndpointDoc({ method, path, description, parameters, responseExample }: ApiEndpointDocProps) {
  const getMethodColor = () => {
    switch (method) {
      case 'GET': return 'bg-sky-600 hover:bg-sky-700';
      case 'POST': return 'bg-green-600 hover:bg-green-700';
      case 'PUT': return 'bg-orange-500 hover:bg-orange-600';
      case 'DELETE': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Badge className={`text-sm font-mono px-3 py-1 text-white ${getMethodColor()}`}>{method}</Badge>
          <CardTitle className="font-code text-xl text-primary">{path}</CardTitle>
        </div>
        <CardDescription className="mt-2 text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {parameters && parameters.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2 font-headline">Parameters</h4>
            <ul className="space-y-2">
              {parameters.map(param => (
                <li key={param.name} className="p-3 border rounded-md bg-secondary/30">
                  <span className="font-mono font-semibold text-primary">{param.name}</span>
                  <Badge variant="outline" className="ml-2 text-xs">{param.type}</Badge>
                  {param.required && <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>}
                  <p className="text-sm text-muted-foreground mt-1">{param.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="text-lg font-semibold mb-2 font-headline flex items-center gap-2">
            <Code className="h-5 w-5 text-accent" /> Example Response (200 OK)
          </h4>
          <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm font-code shadow-inner">
            <code>
              {JSON.stringify(JSON.parse(responseExample), null, 2)}
            </code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
