import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { pageTransition, PageHeader } from '@/components/shared';
import { BookingModal } from '@/components/booking-modal';
import { 
  ShieldCheck, 
  GraduationCap, 
  Globe, 
  HeartPulse, 
  Mail, 
  Video, 
  Star, 
  Award, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  BookOpen,
  Calendar,
  MessageSquare,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Link } from 'wouter';
import { getClientAuth } from '@/lib/auth';

const DEFAULT_THERAPIST = {
  id: "doc-1",
  name: "Dr. Evelyn Reed",
  title: "Licensed Clinical Psychologist (PsyD)",
  avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
  email: "dr.evelyn@hexpertify.com",
  rating: 4.95,
  reviewCount: 48,
  yearsOfExperience: 8,
  sessionsCompleted: 120,
  languages: ["English", "Spanish"],
  isVerified: true,
  bio: "Dr. Evelyn Reed specializes in Cognitive Behavioral Therapy (CBT), Mindfulness-Based Stress Reduction (MBSR), and Acceptance and Commitment Therapy (ACT). With over 8 years of clinical expertise, she guides clients through anxiety management, depression recovery, and somatic trauma regulation.",
  approach: "Collaborative, evidence-based, and deeply personalized clinical care designed around measurable wellbeing outcomes and practical coping toolkits.",
  specializations: [
    "Cognitive Behavioral Therapy (CBT)",
    "Mindfulness & Somatic Grounding",
    "Generalized Anxiety Disorder (GAD)",
    "Depression & Mood Regulation",
    "Trauma-Informed Care",
    "Stress & Burnout Recovery"
  ],
  location: "Hexpertify Telehealth Suite & Clinical Offices",
  availability: "Mon – Fri: 09:00 AM – 06:00 PM EST",
  education: [
    { degree: "Psy.D. in Clinical Psychology", institution: "Stanford University", year: "2016" },
    { degree: "B.S. in Behavioral Neuroscience", institution: "Columbia University", year: "2011" }
  ],
  certifications: [
    "Licensed Clinical Psychologist (#PSY-28491)",
    "Certified CBT & Schema Therapy Practitioner (ACT)",
    "EMDR & Somatic Experiencing Certified Clinician"
  ]
};

export default function TherapistPage() {
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [therapist, setTherapist] = useState<any>(() => {
    const user = getClientAuth();
    if (user?.assignedTherapistName) {
      return {
        ...DEFAULT_THERAPIST,
        id: user.assignedTherapistId || DEFAULT_THERAPIST.id,
        name: user.assignedTherapistName || DEFAULT_THERAPIST.name,
        title: user.assignedTherapistProfession || DEFAULT_THERAPIST.title,
        avatarUrl: user.assignedTherapistPhoto || DEFAULT_THERAPIST.avatarUrl,
        email: user.assignedTherapistEmail || DEFAULT_THERAPIST.email,
      };
    }
    return DEFAULT_THERAPIST;
  });

  useEffect(() => {
    let isMounted = true;
    const user = getClientAuth();
    const userParam = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';

    async function loadTherapist() {
      try {
        let res = await fetch(`/api/client/therapist${userParam}`).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`http://localhost:5000/api/client/therapist${userParam}`).catch(() => null);
        }
        if (res && res.ok && isMounted) {
          const data = await res.json().catch(() => null);
          if (data?.success && data?.therapist) {
            setTherapist((prev: any) => ({
              ...DEFAULT_THERAPIST,
              ...prev,
              ...data.therapist,
              specializations: data.therapist.specializations || prev?.specializations || DEFAULT_THERAPIST.specializations,
              education: data.therapist.education || prev?.education || DEFAULT_THERAPIST.education,
              certifications: data.therapist.certifications || prev?.certifications || DEFAULT_THERAPIST.certifications,
            }));
          }
        }
      } catch (err) {
        console.warn('Could not fetch therapist details:', err);
      }
    }

    loadTherapist();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <motion.div {...pageTransition} className="w-full space-y-8 pb-12">
      <PageHeader title="My Therapist" description="Your dedicated partner in your wellness journey." />

      {/* Main Profile Header Card */}
      <div className="hex-card !p-8 md:!p-10 relative overflow-hidden shadow-lg border border-border">
        {/* Decorative ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          <div className="shrink-0 relative mx-auto md:mx-0">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-[32px] overflow-hidden bg-muted shadow-xl ring-4 ring-primary/10">
              <img 
                src={therapist.avatarUrl} 
                alt={therapist.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";
                }}
              />
            </div>
            {therapist.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-background p-1.5 rounded-full shadow-md border border-border" title="Verified Professional">
                <ShieldCheck className="w-7 h-7 text-primary fill-primary/10" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">{therapist.name}</h2>
                <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-semibold border border-amber-500/20">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {therapist.rating || 4.95} ({therapist.reviewCount || 48} reviews)
                </span>
              </div>
              <p className="text-lg text-primary font-medium">{therapist.title}</p>
            </div>

            {/* Key stats badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-xl">
                <Award className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">{therapist.yearsOfExperience || 8} Years</span> Experience
              </div>
              <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-xl">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">{therapist.sessionsCompleted || 120}+</span> Sessions
              </div>
              <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-xl">
                <Globe className="w-4 h-4 text-primary" />
                <span>{Array.isArray(therapist.languages) ? therapist.languages.join(', ') : (therapist.languages || 'English')}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Video className="w-4 h-4" />
                Book Session
              </button>
              <Link 
                href="/messages"
                className="inline-flex items-center gap-2 bg-card hover:bg-accent text-foreground font-semibold px-6 py-2.5 rounded-full border border-border shadow-sm transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Send Message
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Clinical Philosophy, Specializations, Approach */}
        <div className="md:col-span-2 space-y-8">
          
          {/* About Section */}
          <div className="hex-card !p-8 space-y-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <HeartPulse className="w-5 h-5 text-primary" />
              About {therapist.name}
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base">
              {therapist.bio}
            </p>
          </div>

          {/* Therapeutic Approach */}
          <div className="hex-card !p-8 space-y-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-primary" />
              Clinical Approach & Philosophy
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base">
              {therapist.approach}
            </p>
          </div>

          {/* Specializations & Focus Areas */}
          <div className="hex-card !p-8 space-y-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Areas of Specialization
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {therapist.specializations?.map((spec: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></div>
                  <span className="text-sm font-medium text-foreground">{spec}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Practice Info, Education, Certifications */}
        <div className="space-y-8">
          
          {/* Practice Information */}
          <div className="hex-card !p-6 space-y-5">
            <h3 className="text-lg font-bold text-foreground pb-2 border-b border-border">
              Practice Information
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Location</p>
                  <p className="text-muted-foreground">{therapist.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Availability</p>
                  <p className="text-muted-foreground">{therapist.availability}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Direct Contact</p>
                  <p className="text-muted-foreground">{therapist.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="hex-card !p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
              <GraduationCap className="w-5 h-5 text-primary" />
              Education & Training
            </h3>
            <div className="space-y-3">
              {therapist.education?.map((edu: any, idx: number) => (
                <div key={idx} className="text-sm space-y-0.5">
                  <p className="font-semibold text-foreground">{edu.degree}</p>
                  <p className="text-xs text-muted-foreground">{edu.institution} &middot; {edu.year}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="hex-card !p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
              <BookOpen className="w-5 h-5 text-primary" />
              Board Certifications
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {therapist.certifications?.map((cert: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium leading-snug">{cert}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)}
        therapistName={therapist.name}
        therapistAvatar={therapist.avatarUrl}
        therapistTitle={therapist.title}
      />
    </motion.div>
  );
}
