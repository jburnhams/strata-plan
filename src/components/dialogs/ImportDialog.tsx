import React, { useRef, useState } from 'react';
import { useDialogStore } from '../../stores/dialogStore';
import { useImport } from '../../hooks/useImport';
import { getImportHistory, ImportHistoryItem } from '../../services/import/history';
import { SAMPLE_PROJECTS, loadSampleProject } from '../../services/import/samples';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Upload, FileJson, AlertTriangle, AlertCircle, Check, Loader2, X, Clock, Layout } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Progress } from '../../components/ui/progress';
import { useEffect } from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useProject } from '../../hooks/useProject';
import { useToast } from '../../hooks/use-toast';

export function ImportDialog() {
  const { activeDialog, closeDialog } = useDialogStore();
  const { importFile, isImporting, progress, error, validationResult, reset } = useImport();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generateNewIds, setGenerateNewIds] = useState(false);
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const { loadFloorplan } = useFloorplanStore();
  const { saveProject } = useProject();
  const { toast } = useToast();

  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = activeDialog === 'import-project';

  useEffect(() => {
    if (isOpen) {
      getImportHistory().then(setHistory);
    }
  }, [isOpen]);

  const handleClose = () => {
    closeDialog('import-project');
    // Small delay to let animation finish before resetting state
    setTimeout(() => {
      setSelectedFile(null);
      reset();
      setGenerateNewIds(false);
    }, 300);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Reset previous errors/results
    reset();

    // Check extension
    const name = file.name.toLowerCase();
    if (name.endsWith('.json') || name.endsWith('.gltf') || name.endsWith('.glb')) {
      setSelectedFile(file);
    } else {
      // Could show an error here about invalid file type
      // But for now we just rely on the Import logic to catch it or the UI to show it's unsupported
      setSelectedFile(file);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    await importFile(selectedFile, { generateNewIds });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    reset();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleLoadSample = async (filename: string, name: string) => {
    setIsLoadingSample(true);
    try {
      const floorplan = await loadSampleProject(filename);

      // If generate new IDs is preferred, we could do it here,
      // but for samples it's probably better to keep as is unless conflicts arise
      // or we can reuse the logic from jsonImport if we exposed it.
      // For now, let's just load it.

      // Update store
      loadFloorplan(floorplan);
      await saveProject(floorplan);

      toast({
        title: "Sample Loaded",
        description: `Loaded "${name}" successfully.`,
      });

      handleClose();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load sample project",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Project</DialogTitle>
          <DialogDescription>
            Import a floorplan from a file or start with a sample.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="samples">Samples</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="py-4">
            <div className="grid gap-4">
              {!selectedFile ? (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
                    dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={onButtonClick}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload file drop zone"
                >
                  <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".json,.gltf,.glb"
                    onChange={handleChange}
                  />
                  <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium mb-1">
                    Drag and drop your file here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Supported formats: .json
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/40">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <FileJson className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                {!isImporting && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                )}
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Importing...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {validationResult && !validationResult.valid && (
                <div className="space-y-2">
                   <p className="text-sm font-medium flex items-center gap-2 text-destructive">
                     <AlertTriangle className="h-4 w-4" /> Validation Errors
                   </p>
                   <ul className="text-xs list-disc list-inside text-destructive space-y-1 max-h-32 overflow-y-auto p-2 border border-destructive/20 rounded bg-destructive/5">
                     {validationResult.errors.map((err, i) => (
                       <li key={i}>{err}</li>
                     ))}
                   </ul>
                </div>
              )}

              {!isImporting && !error && (!validationResult || validationResult.valid) && (
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="new-ids"
                    checked={generateNewIds}
                    onCheckedChange={(c) => setGenerateNewIds(!!c)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="new-ids"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Generate new IDs
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Create a copy with new identifiers (recommended if importing into an existing project list)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
          <DialogFooter className="sm:justify-between mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isImporting}
              >
                Cancel
              </Button>

              {selectedFile && (
                 <Button
                  type="button"
                  onClick={handleImport}
                  disabled={isImporting || !!error}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>Import Project</>
                  )}
                </Button>
              )}
          </DialogFooter>
          </TabsContent>

          <TabsContent value="history" className="py-4">
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No recent imports</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileJson className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium truncate">{item.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.importedAt).toLocaleDateString()} • {(item.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground italic">
                        Cannot re-import
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="samples" className="py-4">
            <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
              {SAMPLE_PROJECTS.map((sample) => (
                <div key={sample.id} className="border rounded-lg p-4 hover:border-primary/50 hover:bg-muted/30 transition-all">
                   <div className="flex items-start gap-4">
                     <div className="h-12 w-12 bg-primary/10 rounded flex items-center justify-center shrink-0">
                       <Layout className="h-6 w-6 text-primary" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-semibold">{sample.name}</h4>
                       <p className="text-xs text-muted-foreground mt-1 mb-3">
                         {sample.description}
                       </p>
                       <Button
                         size="sm"
                         variant="outline"
                         className="w-full sm:w-auto h-8 text-xs"
                         onClick={() => handleLoadSample(sample.filename, sample.name)}
                         disabled={isLoadingSample}
                       >
                         {isLoadingSample ? (
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                         ) : null}
                         Load Template
                       </Button>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
