"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Check, Info, TriangleAlert, CircleX } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3">
              {variant === "success" && <Check className="h-5 w-5 text-green-600 dark:text-green-400" />}
              {variant === "warning" && <TriangleAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
              {(variant === "error" || variant === "destructive") && <CircleX className="h-5 w-5 text-red-600 dark:text-red-400" />}
              {variant === "default" && <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />}

              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
