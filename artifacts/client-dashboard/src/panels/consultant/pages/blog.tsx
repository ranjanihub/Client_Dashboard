import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useSubmitBlogPost, useSubmitBlogOutline } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PenTool,
  FileText,
  Send,
  Type,
  Upload,
  X,
  Clock,
  Trash2,
  Tag,
  Plus,
  ArrowLeft,
  Eye,
  Search,
  CheckCircle2,
  BookOpen,
  Sparkles,
  User,
  Calendar,
  Filter,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";

/* ── schemas ──────────────────────────────────────────────── */
const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100),
  category: z.string().min(1, "Please select a category."),
  tags: z.string().optional(),
  content: z.string().min(1, "Content is required."),
  featuredImage: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
});

const outlineSchema = z.object({
  proposedTitle: z.string().min(5, "Title must be at least 5 characters."),
  keyPoints: z.string().min(1, "Please list at least one key point."),
  targetAudience: z.string().min(1, "Please describe the audience."),
  keywords: z.string().min(1, "Please provide keywords."),
  notes: z.string().optional(),
});

/* ── types ────────────────────────────────────────────────── */
interface BlogPostItem {
  id: number;
  title: string;
  category: string;
  tags?: string[];
  content: string;
  featuredImage?: string | null;
  status: "published" | "submitted" | "draft" | string;
  author?: string;
  createdAt: string;
}

interface PostDraft {
  id: string;
  kind: "post";
  title: string;
  category: string;
  tags?: string;
  content: string;
  savedAt: Date;
}

interface OutlineDraft {
  id: string;
  kind: "outline";
  proposedTitle: string;
  keyPoints: string;
  targetAudience: string;
  keywords: string;
  notes?: string;
  savedAt: Date;
}

type Draft = PostDraft | OutlineDraft;

