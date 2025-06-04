
"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckSquare, ListChecks, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  guidance?: string; // Tooltip guidance
}

interface ComplianceChecklistWidgetProps {
  title: string;
  items: ChecklistItem[];
  // Example: productId?: string; // To fetch specific checklist for a product
}

export default function ComplianceChecklistWidget({ title, items }: ComplianceChecklistWidgetProps) {
  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary"/> {title}
        </CardTitle>
        <CardDescription>Track your progress towards full compliance for this item/product.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{completedCount} / {totalCount} tasks completed</span>
          </div>
          <Progress value={progressPercentage} className="h-3" indicatorClassName={progressPercentage === 100 ? "bg-accent" : "bg-primary"}/>
        </div>
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/30 hover:bg-muted/50">
              <div className="flex items-center">
                <CheckSquare className={`h-5 w-5 mr-2 ${item.completed ? 'text-accent' : 'text-muted-foreground/50'}`} />
                <span className={`text-sm ${item.completed ? 'text-foreground line-through' : 'text-foreground'}`}>{item.label}</span>
              </div>
              {item.guidance && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs text-xs">
                      <p>{item.guidance}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
