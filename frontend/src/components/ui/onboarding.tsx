"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OnboardingStep {
  title: string
  description: string
  content?: React.ReactNode
}

interface OnboardingProps {
  steps: OnboardingStep[]
  onComplete: (data: any) => void
  onClose: () => void
}

export function Onboarding({ steps, onComplete, onClose }: OnboardingProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [data, setData] = React.useState({})

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(data)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="relative z-50 flex items-center justify-center bg-background p-0">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full overflow-hidden flex flex-col">
        <div className="p-6 sm:p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-text-primary">
                  {steps[currentStep].title}
                </h2>
                <p className="text-text-secondary">
                  {steps[currentStep].description}
                </p>
              </div>

              <div className="min-h-[200px]">
                {steps[currentStep].content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-border flex items-center justify-between bg-surface-elevated">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 w-6 rounded-full transition-colors",
                  i === currentStep ? "bg-accent" : "bg-border"
                )}
              />
            ))}
          </div>

          <div className="flex gap-4">
            {currentStep > 0 && (
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}
            <Button onClick={nextStep}>
              {currentStep === steps.length - 1 ? "Complete" : "Next"}
              {currentStep < steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
