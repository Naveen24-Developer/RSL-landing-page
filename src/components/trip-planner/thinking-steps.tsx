"use client";

import { useState } from "react";
import { ThinkingStep } from "@/types/chat";
import { Card } from "@/components/ui/card";
import { Check, ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ThinkingStepsProps {
  steps: ThinkingStep[];
  isStreaming?: boolean;
}

export function ThinkingSteps({ steps, isStreaming = false }: ThinkingStepsProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (steps.length === 0 && !isStreaming) {
    return null;
  }

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;

  return (
    <Card className="mb-4 overflow-hidden border-primary/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-primary/5 px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">DeepDive Thinking</h3>
                {isStreaming ? (
                  <p className="text-xs text-muted-foreground">Analyzing your request...</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {completedSteps} of {totalSteps} steps completed
                  </p>
                )}
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-3">
            {steps.map((step, index) => (
              <ThinkingStepItem key={step.id} step={step} index={index + 1} />
            ))}
            
            {isStreaming && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Processing...</span>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface ThinkingStepItemProps {
  step: ThinkingStep;
  index: number;
}

function ThinkingStepItem({ step, index }: ThinkingStepItemProps) {
  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
    }
  };

  const getStatusColor = () => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'in_progress':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
        {getStatusIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`font-medium text-sm ${getStatusColor()}`}>
            {step.title}
          </h4>
        </div>
        {step.description && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {step.description}
          </p>
        )}
        {step.error && (
          <p className="text-sm text-red-600 mt-1">
            Error: {step.error}
          </p>
        )}
      </div>
    </div>
  );
}