function timeAgo(dateString: string | Date) {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (isNaN(secs)) return "recently";
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

/* ── tab pill ─────────────────────────────────────────────── */
function Tab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold border transition-all cursor-pointer",
        active
          ? "bg-primary text-white border-primary shadow-sm"
          : "bg-white text-muted-foreground border-border hover:border-primary/30 hover:text-primary"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

/* ── Drafts panel ─────────────────────────────────────────── */
function DraftsPanel({
  drafts,
  onDelete,
  onRestore,
}: {
  drafts: Draft[];
  onDelete: (id: string) => void;
  onRestore: (draft: Draft) => void;
}) {
  if (!Array.isArray(drafts) || drafts.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Saved Drafts ({drafts.length})
      </p>
      <div className="space-y-2">
        {drafts.map((draft) => {
          const title = draft.kind === "post" ? draft.title : draft.proposedTitle;
          const sub =
            draft.kind === "post"
              ? draft.category || "No category"
              : draft.keywords || "No keywords";
          return (
            <div
              key={draft.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-white hover:border-primary/30 hover:bg-primary/[0.02] transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {draft.kind === "post" ? (
                  <PenTool className="w-4 h-4 text-primary" />
                ) : (
                  <FileText className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{title || "Untitled draft"}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Tag className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">{sub}</span>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{timeAgo(draft.savedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-3 text-xs text-primary hover:bg-primary/10"
                  onClick={() => onRestore(draft)}
                >
                  Edit
                </Button>
                <button
                  onClick={() => onDelete(draft.id)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Full blog form ───────────────────────────────────────── */
function FullBlogForm({
  onSaveDraft,
  onSuccessSubmit,
  defaultValues,
}: {
  onSaveDraft: (values: z.infer<typeof postSchema>) => void;
  onSuccessSubmit: () => void;
  defaultValues?: Partial<z.infer<typeof postSchema>>;
}) {
  const { toast } = useToast();
  const submitPost = useSubmitBlogPost();
  const [contentMode, setContentMode] = useState<"text" | "file">("text");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "Understanding Cognitive Behavioral Therapy for Panic and Anxiety",
      category: "Anxiety",
      tags: "cbt, anxiety, coping-skills, mental-health",
      content:
        "Cognitive Behavioral Therapy (CBT) is an evidence-based psychological treatment that helps individuals identify and challenge negative thought patterns.\n\n### Key Concepts of CBT\n1. **Cognitive Triad**: Understanding the connection between thoughts, feelings, and behaviors.\n2. **Automatic Thoughts**: Uncovering habitual negative self-talk.\n3. **Behavioral Experiments**: Testing beliefs in real-world scenarios to reduce anxiety.\n\n### Practical Exercises\n- Daily Thought Logs\n- Gradual Exposure Tracking\n- Box Breathing Protocols (4-4-4-4)",
      featuredImage:
        "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop",
      ...defaultValues,
    },
  });

  function onSubmit(values: z.infer<typeof postSchema>) {
    submitPost.mutate(
      {
        data: {
          title: values.title,
          category: values.category,
          tags: values.tags ? values.tags.split(",").map((t) => t.trim()) : [],
          content: values.content,
          featuredImage: values.featuredImage || null,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Blog post submitted successfully!",
            description: "Your post is now listed in your submitted blogs.",
          });
          form.reset();
          onSuccessSubmit();
        },
        onError: () =>
          toast({
            title: "Error",
            description: "Failed to submit post.",
            variant: "destructive",
          }),
      }
    );
  }

  function handleSaveDraft() {
    const values = form.getValues();
    onSaveDraft(values);
    toast({ title: "Draft saved", description: "You can find it in the drafts list." });
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="bg-secondary/30 pb-4 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <PenTool className="w-5 h-5 text-primary" /> Post Editor
        </CardTitle>
        <CardDescription>
          Articles should be evidence-based and written for a general audience.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g., Understanding the Mechanics of CBT"
                      className="text-base font-medium"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Anxiety">Anxiety & Stress</SelectItem>
                        <SelectItem value="Depression">Depression</SelectItem>
                        <SelectItem value="Relationships">Relationships</SelectItem>
                        <SelectItem value="Mindfulness">Mindfulness</SelectItem>
                        <SelectItem value="Therapy_Guide">Therapy Guide</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tags{" "}
                      <span className="text-muted-foreground font-normal">
                        (comma separated)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="cbt, anxiety, coping" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Content with Write / Upload toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">Article Content</label>
                <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setContentMode("text");
                      setUploadedFile(null);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                      contentMode === "text"
                        ? "bg-white text-primary shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Type className="w-3 h-3" /> Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentMode("file")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                      contentMode === "file"
                        ? "bg-white text-primary shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Upload className="w-3 h-3" /> Upload
                  </button>
                </div>
              </div>

              {contentMode === "text" ? (
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Write your article content here..."
                          className="min-h-[280px] resize-y text-sm font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : uploadedFile ? (
                <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      form.setValue("content", "");
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-3 min-h-[180px] rounded-lg border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Drop your file here or <span className="text-primary">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports PDF, DOC, DOCX — up to 10 MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setUploadedFile(f);
                        form.setValue("content", f.name);
                      }
                    }}
                  />
                </label>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button
                type="submit"
                className="bg-primary text-white font-bold"
                disabled={submitPost.isPending}
              >
                {submitPost.isPending ? (
                  "Submitting…"
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit for Review
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

/* ── Outline form ─────────────────────────────────────────── */
function OutlineForm({
  onSaveDraft,
  onSuccessSubmit,
  defaultValues,
}: {
  onSaveDraft: (values: z.infer<typeof outlineSchema>) => void;
  onSuccessSubmit: () => void;
  defaultValues?: Partial<z.infer<typeof outlineSchema>>;
}) {
  const { toast } = useToast();
  const submitOutline = useSubmitBlogOutline();
  const [outlineMode, setOutlineMode] = useState<"text" | "pdf">("text");
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);

  const form = useForm<z.infer<typeof outlineSchema>>({
    resolver: zodResolver(outlineSchema),
    defaultValues: {
      proposedTitle:
        "5 Practical Strategies to Prevent Clinical Burnout in Healthcare",
      keyPoints:
        "1. Identifying early physiological indicators of stress\n2. Setting clear professional boundaries with client schedules\n3. Implementing active recovery micro-breaks between sessions\n4. Re-evaluating caseload intensity and administrative protocols",
      targetAudience:
        "Healthcare professionals, clinical therapists, and social workers",
      keywords: "burnout, stress-management, self-care, clinical-practice",
      notes: "References recent 2024 APA research on practitioner wellbeing.",
      ...defaultValues,
    },
  });

  function onSubmit(values: z.infer<typeof outlineSchema>) {
    let finalKeyPoints = values.keyPoints.split("\n").filter((p) => p.trim());
    let finalNotes = values.notes || "";

    if (uploadedPdf) {
      const pdfNote = `[Attached PDF Pitch Document: ${uploadedPdf.name} (${(uploadedPdf.size / 1024).toFixed(1)} KB)]`;
      if (!finalKeyPoints.length) {
        finalKeyPoints = [pdfNote];
      }
      finalNotes = finalNotes ? `${finalNotes} | ${pdfNote}` : pdfNote;
    }

    submitOutline.mutate(
      {
        data: {
          proposedTitle: values.proposedTitle,
          keyPoints: finalKeyPoints,
          targetAudience: values.targetAudience,
          keywords: values.keywords.split(",").map((k) => k.trim()),
          notes: finalNotes || null,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Outline pitched successfully!",
            description: uploadedPdf
              ? `Pitch outline with attached PDF "${uploadedPdf.name}" submitted!`
              : "Our editorial team will review your outline shortly.",
          });
          form.reset();
          setUploadedPdf(null);
          onSuccessSubmit();
        },
        onError: () =>
          toast({
            title: "Error",
            description: "Failed to pitch outline.",
            variant: "destructive",
          }),
      }
    );
  }

  function handleSaveDraft() {
    const values = form.getValues();
    onSaveDraft(values);
    toast({ title: "Draft saved", description: "You can find it in the drafts list." });
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="bg-secondary/30 pb-4 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Article Proposal & PDF Pitch Upload
        </CardTitle>
        <CardDescription>
          Pitching ensures your topic aligns with our current content needs. You can write your outline or upload a PDF pitch document.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="proposedTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposed Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g., 5 Signs of Burnout You Might Be Ignoring"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Outline Input Mode Toggle & PDF Upload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Outline Format & PDF Pitch Upload
                </label>
                <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setOutlineMode("text")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                      outlineMode === "text"
                        ? "bg-white text-primary shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Type className="w-3 h-3" /> Text Outline
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutlineMode("pdf")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                      outlineMode === "pdf"
                        ? "bg-white text-primary shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Upload className="w-3 h-3" /> Upload PDF Pitch
                  </button>
                </div>
              </div>

              {outlineMode === "text" ? (
                <FormField
                  control={form.control}
                  name="keyPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Points to Cover</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={"Point 1…\nPoint 2…\nPoint 3…"}
                          className="min-h-[120px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Put each point on a new line.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {/* Dedicated PDF Upload Card / Zone */}
              {(outlineMode === "pdf" || uploadedPdf) && (
                <div className="pt-1">
                  {uploadedPdf ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/40 bg-primary/5 shadow-sm">
                      <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {uploadedPdf.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF Pitch Document • {(uploadedPdf.size / (1024 * 1024)).toFixed(2)} MB • Ready for submission
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedPdf(null)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-3 min-h-[160px] rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.02] hover:border-primary hover:bg-primary/5 transition-all cursor-pointer p-6">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shadow-sm">
                        <Upload className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-900">
                          Upload Blog Outline Pitch PDF Document
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Drag & drop your <span className="font-bold text-red-600">PDF</span> file here or <span className="text-primary font-semibold underline">browse file</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          Supports PDF, DOC, DOCX — up to 15 MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setUploadedPdf(f);
                            if (!form.getValues("keyPoints")) {
                              form.setValue(
                                "keyPoints",
                                `[Attached PDF Pitch Document: ${f.name}]`
                              );
                            }
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g., Young professionals, Parents"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Keywords{" "}
                      <span className="text-muted-foreground font-normal">
                        (comma separated)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="burnout, stress, work-life" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Additional Notes{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any specific research or reference details you plan to cite?"
                      className="min-h-[80px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button
                type="submit"
                className="bg-primary text-white font-bold"
                disabled={submitOutline.isPending}
              >
                {submitOutline.isPending ? (
                  "Pitching…"
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Pitch Outline
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

const HARDCODED_SUBMITTED_BLOG: BlogPostItem = {
  id: 999,
  title: "5 Proven CBT Techniques to Overcome Workplace Burnout",
  category: "Anxiety & Stress",
  tags: ["Burnout", "CBT", "Mental Health"],
  content: "Workplace burnout is a state of emotional, physical, and mental exhaustion caused by excessive stress in high-demand environments. Implementing Cognitive Behavioral Therapy (CBT) techniques enables professionals to reframe negative thought patterns and maintain emotional balance.",
  featuredImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop",
  status: "submitted",
  createdAt: "2026-07-26T14:30:00.000Z",
};

/* ── Main Page Component ───────────────────────────────────── */
export default function Blog() {
  const { toast } = useToast();
  // Navigation view: "list" (default list of all submitted blogs) vs "submit" (submit blog form)
  const [view, setView] = useState<"list" | "submit">("list");
  const [tab, setTab] = useState<"post" | "outline">("post");

  const [posts, setPosts] = useState<BlogPostItem[]>([HARDCODED_SUBMITTED_BLOG]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [previewPost, setPreviewPost] = useState<BlogPostItem | null>(null);

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [restoreValues, setRestoreValues] = useState<
    Partial<z.infer<typeof postSchema>> | Partial<z.infer<typeof outlineSchema>> | undefined
  >(undefined);
  const [restoreKey, setRestoreKey] = useState(0);

  const postDrafts = drafts.filter((d) => d.kind === "post") as PostDraft[];
  const outlineDrafts = drafts.filter((d) => d.kind === "outline") as OutlineDraft[];
  const visibleDrafts = tab === "post" ? postDrafts : outlineDrafts;

  useEffect(() => {
    fetchSubmittedBlogs();
  }, []);

  const fetchSubmittedBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blog/posts");
      if (res.ok) {
        const data = await res.json();
        const hasHardcoded = data.some((p: BlogPostItem) => p.id === HARDCODED_SUBMITTED_BLOG.id || p.title === HARDCODED_SUBMITTED_BLOG.title);
        setPosts(hasHardcoded ? data : [HARDCODED_SUBMITTED_BLOG, ...data]);
      } else {
        setPosts([HARDCODED_SUBMITTED_BLOG]);
      }
    } catch (e) {
      console.error("Error fetching blog posts", e);
      setPosts([HARDCODED_SUBMITTED_BLOG]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/blog/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Post deleted", description: `Deleted "${title}" successfully.` });
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    }
  };

  function savePostDraft(values: z.infer<typeof postSchema>) {
    setDrafts((prev) => [
      { id: crypto.randomUUID(), kind: "post", savedAt: new Date(), ...values } as PostDraft,
      ...prev,
    ]);
  }

  function saveOutlineDraft(values: z.infer<typeof outlineSchema>) {
    setDrafts((prev) => [
      { id: crypto.randomUUID(), kind: "outline", savedAt: new Date(), ...values } as OutlineDraft,
      ...prev,
    ]);
  }

  function deleteDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  function restoreDraft(draft: Draft) {
    if (draft.kind === "post") {
      const { id, kind, savedAt, ...values } = draft;
      setTab("post");
      setRestoreValues(values);
    } else {
      const { id, kind, savedAt, ...values } = draft;
      setTab("outline");
      setRestoreValues(values);
    }
    setView("submit");
    setRestoreKey((k) => k + 1);
    deleteDraft(draft.id);
  }

  const handleFormSuccess = () => {
    fetchSubmittedBlogs();
    setView("list");
  };

  // Filtered posts for list view
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && p.status === "published") ||
      (statusFilter === "submitted" && (p.status === "submitted" || p.status === "pending")) ||
      (statusFilter === "draft" && p.status === "draft");

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Published
          </Badge>
        );
      case "submitted":
      case "pending":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100 flex items-center gap-1 font-bold">
            <Clock className="w-3 h-3 text-purple-600" /> Pending Review
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-300">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title={view === "list" ? "Submitted Blogs & Articles" : "Submit New Blog Post"}
        description="Publish psychoeducational content, mental health articles, and practice updates (live after admin review)."
        badge="CONTENT MANAGEMENT"
        icon={<PenTool className="w-4 h-4 text-purple-200" />}
      >
        <div className="flex items-center gap-3">
          {view === "list" ? (
            <button
              type="button"
              onClick={() => setView("submit")}
              className="inline-flex items-center justify-center gap-2 bg-white text-[#5e2be2] hover:bg-white/90 font-extrabold text-xs px-4 py-2.5 rounded-full shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Submit Blog</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setView("list")}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-full border border-white/20 transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Submitted Blogs</span>
            </button>
          )}
        </div>
      </PageHeader>

      {/* VIEW 1: LANDING VIEW - SUBMITTED BLOGS LIST */}
      {view === "list" && (
        <div className="space-y-6">
          {/* Filter and Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search blog title or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-lg text-sm bg-secondary/30"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-muted-foreground ml-2 hidden sm:block" />
              <span className="text-xs font-semibold text-muted-foreground hidden sm:block">
                Status:
              </span>

              <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border w-full sm:w-auto">
                {["all", "published", "submitted"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all cursor-pointer ${
                      statusFilter === st
                        ? "bg-white text-gray-900 shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st === "submitted" ? "Pending" : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drafts Banner if any exist */}
          <DraftsPanel
            drafts={drafts}
            onDelete={deleteDraft}
            onRestore={restoreDraft}
          />

          {/* Submitted Blogs Grid / List */}
          {loading ? (
            <div className="py-20 text-center text-muted-foreground bg-white rounded-2xl border border-border">
              Loading submitted blogs...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-border p-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-lg font-bold text-gray-900">No Submitted Blogs Found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
                You haven't submitted any blogs matching your search criteria. Click below to submit your first article.
              </p>
              <Button
                onClick={() => setView("submit")}
                className="rounded-xl shadow-md gap-2 font-bold bg-primary hover:bg-primary/90 text-white cursor-pointer px-6 py-2.5"
              >
                <Plus className="w-5 h-5" /> Submit Blog Now
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => {
                const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={post.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-150"
                  >
                    {/* Title & Submission Date */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-base leading-snug">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                        <span>Submitted on {formattedDate !== "Invalid Date" ? formattedDate : post.createdAt}</span>
                      </div>
                    </div>

                    {/* Status & Preview Button */}
                    <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                      <div>{getStatusBadge(post.status)}</div>
                      <Button
                        size="sm"
                        onClick={() => setPreviewPost(post)}
                        className="rounded-xl text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-white cursor-pointer px-4 py-2"
                      >
                        <Eye className="w-4 h-4" /> Preview
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SUBMIT BLOG FORM (Shown when user clicks "Submit Blog") */}
      {view === "submit" && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Tabs for Post vs Outline */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <Tab
                active={tab === "post"}
                onClick={() => setTab("post")}
                icon={PenTool}
                label="Full Blog Post"
              />
              <Tab
                active={tab === "outline"}
                onClick={() => setTab("outline")}
                icon={FileText}
                label="Blog Outline Pitch"
              />
            </div>
          </div>

          {/* Drafts for current tab */}
          <DraftsPanel
            drafts={visibleDrafts}
            onDelete={deleteDraft}
            onRestore={restoreDraft}
          />

          {/* Form Content */}
          {tab === "post" ? (
            <FullBlogForm
              key={`post-${restoreKey}`}
              onSaveDraft={savePostDraft}
              onSuccessSubmit={handleFormSuccess}
              defaultValues={
                tab === "post"
                  ? (restoreValues as Partial<z.infer<typeof postSchema>>)
                  : undefined
              }
            />
          ) : (
            <OutlineForm
              key={`outline-${restoreKey}`}
              onSaveDraft={saveOutlineDraft}
              onSuccessSubmit={handleFormSuccess}
              defaultValues={
                tab === "outline"
                  ? (restoreValues as Partial<z.infer<typeof outlineSchema>>)
                  : undefined
              }
            />
          )}
        </div>
      )}

      {/* PREVIEW MODAL */}
      <Dialog open={!!previewPost} onOpenChange={(open) => !open && setPreviewPost(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl p-4 sm:p-8 rounded-2xl bg-white max-h-[92vh] overflow-y-auto">
          {previewPost && (
            <div className="space-y-6">
              {previewPost.featuredImage && (
                <div className="h-56 w-full rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={previewPost.featuredImage}
                    alt={previewPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-primary/10 text-primary font-bold">
                    {previewPost.category}
                  </Badge>
                  {getStatusBadge(previewPost.status)}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {timeAgo(previewPost.createdAt)}
                  </span>
                </div>

                <DialogTitle className="text-2xl font-extrabold text-gray-900 leading-tight">
                  {previewPost.title}
                </DialogTitle>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 border-b border-border pb-4">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Submitted by {previewPost.author || "Dr. Alex Harrison"}</span>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-line text-gray-700 bg-slate-50/60 p-5 rounded-xl border border-slate-100">
                {previewPost.content}
              </div>

              {previewPost.tags && previewPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  <span className="text-xs font-semibold text-muted-foreground">Tags:</span>
                  {previewPost.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-secondary text-primary font-medium px-2.5 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={() => setPreviewPost(null)} variant="outline" className="rounded-xl">
                  Close Preview
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
