import { useState, useCallback } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { importFloorplan, ImportResult, ValidationResult } from '../services/import';
import { addToImportHistory } from '../services/import/history';
import { useToast } from '../hooks/use-toast';
import { useProject } from '../hooks/useProject';
import { useDialogStore } from '../stores/dialogStore';
import { saveProject } from '../services/storage/projectStorage';

export interface UseImportReturn {
  importFile: (file: File, options?: ImportOptions) => Promise<ImportResult>;
  isImporting: boolean;
  progress: number;
  error: string | null;
  validationResult: ValidationResult | null;
  reset: () => void;
}

export interface ImportOptions {
  replaceCurrent?: boolean;
  generateNewIds?: boolean;
}

export function useImport(): UseImportReturn {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const { loadFloorplan } = useFloorplanStore();
  // const { saveProject } = useProject(); // useProject does not export saveProject
  const { closeDialog } = useDialogStore();
  const { toast } = useToast();

  const reset = useCallback(() => {
    setIsImporting(false);
    setProgress(0);
    setError(null);
    setValidationResult(null);
  }, []);

  const importFile = useCallback(async (file: File, options: ImportOptions = {}): Promise<ImportResult> => {
    setIsImporting(true);
    setProgress(10); // Started
    setError(null);
    setValidationResult(null);

    try {
      // Step 1: Parse and validate file
      setProgress(30); // Reading
      const result = await importFloorplan(file, { generateNewIds: options.generateNewIds });

      setProgress(60); // Parsed

      if (!result.success || !result.floorplan) {
        const errorMsg = result.errors && result.errors.length > 0
          ? result.errors[0]
          : 'Failed to import floorplan';
        setError(errorMsg);

        // Expose validation result if available
        if (result.errors || result.warnings) {
          setValidationResult({
            valid: false,
            errors: result.errors || [],
            warnings: result.warnings || []
          });
        }

        setIsImporting(false);
        return result;
      }

      // Step 2: Apply to store
      setProgress(80); // Applying

      // If we are replacing the current project, we update the store
      // The calling component is responsible for confirming with the user first
      loadFloorplan(result.floorplan);

      // Auto-save the imported project
      await saveProject(result.floorplan);

      // Add to import history
      await addToImportHistory(file.name, file.size);

      setProgress(100); // Done

      toast({
        title: "Import Successful",
        description: `Imported "${result.floorplan.name || 'Floorplan'}" successfully.`,
        variant: "default",
      });

      // Close the dialog on success
      closeDialog();

      setIsImporting(false);
      return result;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error during import';
      setError(errorMsg);
      setIsImporting(false);

      toast({
        title: "Import Failed",
        description: errorMsg,
        variant: "destructive",
      });

      return {
        success: false,
        errors: [errorMsg]
      };
    }
  }, [loadFloorplan, saveProject, toast, closeDialog]);

  return {
    importFile,
    isImporting,
    progress,
    error,
    validationResult,
    reset
  };
}
