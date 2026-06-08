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
  onComplete: () => void
  onClose: () => void
  error?: string | null
}

export function Onboarding({ steps, onComplete, onClose: _onClose, error }: OnboardingProps) {
  const [currentStep, setCurrentStep] = React.useState(0)


  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
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
        <div className="p-4 sm:p-6 flex-1">
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

              <div className="min-h-45">
                {steps[currentStep].content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-3 border-t border-border flex flex-col gap-2 bg-surface-elevated">
          {error && (
            <p className="text-sm text-error text-center w-full">{error}</p>
          )}
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 w-4 rounded-full transition-colors",
                    i === currentStep ? "bg-accent" : "bg-border"
                  )}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
              <Button
                onClick={nextStep}
                className={currentStep === steps.length - 1 ? "bg-accent hover:bg-accent-glow text-white" : ""}
              >
                {currentStep === steps.length - 1 ? "Sign Up" : "Next"}
                {currentStep < steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
