import { useState, useEffect } from "react";
import { 
  Activity, 
  Clock, 
  Sparkles, 
  Search, 
  Brain, 
  Heart, 
  Wind, 
  Smile, 
  Play,
  Repeat,
  BookOpen,
  Info,
  Check,
  Lock,
  Eye,
  Share2,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { ActivityGamePlayer } from "@/components/activity-game-player";
import { audioEngine } from "../panels/admin/activities/utils/therapeuticAudioEngine";
import { cn } from "@/lib/utils";
import { getUserActivities } from "@/lib/client-store";
import { getClientAuth } from "@/lib/auth";

export interface ClientAssignment {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  frequency: string;
  timeOfDay?: string;
}

export interface ActivityItem {
  id: number | string;
  _id?: string;
  name?: string;
  title: string;
  description: string;
  categoryTag?: string;
  category: "MINDFULNESS" | "CBT" | "GRATITUDE" | "BREATHING" | "SOMATIC" | string;
  difficulty?: "Easy" | "Medium" | "Hard" | string;
  duration?: string;
  repeat?: string;
  dueDate?: string;
  imageUrl?: string;
  status?: "pending" | "completed" | string;
  isPrivate?: boolean;
  sharingPreference?: "full" | "private" | string;
  instructions?: string;
  howItHelps?: string;
  benefits?: string[];
  filePath?: string;
  templateId?: string;
  isVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  assignedTo?: string[];
  clientAssignments?: ClientAssignment[];
  assignedClientName?: string;
  assignedClientEmail?: string;
  assignedTherapistName?: string;
  assignedTherapistId?: string;
  assignedTherapistEmail?: string;
  assignedInfo?: string;
  frequency?: string;
  timeOfDay?: string;
  [key: string]: any;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    "id": "ACT-01",
    "_id": "ACT-01",
    "name": "Diaphragmatic Breathing",
    "title": "Diaphragmatic Breathing",
    "categoryTag": "BREATHING",
    "category": "BREATHING",
    "duration": "5-10 minutes",
    "difficulty": "Easy",
    "repeat": "Daily",
    "frequency": "Daily",
    "timeOfDay": "Morning (8:00 AM)",
    "dueDate": "Today",
    "description": "Deep belly breathing technique to reduce stress and anxiety naturally.",
    "howItHelps": "Deep belly breathing technique to reduce stress and anxiety naturally.",
    "benefits": [
      "Reduces Stress",
      "Improves Focus",
      "Enhances Relaxation"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    "filePath": "src/activities/templates/MoodLiftActivity.tsx",
    "templateId": "ACT-01",
    "assignedClientName": "Sarah Jenkins",
    "assignedTherapistName": "Dr. Alex Harrison",
    "assignedInfo": "Sarah Jenkins • Daily",
    "assignedTo": [
      "Sarah Jenkins"
    ],
    "clientAssignments": [
      {
        "clientName": "Sarah Jenkins",
        "frequency": "Daily",
        "timeOfDay": "Morning (8:00 AM)"
      }
    ],
    "isVisible": true,
    "instructions": "Deep belly breathing technique to reduce stress and anxiety naturally.\n\nClinical Benefits:\n• Reduces Stress\n• Improves Focus\n• Enhances Relaxation",
    "createdAt": "2026-10-02T06:00:13.370Z",
    "updatedAt": "2026-10-02T06:00:13.370Z"
  },
  {
    "id": "ACT-02",
    "_id": "ACT-02",
    "name": "Box Breathing",
    "title": "Box Breathing",
    "categoryTag": "BREATHING",
    "category": "BREATHING",
    "duration": "4-8 minutes",
    "difficulty": "Easy",
    "repeat": "2-3 Times / Week",
    "frequency": "2-3 Times / Week",
    "timeOfDay": "Evening (7:00 PM)",
    "dueDate": "Today",
    "description": "Navy SEAL breathing technique for staying calm under pressure with 4-4-4-4 pattern.",
    "howItHelps": "Navy SEAL breathing technique for staying calm under pressure with 4-4-4-4 pattern.",
    "benefits": [
      "Calms Mind",
      "Reduces Anxiety",
      "Improves Concentration"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80",
    "filePath": "src/activities/templates/MoodLiftActivity.tsx",
    "templateId": "ACT-02",
    "assignedClientName": "Emily Rodriguez",
    "assignedTherapistName": "Dr. Elena Rostova",
    "assignedInfo": "Emily Rodriguez • 2-3 Times / Week",
    "assignedTo": [
      "Emily Rodriguez"
    ],
    "clientAssignments": [
      {
        "clientName": "Emily Rodriguez",
        "frequency": "2-3 Times / Week",
        "timeOfDay": "Morning (8:00 AM)"
      }
    ],
    "isVisible": true,
    "instructions": "Navy SEAL breathing technique for staying calm under pressure with 4-4-4-4 pattern.\n\nClinical Benefits:\n• Calms Mind\n• Reduces Anxiety\n• Improves Concentration",
    "createdAt": "2026-10-02T06:00:13.370Z",
    "updatedAt": "2026-10-02T06:00:13.370Z"
  },
  {
    "id": "ACT-03",
    "_id": "ACT-03",
    "name": "4-7-8 Breathing",
    "title": "4-7-8 Breathing",
    "categoryTag": "BREATHING",
    "category": "BREATHING",
    "duration": "2-3 minutes",
    "difficulty": "Easy",
    "repeat": "As Needed",
    "frequency": "As Needed (PRN)",
    "timeOfDay": "Afternoon (1:00 PM)",
    "dueDate": "Today",
    "description": "The famous 4-7-8 breathing technique popularized by Dr. Andrew Weil is a simple yet powerful method for anxiety relief and better sleep. By following the pattern of inhale for 4 seconds, hold for 7 seconds, and exhale for 8 seconds, you activate your parasympathetic nervous system and experience deep relaxation.",
    "howItHelps": "The famous 4-7-8 breathing technique popularized by Dr. Andrew Weil is a simple yet powerful method for anxiety relief and better sleep. By following the pattern of inhale for 4 seconds, hold for 7 seconds, and exhale for 8 seconds, you activate your parasympathetic nervous system and experience deep relaxation.",
    "benefits": [
      "Promotes Better Sleep",
      "Reduces Anxiety",
      "Calms the Nervous System"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=800&q=80",
    "filePath": "src/activities/templates/MoodLiftActivity.tsx",
    "templateId": "ACT-03",
    "assignedClientName": "Amanda Miller",
    "assignedTherapistName": "Marcus Vance",
    "assignedInfo": "Amanda Miller • As Needed",
    "assignedTo": [
      "Amanda Miller"
    ],
    "clientAssignments": [
      {
        "clientName": "Amanda Miller",
        "frequency": "2-3 Times / Week",
        "timeOfDay": "Morning (8:00 AM)"
      }
    ],
    "isVisible": true,
    "instructions": "The famous 4-7-8 breathing technique popularized by Dr. Andrew Weil is a simple yet powerful method for anxiety relief and better sleep. By following the pattern of inhale for 4 seconds, hold for 7 seconds, and exhale for 8 seconds, you activate your parasympathetic nervous system and experience deep relaxation.\n\nClinical Benefits:\n• Promotes Better Sleep\n• Reduces Anxiety\n• Calms the Nervous System",
    "createdAt": "2026-10-02T06:00:13.370Z",
    "updatedAt": "2026-10-02T06:00:13.370Z"
  },
  {
    "id": "ACT-04",
    "_id": "ACT-04",
    "name": "Alternate Nostril Breathing",
    "title": "Alternate Nostril Breathing",
    "categoryTag": "BREATHING",
    "category": "BREATHING",
    "duration": "5-10 minutes",
    "difficulty": "Easy",
    "repeat": "Daily",
    "frequency": "Daily",
    "timeOfDay": "Any Time",
    "dueDate": "Today",
    "description": "This ancient yogic breathing technique alternates airflow between nostrils to balance the left and right brain hemispheres. By harmonizing your nervous system, it reduces stress, improves focus, and creates a profound sense of calm and mental clarity.",
    "howItHelps": "This ancient yogic breathing technique alternates airflow between nostrils to balance the left and right brain hemispheres. By harmonizing your nervous system, it reduces stress, improves focus, and creates a profound sense of calm and mental clarity.",
    "benefits": [
      "Balances Brain Hemispheres",
      "Promotes Deep Relaxation",
      "Enhances Mental Clarity"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    "filePath": "src/activities/templates/MoodLiftActivity.tsx",
    "templateId": "ACT-04",
    "assignedClientName": "Robert Garcia",
    "assignedTherapistName": "Dr. Sophia Bennett",
    "assignedInfo": "Robert Garcia • Daily",
    "assignedTo": [
      "Robert Garcia"
    ],
    "clientAssignments": [
      {
        "clientName": "Robert Garcia",
        "frequency": "Daily",
        "timeOfDay": "Morning (8:00 AM)"
      }
    ],
    "isVisible": true,
    "instructions": "This ancient yogic breathing technique alternates airflow between nostrils to balance the left and right brain hemispheres. By harmonizing your nervous system, it reduces stress, improves focus, and creates a profound sense of calm and mental clarity.\n\nClinical Benefits:\n• Balances Brain Hemispheres\n• Promotes Deep Relaxation\n• Enhances Mental Clarity",
    "createdAt": "2026-10-02T06:00:13.370Z",
    "updatedAt": "2026-10-02T06:00:13.370Z"
  },
  {
    "id": "ACT-05",
    "_id": "ACT-05",
    "name": "Describe Your Room",
    "title": "Describe Your Room",
    "categoryTag": "MINDFULNESS",
    "category": "MINDFULNESS",
    "duration": "1-2 minutes",
    "difficulty": "Easy",
    "repeat": "2-3 Times / Week",
    "frequency": "2-3 Times / Week",
    "timeOfDay": "Morning (8:00 AM)",
    "dueDate": "Today",
    "description": "Use mindfulness to anchor yourself in the present moment by describing your surroundings in detail. This grounding technique helps redirect anxious thoughts and brings you into the here-and-now through sensory awareness.",
    "howItHelps": "Use mindfulness to anchor yourself in the present moment by describing your surroundings in detail. This grounding technique helps redirect anxious thoughts and brings you into the here-and-now through sensory awareness.",
    "benefits": [
      "Improves Presence",
      "Grounds in Reality",
      "Enhances Sensory Awareness"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    "filePath": "src/activities/templates/MoodLiftActivity.tsx",
    "templateId": "ACT-05",
    "assignedClientName": "Michael Chen",
    "assignedTherapistName": "Dr. Alex Harrison",
    "assignedInfo": "Michael Chen • 2-3 Times / Week",
    "assignedTo": [
      "Michael Chen"
    ],
    "clientAssignments": [
      {
        "clientName": "Michael Chen",
        "frequency": "2-3 Times / Week",
        "timeOfDay": "Morning (8:00 AM)"
      }
    ],
    "isVisible": true,
    "instructions": "Use mindfulness to anchor yourself in the present moment by describing your surroundings in detail. This grounding technique helps redirect anxious thoughts and brings you into the here-and-now through sensory awareness.\n\nClinical Benefits:\n• Improves Presence\n• Grounds in Reality\n• Enhances Sensory Awareness",
    "createdAt": "2026-10-02T06:00:13.370Z",
    "updatedAt": "2026-10-02T06:00:13.370Z"
  },
  {
    "id": "ACT-06",
    "_id": "ACT-06",
    "name": "Name the Moment",
    "title": "Name the Moment",
    "categoryTag": "MINDFULNESS",
    "category": "MINDFULNESS",
    "duration": "2-3 minutes",
    "difficulty": "Easy",
    "repeat": "As Needed",
    "frequency": "As Needed (PRN)",
    "timeOfDay": "Evening (7:00 PM)",
    "dueDate": "Today",
    "description": "This guided self-reassurance exercise helps you acknowledge difficult emotions with kindness and compassion. By speaking affirmations and reassurances to yourself, you rewire your nervous system to respond to stress with self-support instead of self-criticism, building lasting emotional resilience.",
    "howItHelps": "This guided self-reassurance exercise helps you acknowledge difficult emotions with kindness and compassion. By speaking affirmations and reassurances to yourself, you rewire your nervous system to respond to stress with self-support instead of self-criticism, building lasting emotional resilience.",
    "benefits": [
      "Builds Self-Compassion",
      "Reduces Emotional Overwhelm",
      "Strengthens Inner Resilience"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80",
    "filePath": "src/activities/templates/MoodLiftActivity.tsx",
    "templateId": "ACT-06",
    "assignedClientName": "David Kim",
    "assignedTherapistName": "Dr. Evelyn Reed",
    "assignedInfo": "David Kim • As Needed",
    "assignedTo": [
      "David Kim"
    ],
    "clientAssignments": [
      {
        "clientName": "David Kim",
        "frequency": "2-3 Times / Week",
        "timeOfDay": "Morning (8:00 AM)"
      }
    ],
    "isVisible": true,
    "instructions": "This guided self-reassurance exercise helps you acknowledge difficult emotions with kindness and compassion. By speaking affirmations and reassurances to yourself, you rewire your nervous system to respond to stress with self-support instead of self-criticism, building lasting emotional resilience.\n\nClinical Benefits:\n• Builds Self-Compassion\n• Reduces Emotional Overwhelm\n• Strengthens Inner Resilience",
    "createdAt": "2026-10-02T06:00:13.370Z",
    "updatedAt": "2026-10-02T06:00:13.370Z"
  },
  {
    "id": "ACT-07",
    "_id": "ACT-07",
    "name": "Physical Grounding",
    "title": "Physical Grounding",
    "categoryTag": "SOMATIC",
    "category": "SOMATIC",
    "duration": "5-10 minutes",
    "difficulty": "Easy",
    "repeat": "Daily",
    "frequency": "Daily",
    "timeOfDay": "Afternoon (1:00 PM)",
    "dueDate": "Today",
    "description": "Engage your five senses through tactile and physical experiences to bring you fully into the present moment. This somatic grounding technique interrupts the stress response cycle by signaling to your nervous system that you are safe, helping you move out of fight-or-flight mode into calm awareness.",
    "howItHelps": "Engage your five senses through tactile and physical experiences to bring you fully into the present moment. This somatic grounding technique interrupts the stress response cycle by signaling to your nervous system that you are safe, helping you move out of fight-or-flight mode into calm awareness.",
    "benefits": [
      "Anchors You in Your Body",
      "Releases Trauma Responses",
      "Activates Safety Signals"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    "filePath": "src/activities/templates/MoodLiftActivity.tsx",
    "templateId": "ACT-07",
    "assignedClientName": "Rohan Mehta",
    "assignedTherapistName": "Dr. Aravind Swamy",
    "assignedInfo": "Rohan Mehta • Daily",
    "assignedTo": [
      "Rohan Mehta"
    ],
    "clientAssignments": [
      {
        "clientName": "Rohan Mehta",
        "frequency": "Daily",
        "timeOfDay": "Morning (8:00 AM)"
      }
    ],
    "isVisible": true,
    "instructions": "Engage your five senses through tactile and physical experiences to bring you fully into the present moment. This somatic grounding technique interrupts the stress response cycle by signaling to your nervous system that you are safe, helping you move out of fight-or-flight mode into calm awareness.\n\nClinical Benefits:\n• Anchors You in Your Body\n• Releases Trauma Responses\n• Activates Safety Signals",
    "createdAt": "2026-10-02T06:00:13.370Z",
    "updatedAt": "2026-10-02T06:00:13.370Z"
  },
  {
    "id": "ACT-08",
    "_id": "ACT-08",
    "name": "Posture Reset",
    "title": "Posture Reset",
    "categoryTag": "SOMATIC",
    "category": "SOMATIC",
    "duration": "1-1.5 minutes",
    "difficulty": "Easy",
    "repeat": "2-3 Times / Week",
    "frequency": "2-3 Times / Week",
    "timeOfDay": "Any Time",
    "dueDate": "Today",
    "description": "Your body and mind are deeply connected. By intentionally adjusting your posture and releasing tension through gentle movements, you signal to your nervous system that you are safe and grounded. This practice helps you reclaim your physical presence and mental clarity.",
    "howItHelps": "Your body and mind are deeply connected. By intentionally adjusting your posture and releasing tension through gentle movements, you signal to your nervous system that you are safe and grounded. This practice helps you reclaim your physical presence and mental clarity.",
    "benefits": [
      "Releases Physical Tension",
      "Improves Body Awareness",
      "Restores Natural Alignment"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=800&q=80",
    "filePath": "src/activities/templates/MoodLiftActivity.tsx",
    "templateId": "ACT-08",
    "assignedClientName": "Kavita Krishnan",
    "assignedTherapistName": "Dr. Priya Sharma",
    "assignedInfo": "Kavita Krishnan • 2-3 Times / Week",
    "assignedTo": [
      "Kavita Krishnan"
    ],
    "clientAssignments": [
      {
        "clientName": "Kavita Krishnan",
        "frequency": "2-3 Times / Week",
        "timeOfDay": "Morning (8:00 AM)"
      }
    ],
    "isVisible": true,
    "instructions": "Your body and mind are deeply connected. By intentionally adjusting your posture and releasing tension through gentle movements, you signal to your nervous system that you are safe and grounded. This practice helps you reclaim your physical presence and mental clarity.\n\nClinical Benefits:\n• Releases Physical Tension\n• Improves Body Awareness\n• Restores Natural Alignment",
    "createdAt": "2026-10-02T06:00:13.370Z",
    "updatedAt": "2026-10-02T06:00:13.370Z"
  },
  {
    "id": "ACT-09",
    "_id": "ACT-09",
    "name": "Self-Soothing",
    "title": "Self-Soothing",
    "categoryTag": "SOMATIC",
    "category": "SOMATIC",
    "duration": "5-10 minutes",
    "difficulty": "Easy",
    "repeat": "As Needed",
    "frequency": "As Needed (PRN)",
    "timeOfDay": "Morning (8:00 AM)",
    "dueDate": "Today",
    "description": "Drawing from Dialectical Behavior Therapy (DBT), this technique teaches you to soothe yourself through multisensory engagement. By intentionally activating your senses—touch, smell, taste, sight, sound—you create a safe container for emotional pain and build your capacity to tolerate distressing moments.",
    "howItHelps": "Drawing from Dialectical Behavior Therapy (DBT), this technique teaches you to soothe yourself through multisensory engagement. By intentionally activating your senses—touch, smell, taste, sight, sound—you create a safe container for emotional pain and build your capacity to tolerate distressing moments.",
    "benefits": [
      "Soothes Emotional Pain",
      "Provides Immediate Relief",
      "Builds Distress Tolerance"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    "filePath": "src/activities/templates/MoodLiftActivity.tsx",
    "templateId": "ACT-09",
    "assignedClientName": "Siddharth Verma",
    "assignedTherapistName": "Dr. David Chen",
    "assignedInfo": "Siddharth Verma • As Needed",
    "assignedTo": [
      "Siddharth Verma"
    ],
    "clientAssignments": [
      {
        "clientName": "Siddharth Verma",
        "frequency": "2-3 Times / Week",
        "timeOfDay": "Morning (8:00 AM)"
      }
    ],
    "isVisible": true,
    "instructions": "Drawing from Dialectical Behavior Therapy (DBT), this technique teaches you to soothe yourself through multisensory engagement. By intentionally activating your senses—touch, smell, taste, sight, sound—you create a safe container for emotional pain and build your capacity to tolerate distressing moments.\n\nClinical Benefits:\n• Soothes Emotional Pain\n• Provides Immediate Relief\n• Builds Distress Tolerance",
    "createdAt": "2026-10-02T06:00:13.370Z",
    "updatedAt": "2026-10-02T06:00:13.370Z"
  },
  {
    "id": "ACT-10",
    "_id": "ACT-10",
    "name": "CBT Thought-Challenger",
    "title": "CBT Thought-Challenger",
    "categoryTag": "CBT",
    "category": "CBT",
    "duration": "10-15 minutes",
    "difficulty": "Medium",
    "repeat": "Daily",
    "frequency": "Daily",
    "timeOfDay": "Evening (7:00 PM)",
    "dueDate": "Today",
    "description": "Using Cognitive Behavioral Therapy techniques, challenge automatic negative thoughts by examining the evidence for and against them. Develop balanced, realistic perspectives that reduce anxiety, low mood, and self-criticism through cognitive restructuring.",
    "howItHelps": "Using Cognitive Behavioral Therapy techniques, challenge automatic negative thoughts by examining the evidence for and against them. Develop balanced, realistic perspectives that reduce anxiety, low mood, and self-criticism through cognitive restructuring.",
    "benefits": [
      "Challenges Negative Thinking",
      "Reduces Anxiety",
      "Builds Emotional Resilience"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    "filePath": "src/activities/templates/MoodLiftActivity.tsx",
    "templateId": "ACT-10",
    "assignedClientName": "Alex Morgan",
    "assignedTherapistName": "Dr. Elena Rostova",
    "assignedInfo": "Alex Morgan • Daily",
    "assignedTo": [
      "Alex Morgan"
    ],
    "clientAssignments": [
      {
        "clientName": "Alex Morgan",
        "frequency": "Daily",
        "timeOfDay": "Morning (8:00 AM)"
      }
    ],
    "isVisible": true,
    "instructions": "Using Cognitive Behavioral Therapy techniques, challenge automatic negative thoughts by examining the evidence for and against them. Develop balanced, realistic perspectives that reduce anxiety, low mood, and self-criticism through cognitive restructuring.\n\nClinical Benefits:\n• Challenges Negative Thinking\n• Reduces Anxiety\n• Builds Emotional Resilience",
    "createdAt": "2026-10-02T06:00:13.370Z",
    "updatedAt": "2026-10-02T06:00:13.370Z"
  },
  {
    "id": "ACT-11",
    "_id": "ACT-11",
    "name": "Affirmation Mirror",
    "title": "Affirmation Mirror",
    "categoryTag": "GRATITUDE",
    "category": "GRATITUDE",
    "duration": "5-10 minutes",
    "difficulty": "Easy",
    "repeat": "2-3 Times / Week",
    "frequency": "2-3 Times / Week",
    "timeOfDay": "Afternoon (1:00 PM)",
    "dueDate": "Today",
    "description": "Transform negative self-talk into powerful, personalized affirmations that rewire your brain toward self-compassion. By mirroring empowering statements back to yourself, you create new neural pathways that support lasting confidence, resilience, and emotional wellbeing.",
    "howItHelps": "Transform negative self-talk into powerful, personalized affirmations that rewire your brain toward self-compassion. By mirroring empowering statements back to yourself, you create new neural pathways that support lasting confidence, resilience, and emotional wellbeing.",
    "benefits": [
      "Boosts Self-Esteem",
      "Builds Self-Compassion",
      "Reduces Negative Self-Talk"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    "filePath": "src/activities/templates/MoodLiftActivity.tsx",
    "templateId": "ACT-11",
    "assignedClientName": "Sarah Jenkins",
    "assignedTherapistName": "Marcus Vance",
    "assignedInfo": "Sarah Jenkins • 2-3 Times / Week",
    "assignedTo": [
      "Sarah Jenkins"
    ],
    "clientAssignments": [
      {
        "clientName": "Sarah Jenkins",
        "frequency": "2-3 Times / Week",
        "timeOfDay": "Morning (8:00 AM)"
      }
    ],
    "isVisible": true,
    "instructions": "Transform negative self-talk into powerful, personalized affirmations that rewire your brain toward self-compassion. By mirroring empowering statements back to yourself, you create new neural pathways that support lasting confidence, resilience, and emotional wellbeing.\n\nClinical Benefits:\n• Boosts Self-Esteem\n• Builds Self-Compassion\n• Reduces Negative Self-Talk",
    "createdAt": "2026-10-02T06:00:13.370Z",
    "updatedAt": "2026-10-02T06:00:13.370Z"
  },
  {
    "id": "ACT-12",
    "_id": "ACT-12",
    "name": "Worry Box",
    "title": "Worry Box",
    "categoryTag": "CBT",
    "category": "CBT",
    "duration": "3-5 minutes",
    "difficulty": "Easy",
    "repeat": "As Needed",
    "frequency": "As Needed (PRN)",
    "timeOfDay": "Any Time",
    "dueDate": "Today",
    "description": "Externalize your worries by placing them somewhere safe—outside your mind. This CBT-based technique helps your brain interpret the worry as \"stored and contained,\" reducing its emotional intensity. When worries feel infinite in your head, simply writing them down and placing them away creates essential psychological distance.",
    "howItHelps": "Externalize your worries by placing them somewhere safe—outside your mind. This CBT-based technique helps your brain interpret the worry as \"stored and contained,\" reducing its emotional intensity. When worries feel infinite in your head, simply writing them down and placing them away creates essential psychological distance.",
    "benefits": [
      "Reduces Mental Clutter",
      "Prevents Rumination",
      "Increases Emotional Control"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80",
    "filePath": "src/activities/templates/MoodLiftActivity.tsx",
    "templateId": "ACT-12",
    "assignedClientName": "Emily Rodriguez",
    "assignedTherapistName": "Dr. Sophia Bennett",
    "assignedInfo": "Emily Rodriguez • As Needed",
    "assignedTo": [
      "Emily Rodriguez"
    ],
    "clientAssignments": [
      {
        "clientName": "Emily Rodriguez",
        "frequency": "2-3 Times / Week",
        "timeOfDay": "Morning (8:00 AM)"
      }
    ],
    "isVisible": true,
    "instructions": "Externalize your worries by placing them somewhere safe—outside your mind. This CBT-based technique helps your brain interpret the worry as \"stored and contained,\" reducing its emotional intensity. When worries feel infinite in your head, simply writing them down and placing them away creates essential psychological distance.\n\nClinical Benefits:\n• Reduces Mental Clutter\n• Prevents Rumination\n• Increases Emotional Control",
    "createdAt": "2026-10-02T06:00:13.370Z",
    "updatedAt": "2026-10-02T06:00:13.370Z"
  },
  {
    "id": "ACT-13",
    "_id": "ACT-13",
    "name": "Cognitive Grounding",
    "title": "Cognitive Grounding",
    "categoryTag": "MINDFULNESS",
    "category": "MINDFULNESS",
    "duration": "5-10 minutes",
    "difficulty": "Easy",
    "repeat": "Daily",
    "frequency": "Daily",
    "timeOfDay": "Morning (8:00 AM)",
    "dueDate": "Today",
    "description": "Engage your mind with focused mental exercises like counting, naming, and sensory grounding to shift attention away from worry and anchor you in the present.",
    "howItHelps": "Engage your mind with focused mental exercises like counting, naming, and sensory grounding to shift attention away from worry and anchor you in the present.",
    "benefits": [
      "Interrupts Anxiety",
      "Sharpens Focus",
      "Grounds in Present"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    "filePath": "src/activities/templates/MoodLiftActivity.tsx",
    "templateId": "ACT-13",
    "assignedClientName": "Amanda Miller",
    "assignedTherapistName": "Dr. Alex Harrison",
    "assignedInfo": "Amanda Miller • Daily",
    "assignedTo": [
      "Amanda Miller"
    ],
    "clientAssignments": [
      {
        "clientName": "Amanda Miller",
        "frequency": "Daily",
        "timeOfDay": "Morning (8:00 AM)"
      }
    ],
    "isVisible": true,
    "instructions": "Engage your mind with focused mental exercises like counting, naming, and sensory grounding to shift attention away from worry and anchor you in the present.\n\nClinical Benefits:\n• Interrupts Anxiety\n• Sharpens Focus\n• Grounds in Present",
    "createdAt": "2026-10-02T06:00:13.370Z",
    "updatedAt": "2026-10-02T06:00:13.370Z"
  }
];

const CATEGORIES = ["All", "MINDFULNESS", "CBT", "GRATITUDE", "BREATHING", "SOMATIC", "EXPOSURE", "BEHAVIORAL"];

export default function ActivitiesPage() {
  const { toast } = useToast();
  const authUser = getClientAuth();
  const myName = authUser?.name || "Client User";
  const myEmail = (authUser?.email || "").toLowerCase().trim();
  const myTherapistName = authUser?.assignedTherapistName || "Assigned Therapist";

  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [assignedNotifs, setAssignedNotifs] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Preview / Game Modal State
  const [activeActivity, setActiveActivity] = useState<ActivityItem | null>(null);
  const [previewTab, setPreviewTab] = useState<"game" | "instructions">("game");

  // Post-Activity Privacy & Sharing Selection Dialog State
  const [completedActivityToReview, setCompletedActivityToReview] = useState<{
    activity: ActivityItem;
    data?: any;
  } | null>(null);
  const [sharingChoice, setSharingChoice] = useState<"full" | "private">("full");

  // Load activities from MongoDB Atlas API & Notifications & localStorage
  useEffect(() => {
    let isMounted = true;
    async function loadActivities() {
      try {
        const [actRes, notifRes] = await Promise.all([
          fetch("/api/activities").catch(() => null),
          fetch(`/api/notifications?role=CLIENT&recipientEmail=${encodeURIComponent(myEmail)}`).catch(() => null)
        ]);

        let notifList: any[] = [];
        if (notifRes && notifRes.ok) {
          const notifData = await notifRes.json().catch(() => null);
          if (Array.isArray(notifData?.notifications)) {
            notifList = notifData.notifications.filter((n: any) => {
              const isAssignedType = n.type === 'ACTIVITY_ASSIGNED' || n.type === 'activity';
              const rEmail = String(n.recipientEmail || n.clientEmail || '').toLowerCase().trim();
              const rName = String(n.clientName || n.recipientName || '').toLowerCase().trim();
              const matchesMe = !rEmail || rEmail === myEmail || (myName && (rName.includes(myName.toLowerCase()) || myName.toLowerCase().includes(rName)));
              return isAssignedType && matchesMe;
            });
          }
        }

        if (notifList.length === 0) {
          try {
            const raw = localStorage.getItem('notifications') || localStorage.getItem('user_notifications');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                notifList = parsed.filter((n: any) => n.type === 'ACTIVITY_ASSIGNED');
              }
            }
          } catch {}
        }

        if (isMounted) {
          setAssignedNotifs(notifList);
        }

        let rawActivities: any[] = [];
        if (actRes && actRes.ok) {
          const data = await actRes.json().catch(() => null);
          rawActivities = Array.isArray(data?.activities) ? data.activities : [];
        }

        const formatted: ActivityItem[] = (rawActivities.length > 0 ? rawActivities : INITIAL_ACTIVITIES).map((a: any, idx: number) => ({
          id: a.id || a._id || idx + 1,
          title: a.title || a.name || "Clinical Activity",
          description: a.description || "Guided therapeutic session.",
          category: (a.categoryTag || a.category || "MINDFULNESS").toUpperCase(),
          difficulty: a.difficulty || "Easy",
          duration: a.duration || "10 min",
          dueDate: a.dueDate || "Today",
          imageUrl: a.imageUrl || a.image || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
          status: a.status || "pending",
          instructions: a.instructions || a.description || "",
          assignedTo: Array.isArray(a.assignedTo) ? a.assignedTo : a.assignedTo ? [a.assignedTo] : [],
          clientAssignments: Array.isArray(a.clientAssignments) ? a.clientAssignments : [],
          assignedClientName: a.assignedClientName,
          assignedClientEmail: a.assignedClientEmail,
          assignedTherapistName: a.assignedTherapistName || myTherapistName,
          assignedTherapistId: a.assignedTherapistId,
          frequency: a.repeat || a.frequency || "Daily",
          timeOfDay: a.timeOfDay || "Morning (8:00 AM)"
        }));

        const titleMap = new Map<string, ActivityItem>();
        INITIAL_ACTIVITIES.forEach(init => {
          titleMap.set(init.title.toLowerCase().trim(), { ...init });
        });
        formatted.forEach(item => {
          titleMap.set(item.title.toLowerCase().trim(), { ...titleMap.get(item.title.toLowerCase().trim()), ...item });
        });

        // Merge and mark activities from assignment notifications
        notifList.forEach(notif => {
          const nTitle = String(notif.activityTitle || notif.title || '')
            .replace(/⚡/g, '')
            .replace(/New Activity Assigned:\s*/i, '')
            .trim();
          const nId = String(notif.activityId || notif.id || '');
          const lowerNTitle = nTitle.toLowerCase();

          let matchedItem: ActivityItem | undefined;
          for (const [key, item] of titleMap.entries()) {
            if (String(item.id) === nId || key === lowerNTitle || (lowerNTitle && (key.includes(lowerNTitle) || lowerNTitle.includes(key)))) {
              matchedItem = item;
              break;
            }
          }

          if (matchedItem) {
            matchedItem.assignedTo = Array.from(new Set([...(matchedItem.assignedTo || []), myName]));
            matchedItem.clientAssignments = [
              ...(matchedItem.clientAssignments || []).filter((ca: any) => String(ca.clientEmail || '').toLowerCase() !== myEmail),
              {
                clientName: myName,
                clientEmail: myEmail,
                frequency: notif.frequency || matchedItem.frequency || 'Daily',
                timeOfDay: notif.timeOfDay || matchedItem.timeOfDay || 'Morning (8:00 AM)'
              }
            ];
            matchedItem.frequency = notif.frequency || matchedItem.frequency || 'Daily';
            matchedItem.timeOfDay = notif.timeOfDay || matchedItem.timeOfDay || 'Morning (8:00 AM)';
            if (notif.consultantName) {
              matchedItem.assignedTherapistName = notif.consultantName;
            }
          } else if (nTitle) {
            const newAct: ActivityItem = {
              id: notif.activityId || `ACT-${Date.now()}`,
              title: nTitle,
              description: notif.message || 'Guided therapeutic exercise assigned by your consultant.',
              category: (notif.category || 'MINDFULNESS').toUpperCase(),
              difficulty: 'Easy',
              duration: notif.duration || '10 min',
              dueDate: 'Today',
              imageUrl: notif.imageUrl || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
              status: 'pending',
              assignedTo: [myName],
              clientAssignments: [{
                clientName: myName,
                clientEmail: myEmail,
                frequency: notif.frequency || 'Daily',
                timeOfDay: notif.timeOfDay || 'Morning (8:00 AM)'
              }],
              assignedTherapistName: notif.consultantName || myTherapistName,
              frequency: notif.frequency || 'Daily',
              timeOfDay: notif.timeOfDay || 'Morning (8:00 AM)'
            };
            titleMap.set(nTitle.toLowerCase(), newAct);
          }
        });

        if (isMounted) {
          setActivities(Array.from(titleMap.values()));
        }
      } catch (err) {
        console.error("Failed to load activities:", err);
      }
    }

    loadActivities();
    const interval = setInterval(loadActivities, 10000);
    window.addEventListener('notification_created', loadActivities);
    window.addEventListener('client_data_updated', loadActivities);
    window.addEventListener('auth_state_change', loadActivities);
    window.addEventListener('storage', loadActivities);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('notification_created', loadActivities);
      window.removeEventListener('client_data_updated', loadActivities);
      window.removeEventListener('auth_state_change', loadActivities);
      window.removeEventListener('storage', loadActivities);
    };
  }, [myName, myEmail, myTherapistName]);

  const handlePreviewActivity = (act: ActivityItem) => {
    setActiveActivity(act);
    setPreviewTab("game");
  };

  const handleActivityCompleted = (submissionData?: any) => {
    if (!activeActivity) return;
    const current = activeActivity;
    setActiveActivity(null);
    setCompletedActivityToReview({ activity: current, data: submissionData });
    setSharingChoice("full");
  };

  const handleConfirmPrivacyAndSave = async () => {
    if (!completedActivityToReview) return;
    const { activity, data } = completedActivityToReview;
    const isPrivate = sharingChoice === "private";

    // Play clinical completion audio
    try {
      audioEngine.playSuccess();
    } catch {}

    // Update local activities state
    setActivities(prev =>
      prev.map(a =>
        String(a.id) === String(activity.id)
          ? {
              ...a,
              status: "completed",
              isPrivate,
              sharingPreference: sharingChoice,
              completedAt: new Date().toISOString()
            }
          : a
      )
    );

    // Persist to local completed activities log
    try {
      const existingLogs = JSON.parse(localStorage.getItem("completed_activities_log") || "[]");
      const newEntry = {
        id: `COMP-${Date.now()}`,
        activityId: activity.id,
        activityTitle: activity.title,
        clientName: myName,
        clientEmail: myEmail,
        consultantName: activity.assignedTherapistName || myTherapistName,
        sharingPreference: sharingChoice,
        isPrivate,
        completedAt: new Date().toISOString(),
        submissionData: isPrivate ? null : data
      };
      localStorage.setItem("completed_activities_log", JSON.stringify([newEntry, ...existingLogs]));
      window.dispatchEvent(new Event("client_data_updated"));
    } catch (err) {
      console.error("Failed to save completed activity log:", err);
    }

    // Send notification to consultant / system
    try {
      const notifPayload = {
        recipientEmail: activity.assignedTherapistEmail || undefined,
        recipientName: activity.assignedTherapistName || myTherapistName,
        clientName: myName,
        clientEmail: myEmail,
        title: isPrivate 
          ? `Task Completed: ${activity.title}`
          : `Activity Completed with Insights: ${activity.title}`,
        message: isPrivate
          ? `${myName} completed the activity "${activity.title}". Detailed clinical responses were kept private by the client.`
          : `${myName} completed "${activity.title}" and shared detailed results, scores, and reflection notes.`,
        type: "ACTIVITY_COMPLETED",
        activityId: activity.id,
        activityTitle: activity.title,
        isPrivate,
        sharingPreference: sharingChoice,
        timestamp: new Date().toISOString()
      };

      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifPayload)
      }).catch(() => {});

      const existingNotifs = JSON.parse(localStorage.getItem("user_notifications") || "[]");
      localStorage.setItem("user_notifications", JSON.stringify([notifPayload, ...existingNotifs]));
      window.dispatchEvent(new Event("notification_created"));
    } catch {}

    // Show toast
    if (isPrivate) {
      toast({
        title: "Activity Completed (Private)",
        description: `Your results remain private to you. ${activity.assignedTherapistName || myTherapistName || "Your consultant"} was notified that the task is completed.`,
      });
    } else {
      toast({
        title: "Activity Completed & Shared",
        description: `Full results and reflection metrics were shared with ${activity.assignedTherapistName || myTherapistName || "your consultant"}.`,
      });
    }

    setCompletedActivityToReview(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "MINDFULNESS":
        return <Brain className="w-3.5 h-3.5" />;
      case "CBT":
        return <Sparkles className="w-3.5 h-3.5" />;
      case "GRATITUDE":
        return <Heart className="w-3.5 h-3.5" />;
      case "BREATHING":
        return <Wind className="w-3.5 h-3.5" />;
      case "SOMATIC":
        return <Smile className="w-3.5 h-3.5" />;
      default:
        return <Activity className="w-3.5 h-3.5" />;
    }
  };

  // Determine if activity is assigned to this client
  const isAssignedToMe = (act: ActivityItem): boolean => {
    // 1. Check clientAssignments
    if (Array.isArray(act.clientAssignments) && act.clientAssignments.length > 0) {
      const found = act.clientAssignments.some((ca: any) => {
        const caName = String(ca.clientName || ca.name || "").toLowerCase().trim();
        const caEmail = String(ca.clientEmail || ca.email || "").toLowerCase().trim();
        const caId = String(ca.clientId || ca.id || "").trim();
        return (
          (myEmail && caEmail === myEmail) ||
          (myName && (caName.includes(myName.toLowerCase()) || myName.toLowerCase().includes(caName))) ||
          (authUser?.id && caId === authUser.id)
        );
      });
      if (found) return true;
    }

    // 2. Check assignedTo
    if (Array.isArray(act.assignedTo) && act.assignedTo.length > 0) {
      const found = act.assignedTo.some((name: string) => {
        const clean = String(name).toLowerCase().trim();
        return (
          (myName && (clean.includes(myName.toLowerCase()) || myName.toLowerCase().includes(clean))) ||
          (myEmail && clean === myEmail)
        );
      });
      if (found) return true;
    }

    // 3. Check direct assignedClientName / Email
    const directName = String(act.assignedClientName || "").toLowerCase().trim();
    const directEmail = String(act.assignedClientEmail || "").toLowerCase().trim();
    if ((myName && directName.includes(myName.toLowerCase())) || (myEmail && directEmail === myEmail)) {
      return true;
    }

    // 4. Check assigned notifications list
    if (assignedNotifs.length > 0) {
      const actTitle = act.title.toLowerCase().trim();
      const actId = String(act.id);
      const foundInNotif = assignedNotifs.some((n: any) => {
        const nTitle = String(n.activityTitle || n.title || '')
          .replace(/⚡/g, '')
          .replace(/New Activity Assigned:\s*/i, '')
          .trim()
          .toLowerCase();
        const nId = String(n.activityId || n.id || '');
        return (nId && nId === actId) || (nTitle && (nTitle === actTitle || nTitle.includes(actTitle) || actTitle.includes(nTitle)));
      });
      if (foundInNotif) return true;
    }

    return false;
  };

  const assignedActivities = activities.filter(isAssignedToMe);

  const filteredAllActivities = activities.filter((act) => {
    const matchesCategory =
      selectedCategory === "All"
        ? true
        : act.category === selectedCategory;

    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-10 pb-16 font-['Plus_Jakarta_Sans']">
      <PageHeader
        title="Activities Library"
        description="Explore therapeutic exercises, guided meditations, and interactive mental health activities."
        badge="MY ACTIVITIES"
        icon={<Activity className="w-4 h-4 text-purple-200" />}
      />

      {/* ─────────────────────────────────────────────────────────────
          1st: THERAPIST RECOMMENDATION / ASSIGNED BY THERAPIST
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5e2be2]/10 text-[#5e2be2] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-[#5e2be2]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Therapist Recommendations
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Clinical exercises prescribed specifically for you by <span className="text-[#5e2be2] font-semibold">{myTherapistName}</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-[#5e2be2] border border-purple-100">
            {assignedActivities.length} Prescribed
          </span>
        </div>

        {assignedActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedActivities.map((act) => (
              <div
                key={act.id}
                className="group bg-white rounded-3xl border border-purple-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between ring-1 ring-[#5e2be2]/10"
              >
                {/* Top Image Container */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={act.imageUrl}
                    alt={act.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                  {/* Category Tag (Top Left) */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider text-slate-900 flex items-center gap-1.5 shadow-sm border border-white/40">
                    {getCategoryIcon(act.category)}
                    <span>{act.category}</span>
                  </div>

                  {/* Assigned Tag (Top Right) */}
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                    <div className="bg-[#5e2be2] text-white px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 shadow-md">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Therapist Recommendation</span>
                    </div>
                    {act.status === 'completed' && (
                      <div className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-md",
                        act.isPrivate 
                          ? "bg-amber-500/90 text-white border border-amber-300/40"
                          : "bg-emerald-600/90 text-white border border-emerald-300/40"
                      )}>
                        {act.isPrivate ? <Lock className="w-2.5 h-2.5" /> : <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        <span>{act.isPrivate ? "Completed (Private)" : "Completed (Shared)"}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#5e2be2] transition-colors leading-snug mb-2">
                      {act.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-3">
                      {act.description}
                    </p>
                  </div>

                  {/* Meta info & Action */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{act.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Repeat className="w-4 h-4 text-slate-400" />
                        <span>{act.frequency || "Daily"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handlePreviewActivity(act)}
                        className={cn(
                          "w-full h-11 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer shadow-md gap-2",
                          act.status === 'completed'
                            ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
                            : "bg-[#5e2be2] hover:bg-[#4f28d9] text-white shadow-purple-500/20"
                        )}
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>{act.status === 'completed' ? "Practice Again" : "Start Prescribed Activity"}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 text-center">
            <p className="text-slate-500 font-medium text-sm">No therapist activities currently assigned. Explore the full library below!</p>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2nd: ALL ACTIVITIES (FULL LIBRARY)
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-5 pt-4 border-t border-slate-100 dark:border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              All Activities
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Explore and practice guided therapeutic exercises from the clinical library
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white border-slate-200 text-xs focus:ring-2 focus:ring-[#5e2be2]/20"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={
                  isActive
                    ? "bg-[#5e2be2] text-white shadow-md shadow-purple-500/20 rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                }
              >
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* All Activities Cards Grid */}
        {filteredAllActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAllActivities.map((act) => {
              const isRecommended = isAssignedToMe(act);
              return (
                <div
                  key={act.id}
                  className={cn(
                    "group bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between",
                    isRecommended ? "border-purple-200/90 ring-1 ring-purple-100" : "border-slate-200/80"
                  )}
                >
                  {/* Top Image Container */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={act.imageUrl}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                    {/* Category Tag (Top Left) */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider text-slate-900 flex items-center gap-1.5 shadow-sm border border-white/40">
                      {getCategoryIcon(act.category)}
                      <span>{act.category}</span>
                    </div>

                    {/* Recommended Tag / Status (Top Right) */}
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                      {isRecommended && (
                        <div className="bg-[#5e2be2] text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3 h-3" />
                          <span>Recommended</span>
                        </div>
                      )}
                      {act.status === 'completed' && (
                        <div className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-md",
                          act.isPrivate 
                            ? "bg-amber-500/90 text-white border border-amber-300/40"
                            : "bg-emerald-600/90 text-white border border-emerald-300/40"
                        )}>
                          {act.isPrivate ? <Lock className="w-2.5 h-2.5" /> : <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          <span>{act.isPrivate ? "Completed (Private)" : "Completed (Shared)"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#5e2be2] transition-colors leading-snug mb-2">
                        {act.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-3">
                        {act.description}
                      </p>
                    </div>

                    {/* Meta info & Action */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{act.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Repeat className="w-4 h-4 text-slate-400" />
                          <span>{act.frequency || "Daily"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handlePreviewActivity(act)}
                          className={cn(
                            "w-full h-11 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer shadow-md gap-2",
                            act.status === 'completed'
                              ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
                              : "bg-[#5e2be2] hover:bg-[#4f28d9] text-white shadow-purple-500/20"
                          )}
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>{act.status === 'completed' ? "Practice Again" : "Start Activity"}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center">
            <p className="text-slate-500 font-medium text-sm">No activities found matching your search.</p>
          </div>
        )}
      </section>

      {/* ── Preview Activity Modal with Interactive Game Player ──────── */}
      <Dialog open={!!activeActivity} onOpenChange={() => setActiveActivity(null)}>
        {activeActivity && (
          <DialogContent className="max-w-2xl p-0 rounded-3xl overflow-hidden border-none shadow-2xl bg-slate-950 text-white max-h-[90dvh] overflow-y-auto w-[calc(100vw-24px)] sm:w-full">
            {/* Header Banner */}
            <div className="relative min-h-[160px] sm:h-40 w-full overflow-hidden bg-slate-900 shrink-0">
              <img
                src={activeActivity.imageUrl}
                alt={activeActivity.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6 text-white flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                    {getCategoryIcon(activeActivity.category)}
                    <span>{activeActivity.category} • {activeActivity.duration}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold leading-tight text-white">
                    {activeActivity.title}
                  </h2>
                </div>

                {/* Tab Switcher: Game vs Guidelines */}
                <div className="flex items-center gap-1 bg-slate-900/90 border border-white/20 rounded-full p-1 backdrop-blur-md shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("game")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                      previewTab === "game"
                        ? "bg-[#5e2be2] text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <span>🎮 Play Game</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("instructions")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                      previewTab === "instructions"
                        ? "bg-[#5e2be2] text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <span>📋 Guidelines</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body: Render Interactive Game or Instructions */}
            <div className="p-6 sm:p-7 space-y-6 bg-slate-950">
              {previewTab === "game" ? (
                <ActivityGamePlayer 
                  activity={activeActivity} 
                  onComplete={handleActivityCompleted}
                />
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Clinical Guidelines & Exercise Protocol
                  </h3>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-sm text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                    {activeActivity.instructions || activeActivity.description}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-900">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveActivity(null)}
                  className="rounded-2xl border-slate-800 text-slate-300 hover:bg-slate-900 font-semibold text-xs h-11 px-5 cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ── Post-Activity Privacy & Sharing Selection Dialog ──────── */}
      <Dialog 
        open={!!completedActivityToReview} 
        onOpenChange={(open) => { if (!open) setCompletedActivityToReview(null); }}
      >
        {completedActivityToReview && (
          <DialogContent className="max-w-lg p-0 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
            {/* Header Banner */}
            <div className="p-6 bg-gradient-to-br from-[#4f28d9] via-[#3b1799] to-slate-950 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-purple-200 shadow-inner">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
                    Exercise Completed
                  </span>
                  <h3 className="text-lg font-bold leading-tight">
                    {completedActivityToReview.activity.title}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-purple-100/90 leading-relaxed mt-2 relative z-10">
                Choose how you would like to share your activity completion and results with your consultant (<strong>{completedActivityToReview.activity.assignedTherapistName || myTherapistName || "Assigned Consultant"}</strong>).
              </p>
            </div>

            {/* Sharing Choice Selection */}
            <div className="p-6 space-y-4">
              {/* Option 1: Share Full Results */}
              <div
                onClick={() => setSharingChoice("full")}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex items-start gap-3.5",
                  sharingChoice === "full"
                    ? "border-[#5e2be2] bg-[#5e2be2]/5 dark:bg-[#5e2be2]/10 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                  sharingChoice === "full"
                    ? "bg-[#5e2be2] text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}>
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Share Full Results</span>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Recommended
                      </span>
                    </h4>
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                      sharingChoice === "full" ? "border-[#5e2be2] bg-[#5e2be2] text-white" : "border-slate-300 dark:border-slate-700"
                    )}>
                      {sharingChoice === "full" && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Your consultant can review your detailed reflection notes, ratings, scores, and pacing metrics to tailor upcoming sessions.
                  </p>
                </div>
              </div>

              {/* Option 2: Keep Private (Notify Completed Only) */}
              <div
                onClick={() => setSharingChoice("private")}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex items-start gap-3.5",
                  sharingChoice === "private"
                    ? "border-[#5e2be2] bg-[#5e2be2]/5 dark:bg-[#5e2be2]/10 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                  sharingChoice === "private"
                    ? "bg-[#5e2be2] text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}>
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Keep Private & Notify Completed</span>
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                        Private
                      </span>
                    </h4>
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                      sharingChoice === "private" ? "border-[#5e2be2] bg-[#5e2be2] text-white" : "border-slate-300 dark:border-slate-700"
                    )}>
                      {sharingChoice === "private" && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Keep your detailed answers and personal reflections confidential to you. Your consultant will only receive a notification that this task was completed.
                  </p>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-[#5e2be2] shrink-0" />
                <span>You can adjust your clinical sharing preferences at any time.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCompletedActivityToReview(null)}
                  className="rounded-xl h-10 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmPrivacyAndSave}
                  className="rounded-xl h-10 px-5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white text-xs font-bold shadow-md shadow-purple-500/20 gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm & Save</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
