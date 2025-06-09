"use-client";

import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { FileIcon, Loader2Icon, Upload, X, Download, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { FileWithPreview } from "@/types/file";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { getAiResult } from "@/actions/getAiResult";
import { Progress } from "./ui/progress";

interface FileUploadProps {
  value?: FileWithPreview[];
  onChange?: (files: FileWithPreview[]) => void;
  onRemove?: (file: FileWithPreview) => void;
  maxFiles?: number;
  maxSize?: number; //mb
  accept?: {
    [key: string]: string[];
  };
  disabled?: boolean;
  className?: string;
}

// Fungsi untuk mengkompresi gambar
const compressImage = async (file: File): Promise<File> => {
  // Jika bukan gambar, kembalikan file asli
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Hitung dimensi baru dengan mempertahankan aspek ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200; // Maksimum dimensi

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        // Gambar ke canvas dengan dimensi baru
        ctx.drawImage(img, 0, 0, width, height);

        // Konversi ke blob dengan kualitas 0.8
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          },
          'image/jpeg',
          0.8
        );
      };
    };
  });
};

const FileUpload = ({
  value = [],
  onChange,
  onRemove,
  maxFiles = 1,
  maxSize = 20,
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    "application/pdf": [".pdf"],
  },
  disabled = false,
}: FileUploadProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>(value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [aiResult, setAiResult] = useState<string>("");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState<string>("");

  const createFilePreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        resolve(null); // No preview for non-image files
      }
    });
  };

  const simulateUpload = (fileWithPreview: FileWithPreview) => {
    const interval = setInterval(() => {
      let progress = 0;
      progress += 5; // Simulate progress
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file === fileWithPreview.file
            ? { ...f, progress: Math.min(progress, 100) }
            : f
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.file === fileWithPreview.file ? { ...f, success: true } : f
          )
        );
      }
    }, 100);
  };

  const simulateAnalysis = () => {
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError("");
      const newFiles: FileWithPreview[] = [];

      for (const file of acceptedFiles) {
        if (files.length + newFiles.length >= maxFiles) {
          break;
        }

        try {
          // Kompresi file jika itu adalah gambar
          const processedFile = await compressImage(file);
          
          // Cek ukuran file setelah kompresi
          if (processedFile.size > maxSize * 1024 * 1024) {
            setError(`File ${file.name} terlalu besar. Maksimum ukuran file adalah ${maxSize}MB`);
            continue;
          }

          const preview = await createFilePreview(processedFile);

          const fileWithPreview: FileWithPreview = {
            file: processedFile,
            preview,
            progress: 0,
          };

          newFiles.push(fileWithPreview);
          simulateUpload(fileWithPreview);
        } catch (err) {
          console.error("Error processing file:", err);
          setError(`Gagal memproses file ${file.name}. Silakan coba lagi.`);
        }
      }

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
    },
    [files, maxFiles, onChange]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: true,
    disabled: disabled || files.length >= maxFiles,
  });

  const handleRemove = useCallback(
    (fileToRemove: FileWithPreview) => {
      const updatedFiles = files.filter((f) => f.file !== fileToRemove.file);
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
      onRemove?.(fileToRemove);
    },
    [files, onChange, onRemove]
  );

  const onSubmit = async () => {
    setError("");
    setIsLoading(true);
    simulateAnalysis();
    
    try {
      const result = await getAiResult(prompt, files[0].file);
      setAiResult(result);
    } catch (err) {
      console.error("Error analyzing file:", err);
      setError("Gagal menganalisis dokumen. Silakan coba lagi dengan file yang lebih kecil atau dalam format yang berbeda.");
    } finally {
      setIsLoading(false);
      setAnalysisProgress(100);
    }
  };

  const handleClose = () => {
    setPrompt("");
    setAiResult("");
    setFiles([]);
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <AnimatePresence>
        {/* AI Result Card */}
        {aiResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="relative">
              <CardHeader className="py-2">
                <CardTitle className="text-xl text-black">Analysis Result</CardTitle>
                <CardDescription className="text-gray-600">
                  AI-generated analysis of your document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-gray-600">
                  {aiResult.split('\n').map((paragraph, index) => (
                    <p key={index} className="last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  onClick={() => {
                    const element = document.createElement("a");
                    const file = new Blob([aiResult], {type: 'text/plain'});
                    element.href = URL.createObjectURL(file);
                    element.download = "analysis-result.txt";
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                >
                  <Download className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  onClick={() => {
                    navigator.clipboard.writeText(aiResult);
                  }}
                >
                  <Copy className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  onClick={handleClose}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt Input */}
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-xl text-black">Enter your prompt</CardTitle>
          <CardDescription className="text-gray-600">
            Describe what you want to analyze in your document
          </CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <Textarea
            placeholder="E.g., Analyze the main points of this document and provide a summary..."
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none focus:ring-2 focus:ring-black"
          />
        </CardContent>
      </Card>

      {/* File Upload Card */}
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-xl text-black">Upload Document</CardTitle>
          <CardDescription className="text-gray-600">
            Drag and drop your file here, or click to select
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-40 p-4 border-2 border-dashed rounded-xl transition-all duration-200",
              isDragActive
                ? "border-black bg-gray-50 scale-[1.02]"
                : "border-gray-200 hover:border-gray-400",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className="size-8 mb-3 text-black" />
              <p className="text-sm font-medium text-gray-700">
                Drop your file here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports PDF and image files (JPEG, PNG, GIF) up to {maxSize}MB
              </p>
            </div>
          </div>

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {files.map((file, index) => (
                  <motion.div
                    key={`${file.file.name}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      {file.preview ? (
                        <div className="relative size-10 overflow-hidden rounded">
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <FileIcon className="size-6 text-black" />
                      )}
                      <span className="ml-3 text-sm text-gray-700 truncate">
                        {file.file.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 hover:bg-gray-100"
                      onClick={() => handleRemove(file)}
                      disabled={disabled}
                    >
                      <X className="size-4" />
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-col gap-3">
            {isLoading && (
              <div className="w-full">
                <Progress value={analysisProgress} className="h-1" />
                <p className="text-xs text-gray-500 mt-1">Analyzing document... {analysisProgress}%</p>
              </div>
            )}
            <div className="flex justify-between items-center w-full">
              <p className="text-xs text-gray-500">
                {`${files.filter((f) => !f.error).length}/${maxFiles} files uploaded`}
              </p>
              <Button
                disabled={isLoading || files.length === 0 || !prompt}
                onClick={onSubmit}
                className="bg-black hover:bg-gray-800 text-white transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FileUpload;
