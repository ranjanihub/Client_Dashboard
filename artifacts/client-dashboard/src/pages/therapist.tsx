import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGetTherapist } from '@workspace/api-client-react';
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
  UserCheck,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Link } from 'wouter';

export default function TherapistPage() {
  const { data: apiTherapist, isLoading } = useGetTherapist();
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  const mockTherapist = {
    id: 1,
    name: "Dr. Sarah Jenkins",
    title: "Licensed Clinical Psychologist (Ph.D., Psy.D.)",
    avatarUrl: "/dr_sarah_jenkins.jpg",
    bio: "Dr. Sarah Jenkins specializes in Cognitive Behavioral Therapy (CBT), Mindfulness-Based Stress Reduction (MBSR), and trauma-informed care. With over 12 years of experience helping individuals navigate anxiety, depression, and life transitions, Dr. Jenkins works collaboratively with clients to build resilience and long-term coping strategies.",
    specializations: [
      "Cognitive Behavioral Therapy (CBT)", 
      "Mindfulness & Stress Reduction", 
      "Anxiety & Panic Disorders", 
      "Depression & Mood Management", 
      "Trauma-Informed Care", 
      "Relationship & Interpersonal Counseling"
    ],
    languages: ["English", "Spanish"],
    yearsOfExperience: 12,
    rating: 4.95,
    reviewCount: 128,
    sessionsCompleted: 1450,
    isVerified: true,
    email: "dr.jenkins@hexpertify.com",
    location: "San Francisco, CA (Virtual & In-Person Sessions)",
    availability: "Monday, Wednesday, Friday (9:00 AM - 5:00 PM PST)",
    education: [
      { degree: "Ph.D. in Clinical Psychology", institution: "Stanford University", year: "2012" },
      { degree: "M.S. in Counseling Psychology", institution: "Columbia University", year: "2009" },
      { degree: "B.S. in Psychology (Honors)", institution: "UC Berkeley", year: "2007" }
    ],
    certifications: [
      "Board Certified in Clinical Psychology (ABPP)",
      "Certified Cognitive Behavioral Therapist (ACT)",
      "Certified Mindfulness-Based Stress Reduction (MBSR) Instructor",
      "EMDR Certified Specialist in Trauma & Recovery"
    ],
    approach: "I believe in a collaborative, client-centered approach. My goal is to create a safe, warm, and non-judgmental space where we can explore your thoughts, emotions, and life patterns together. By integrating evidence-based interventions tailored to your unique needs, I empower you to cultivate self-compassion and sustainable coping tools."
  };

  const rawTherapist = (apiTherapist && typeof apiTherapist === 'object' && 'name' in apiTherapist && (apiTherapist as any).name) ? apiTherapist : mockTherapist;
  const therapist = {
    ...mockTherapist,
    ...rawTherapist,
    avatarUrl: rawTherapist.avatarUrl && !rawTherapist.avatarUrl.includes('unsplash.com') ? rawTherapist.avatarUrl : "/dr_sarah_jenkins.jpg"
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <PageHeader title="My Therapist" />
        <div className="h-[400px] bg-muted rounded-[24px]"></div>
      </div>
    );
  }

  return (
    <motion.div {...pageTransition} className="max-w-5xl mx-auto space-y-8 pb-12">
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
                  (e.target as HTMLImageElement).src = "/dr_sarah_jenkins.jpg";
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
                  {therapist.rating} ({therapist.reviewCount} reviews)
                </span>
              </div>
              <p className="text-lg text-primary font-medium">{therapist.title}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
              <div className="flex items-center gap-2 bg-muted/60 px-3.5 py-1.5 rounded-xl font-medium text-foreground">
                <GraduationCap className="w-4 h-4 text-primary" />
                {therapist.yearsOfExperience} Years Experience
              </div>
              <div className="flex items-center gap-2 bg-muted/60 px-3.5 py-1.5 rounded-xl font-medium text-foreground">
                <UserCheck className="w-4 h-4 text-primary" />
                {therapist.sessionsCompleted}+ Sessions
              </div>
              {therapist.languages?.map((lang) => (
                <div key={lang} className="flex items-center gap-2 bg-muted/60 px-3.5 py-1.5 rounded-xl font-medium text-foreground">
                  <Globe className="w-4 h-4 text-primary" />
                  {lang}
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4 border-t border-border/60">
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="hex-button-primary flex-1 sm:flex-none gap-2 px-6 py-2.5 cursor-pointer"
              >
                <Video className="w-4 h-4" /> Book Session
              </button>
              <Link href="/messages" className="hex-button-secondary flex-1 sm:flex-none gap-2 px-6 py-2.5">
                <Mail className="w-4 h-4" /> Send Message
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Full Profile Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left / Main Column (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Biography */}
          <div className="hex-card !p-8 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2.5 text-foreground border-b border-border/60 pb-3">
              <HeartPulse className="w-5 h-5 text-primary" /> About {therapist.name}
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base">
              {therapist.bio}
            </p>
          </div>

          {/* Clinical Approach */}
          <div className="hex-card !p-8 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2.5 text-foreground border-b border-border/60 pb-3">
              <BookOpen className="w-5 h-5 text-primary" /> Therapeutic Approach & Methodology
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base">
              {therapist.approach}
            </p>
          </div>

          {/* Specializations & Modalities */}
          <div className="hex-card !p-8 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2.5 text-foreground border-b border-border/60 pb-3">
              <Award className="w-5 h-5 text-primary" /> Specializations & Clinical Focus
            </h3>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {therapist.specializations?.map((spec) => (
                <span key={spec} className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-semibold border border-primary/20">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Education & Qualifications */}
          <div className="hex-card !p-8 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2.5 text-foreground border-b border-border/60 pb-3">
              <GraduationCap className="w-5 h-5 text-primary" /> Education & Degrees
            </h3>
            <div className="space-y-3 pt-1">
              {therapist.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start bg-muted/40 p-4 rounded-xl border border-border/40">
                  <div>
                    <h4 className="font-semibold text-foreground text-base">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  </div>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-md">
                    {edu.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (1 col) */}
        <div className="space-y-8">
          {/* Quick Info & Schedule */}
          <div className="hex-card !p-6 space-y-5">
            <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3">
              Practice Information
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs uppercase font-bold text-muted-foreground block">Location</span>
                  <span className="text-foreground font-medium">{therapist.location}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs uppercase font-bold text-muted-foreground block">Hours of Practice</span>
                  <span className="text-foreground font-medium">{therapist.availability}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs uppercase font-bold text-muted-foreground block">Languages Spoken</span>
                  <span className="text-foreground font-medium">{therapist.languages.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="hex-card !p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3">
              Board Certifications
            </h3>
            <ul className="space-y-3">
              {therapist.certifications.map((cert, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs font-medium text-foreground bg-muted/30 p-3 rounded-lg border border-border/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Reviews Summary */}
          <div className="hex-card !p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3">
              Client Feedback
            </h3>
            <div className="text-center p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-2">
              <div className="text-3xl font-extrabold text-foreground">{therapist.rating}</div>
              <div className="flex gap-1 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Based on {therapist.reviewCount} verified client reviews</p>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
              Request to change therapist
            </button>
          </div>
        </div>

      </div>

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



