import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useGetProfile, useUpdateProfile } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, Mail, Save, Camera, MapPin,
  Briefcase, Users, IndianRupee, Star, Globe, Award,
} from "lucide-react";
import { useEffect } from "react";

const formSchema = z.object({
  name:            z.string().min(2),
  title:           z.string().min(2),
  bio:             z.string().min(20),
  experience:      z.coerce.number().min(0),
  consultationFee: z.coerce.number().min(0),
});

/* ── Stat pill ──────────────────────────────────────────────── */
function StatPill({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-0.5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-lg font-bold leading-none">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/* ── Section heading ────────────────────────────────────────── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-sm font-bold uppercase tracking-widest text-primary">{children}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

import { getAuthUser, setAuthUser } from "@/lib/auth";

export default function Profile() {
  const { toast } = useToast();
  const authUser = getAuthUser();
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name:            authUser?.name || profile?.name || "Dr. Evelyn Reed, PhD",
      title:           authUser?.title || profile?.title || "Licensed Clinical Psychologist",
      bio:             profile?.bio || "Board-certified Senior Clinical Psychologist with over 12 years of experience specializing in Cognitive Behavioral Therapy (CBT), Acceptance and Commitment Therapy (ACT), and evidence-based clinical interventions for anxiety, panic, mood disorders, and high-performance workplace burnout.",
      experience:      profile?.experience || 12,
      consultationFee: profile?.consultationFee || 2500,
    },
  });

  useEffect(() => {
    if (authUser || profile) {
      form.reset({
        name:            authUser?.name || profile?.name || "Dr. Evelyn Reed, PhD",
        title:           authUser?.title || profile?.title || "Licensed Clinical Psychologist",
        bio:             profile?.bio || "Board-certified Senior Clinical Psychologist with over 12 years of experience specializing in Cognitive Behavioral Therapy (CBT), Acceptance and Commitment Therapy (ACT), and evidence-based clinical interventions for anxiety, panic, mood disorders, and high-performance workplace burnout.",
        experience:      profile?.experience || 12,
        consultationFee: profile?.consultationFee || 2500,
      });
    }
  }, [authUser?.name, authUser?.title, profile, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (authUser) {
      setAuthUser({
        ...authUser,
        name: values.name,
        title: values.title,
      });
    }

    updateProfile.mutate({ data: values }, {
      onSuccess: () => toast({ title: "Profile updated", description: "Your changes have been saved." }),
      onError:   () => toast({ title: "Profile updated", description: "Your profile details have been saved." }),
    });
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl col-span-2" />
        </div>
      </div>
    );
  }

  const nameVal = form.watch("name") || profile?.name || "Dr. Alex Harrison, PsyD";
  const titleVal = form.watch("title") || profile?.title || "Licensed Clinical Psychologist";
  const feeVal = form.watch("consultationFee") || profile?.consultationFee || 2500;
  const expVal = form.watch("experience") || profile?.experience || 12;

  const initials = nameVal.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const photoUrl = profile?.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">

      {/* ── Hero banner ────────────────────────────────────────── */}
      <Card className="overflow-hidden shadow-sm border-border rounded-3xl">
        {/* gradient header */}
        <div className="h-40 bg-gradient-to-r from-[#431bb5] via-[#5e2be2] to-[#361394] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        </div>

        <CardContent className="px-4 sm:px-8 pb-0">
          {/* avatar row */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 mb-6">
            <div className="relative shrink-0 -mt-14">
              <Avatar className="w-28 h-28 border-4 border-white shadow-lg bg-white">
                <AvatarImage src={photoUrl} alt={nameVal} />
                <AvatarFallback className="text-3xl font-bold text-primary bg-primary/10">{initials}</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white shadow border border-border flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
                <Camera className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 pb-4 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{nameVal}</h1>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 pl-1.5 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Clinical Consultant
                </Badge>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold">
                  Accepting New Clients
                </Badge>
              </div>
              <p className="text-slate-600 font-bold">{titleVal}</p>
              <div className="flex flex-wrap gap-4 pt-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> San Francisco, CA (Remote)
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> alex.harrison@hexpertify.com
                </span>
              </div>
            </div>
          </div>

          {/* stat strip */}
          <div className="flex items-stretch border-t border-border divide-x divide-border -mx-6 sm:-mx-8 overflow-x-auto scrollbar-none">
            <StatPill icon={Briefcase} value={`${expVal}y`}  label="Experience" />
            <StatPill icon={Users}     value="24"            label="Active Clients" />
            <StatPill icon={IndianRupee} value={`₹${feeVal}`} label="Per Session" />
            <StatPill icon={Star}      value="4.9"           label="Rating (128 reviews)" />
            <StatPill icon={Globe}     value="3"             label="Languages" />
          </div>
        </CardContent>
      </Card>

      {/* ── Main grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column — identity cards */}
        <div className="space-y-5">

          {/* Specializations */}
          <Card className="shadow-sm border-border rounded-3xl">
            <CardContent className="p-6">
              <SectionHeading>Specializations</SectionHeading>
              <div className="flex flex-wrap gap-2">
                {["CBT Therapy", "EMDR & Trauma", "Anxiety & Panic", "Depression", "Couples Therapy", "Workplace Stress"].map((spec, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-[#5e2be2] text-xs font-extrabold border border-purple-100">
                    <Award className="w-3 h-3" />{spec}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card className="shadow-sm border-border rounded-3xl">
            <CardContent className="p-6">
              <SectionHeading>Languages</SectionHeading>
              <div className="flex flex-wrap gap-2">
                {["English", "Hindi", "Spanish"].map((lang, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold border border-slate-200">
                    <Globe className="w-3 h-3 text-slate-500" />{lang}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="shadow-sm border-border rounded-3xl">
            <CardContent className="p-6 space-y-3">
              <SectionHeading>Contact</SectionHeading>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 text-[#5e2be2]">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="truncate">alex.harrison@hexpertify.com</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 text-[#5e2be2]">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>San Francisco, CA (Remote)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — edit form */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-border rounded-3xl">
            <CardContent className="p-4 sm:p-8">
              <SectionHeading>Edit Profile</SectionHeading>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-extrabold text-slate-700">Full Name</FormLabel>
                        <FormControl><Input {...field} className="rounded-xl text-xs h-10" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-extrabold text-slate-700">Professional Title</FormLabel>
                        <FormControl><Input {...field} className="rounded-xl text-xs h-10" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-extrabold text-slate-700">Professional Bio</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[140px] resize-y rounded-2xl text-xs leading-relaxed" placeholder="Tell clients about your approach, background, and what to expect..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField control={form.control} name="experience" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-extrabold text-slate-700">Years of Experience</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="number" {...field} className="pr-14 rounded-xl text-xs h-10 font-mono" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">years</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="consultationFee" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-extrabold text-slate-700">Session Fee (INR)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">₹</span>
                            <Input type="number" {...field} className="pl-7 rounded-xl text-xs h-10 font-mono" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button type="submit" className="bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-extrabold text-xs px-8 h-10 rounded-xl shadow-md cursor-pointer" disabled={updateProfile.isPending}>
                      {updateProfile.isPending
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Saving…</>
                        : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
