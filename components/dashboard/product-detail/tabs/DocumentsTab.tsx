
"use client";
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileArchive, Download, UploadCloud, FileText, Search, Filter, Image as ImageIconLucide, FileType2, FileSpreadsheet, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import type { MockProduct as Product, ProductDocument } from '@/types/product-form-types';
import { addProductDocumentAction, deleteProductDocumentAction } from '@/app/actions/products';
import { format, parseISO } from 'date-fns';

interface DocumentsTabProps {
  product: Product | null;
  refreshProductData: () => void; // To refresh parent data
}

const documentTypes = [
  { value: 'Declaration', label: 'Declaration of Conformity' },
  { value: 'Test Report', label: 'Test Report' },
  { value: 'Manual', label: 'User Manual' },
  { value: 'Certificate', label: 'Certificate' },
  { value: 'Image', label: 'Image/Diagram' },
  { value: 'Spreadsheet', label: 'Spreadsheet/Data' },
  { value: 'Other', label: 'Other Document' },
];

const documentFormSchema = z.object({
  name: z.string().min(3, "Document name is required (min 3 chars).").max(100, "Name too long."),
  type: z.string().min(1, "Document type is required."),
  version: z.string().max(20, "Version string too long.").optional(),
  file: z.instanceof(File, { message: "Please select a file." }).refine(file => file.size <= 5 * 1024 * 1024, "File size must be 5MB or less.").optional(), // Optional in schema, handle if not provided
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

const DocumentIcon = ({ fileName, fileType }: { fileName?: string; fileType?: string }) => {
  const extension = fileName?.split('.').pop()?.toLowerCase();
  const typeLower = fileType?.toLowerCase();

  if (extension === 'pdf' || typeLower === 'declaration' || typeLower === 'certificate' || typeLower === 'test report') return <FileType2 className="h-5 w-5 text-red-500" />;
  if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '') || typeLower === 'image') return <ImageIconLucide className="h-5 w-5 text-blue-500" />;
  if (['xls', 'xlsx', 'csv'].includes(extension || '') || typeLower === 'spreadsheet') return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  if (typeLower === 'manual') return <FileText className="h-5 w-5 text-purple-500"/>;
  return <FileArchive className="h-5 w-5 text-muted-foreground" />;
};


const DocumentsTab: React.FC<DocumentsTabProps> = ({ product, refreshProductData }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<ProductDocument | null>(null);

  const methods = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: { name: '', type: '', version: '', file: undefined },
  });
  
  const productDocuments = product?.documents || [];

  const filteredDocuments = productDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (doc.fileName && doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const availableDocTypesForFilter = ['all', ...new Set(productDocuments.map(doc => doc.type))];

  const handleAddDocument: SubmitHandler<DocumentFormValues> = async (data) => {
    if (!product) return;
    setIsSubmitting(true);
    try {
      const documentPayload = {
        name: data.name,
        type: data.type,
        version: data.version,
        fileName: data.file?.name,
        fileSize: data.file?.size,
      };
      const result = await addProductDocumentAction(product.id, documentPayload);
      if (result.success) {
        toast({ title: "Document Added", description: result.message });
        refreshProductData();
        methods.reset();
      } else {
        toast({ variant: "destructive", title: "Failed to Add", description: result.message });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not add document." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!product || !documentToDelete) return;
    setIsSubmitting(true); // Use same state for general loading
    try {
      const result = await deleteProductDocumentAction(product.id, documentToDelete.id);
      if (result.success) {
        toast({ title: "Document Deleted", description: `Document "${documentToDelete.name}" removed.` });
        refreshProductData();
      } else {
        toast({ variant: "destructive", title: "Delete Failed", description: result.message });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not delete document." });
    } finally {
      setIsSubmitting(false);
      setDocumentToDelete(null);
    }
  };


  if (!product) return <p>Loading documents...</p>;

  return (
    <div className="space-y-6">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleAddDocument)}>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><UploadCloud className="mr-2 h-5 w-5 text-primary"/>Upload New Document</CardTitle>
              <CardDescription>Add relevant files such as certifications, test reports, manuals, or images for {product.name}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={methods.control} name="name" render={({ field }) => (<FormItem><FormLabel>Document Name</FormLabel><FormControl><Input placeholder="e.g., CE Declaration X1000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={methods.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>{documentTypes.filter(dt => dt.value !== 'all').map(dt => (<SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={methods.control} name="version" render={({ field }) => (<FormItem><FormLabel>Version (Optional)</FormLabel><FormControl><Input placeholder="e.g., 1.2.0" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
               <FormField
                control={methods.control}
                name="file"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Select File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        {...rest}
                        onChange={(event) => onChange(event.target.files ? event.target.files[0] : null)}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </FormControl>
                    <FormDescription>Max file size: 5MB. (Mock upload - no actual file stored)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Adding Document...' : 'Add Document'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </FormProvider>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><FileArchive className="mr-2 h-5 w-5 text-primary"/>Uploaded Documents</CardTitle>
           <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, type..." 
                        className="pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableDocTypesForFilter.map(type => (
                             <SelectItem key={type} value={type}>{type === 'all' ? 'All Types' : type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            {filteredDocuments.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] px-3 py-3">Icon</TableHead>
                                <TableHead className="px-3 py-3">Document Name</TableHead>
                                <TableHead className="px-3 py-3">Type</TableHead>
                                <TableHead className="px-3 py-3">Version</TableHead>
                                <TableHead className="px-3 py-3">Size</TableHead>
                                <TableHead className="px-3 py-3">Upload Date</TableHead>
                                <TableHead className="text-right px-3 py-3">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDocuments.map(doc => (
                                <TableRow key={doc.id} className="hover:bg-muted/30">
                                    <TableCell className="px-3 py-2"><DocumentIcon fileName={doc.fileName} fileType={doc.type} /></TableCell>
                                    <TableCell className="font-medium text-foreground px-3 py-2">{doc.name}</TableCell>
                                    <TableCell className="px-3 py-2"><Badge variant="outline" className="text-xs">{doc.type}</Badge></TableCell>
                                    <TableCell className="px-3 py-2">{doc.version || 'N/A'}</TableCell>
                                    <TableCell className="px-3 py-2">{doc.size || 'N/A'}</TableCell>
                                    <TableCell className="text-xs px-3 py-2">{doc.uploadDate ? format(parseISO(doc.uploadDate), 'PP') : 'N/A'}</TableCell>
                                    <TableCell className="text-right px-3 py-2">
                                        <Button variant="ghost" size="icon" title="Download Document" asChild>
                                            <a href={doc.fileUrl} download={doc.fileName || doc.name} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4 text-primary hover:text-primary/80"/>
                                            </a>
                                        </Button>
                                        <Button variant="ghost" size="icon" title="Delete Document" className="text-destructive hover:text-destructive/80" onClick={() => setDocumentToDelete(doc)}>
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                    <FileArchive className="h-12 w-12 mx-auto mb-4 text-primary/30"/>
                    <p>{searchTerm || typeFilter !== 'all' ? 'No documents match your filters.' : 'No documents uploaded for this product yet.'}</p>
                </div>
            )}
        </CardContent>
      </Card>

      {documentToDelete && (
        <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the document "{documentToDelete.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDocumentToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default DocumentsTab;
