import { useToast as useShadcnToast } from "./use-toast"

export const useToast = () => {
  const { toast, ...rest } = useShadcnToast()

  const toastSuccess = (message: string, description?: string) => {
    toast({
      variant: "success",
      title: message,
      description,
    })
  }

  const toastError = (message: string, description?: string) => {
    toast({
      variant: "error",
      title: message,
      description,
    })
  }

  const toastWarning = (message: string, description?: string) => {
    toast({
      variant: "warning",
      title: message,
      description,
    })
  }

  const toastInfo = (message: string, description?: string) => {
    toast({
      variant: "default",
      title: message,
      description,
    })
  }

  return {
    toast,
    toastSuccess,
    toastError,
    toastWarning,
    toastInfo,
    ...rest
  }
}
