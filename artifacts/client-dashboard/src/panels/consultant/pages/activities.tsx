import { useState, useEffect } from "react";
import { 
  Activity, 
  Clock, 
  Calendar as CalendarIcon, 
  Plus, 
  Sparkles, 
  Search, 
  Brain, 
  Heart, 
  Wind, 
  Smile, 
  Check,
  MoreVertical,
  UserPlus,
  Pencil,
  Trash2,
  Users,
  Eye,
  Repeat,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { ActivityGamePlayer } from "@/components/activity-game-player";
import { QuenzaActivityBuilderModal } from "../components/QuenzaActivityBuilderModal";
import { cn } from "@/lib/utils";

export interface ClientAssignment {
  clientName: string;
  frequency: string; // Frequency per client (e.g. Daily, 2-3 Times / Week, Weekly, As Needed)
  timeOfDay?: string; // Preferred time of day per client
}

export interface ActivityItem {
  id: number | string;
  title: string;
  description: string;
  category: "MINDFULNESS" | "CBT" | "GRATITUDE" | "BREATHING" | "SOMATIC" | string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  duration: string;
  dueDate: string;
  imageUrl: string;
  status: "pending" | "completed" | string;
  instructions?: string;
  completedAt?: string | null;
  assignedTo?: string[]; // Multiple assigned client names
  clientAssignments?: ClientAssignment[]; // Per-client frequency schedule!
  frequency?: string; // Default fallback frequency
  timeOfDay?: string; // Default time of day
}

const CLIENT_LIST = [
  "Sarah Jenkins",
  "Michael Chen",
  "Emily Rodriguez",
  "David Kim",
  "Amanda Miller",
  "Alex Morgan"
];

const FREQUENCY_OPTIONS = [
  { id: "Daily", label: "Daily", description: "Once every day (Recommended)", icon: "⚡" },
  { id: "2-3 Times / Week", label: "2-3 Times / Week", description: "Flexible practice 2 to 3 days a week", icon: "📅" },
  { id: "Weekly", label: "Weekly", description: "Once a week on a set day", icon: "🗓️" },
  { id: "Bi-Weekly", label: "Bi-Weekly", description: "Every 2 weeks", icon: "🔄" },
  { id: "As Needed (PRN)", label: "As Needed (PRN)", description: "During acute anxiety or stress triggers", icon: "🆘" },
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = ["Morning (8:00 AM)", "Afternoon (1:00 PM)", "Evening (7:00 PM)", "Before Bed (10:00 PM)", "Any Time"];

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
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Quenza Studio Builder Modal State
  const [isQuenzaBuilderOpen, setIsQuenzaBuilderOpen] = useState(false);

  // Preview Activity Modal State
  const [activeActivity, setActiveActivity] = useState<ActivityItem | null>(null);
  const [previewTab, setPreviewTab] = useState<"game" | "instructions">("game");

  // Assign Modal Multi-Step State
  const [assignModalActivity, setAssignModalActivity] = useState<ActivityItem | null>(null);
  const [assignStep, setAssignStep] = useState<1 | 2>(1);
  const [selectedClientsToAssign, setSelectedClientsToAssign] = useState<string[]>([]);
  const [clientFrequencies, setClientFrequencies] = useState<Record<string, { frequency: string; timeOfDay: string }>>({});

  // Edit Modal State
  const [editModalActivity, setEditModalActivity] = useState<ActivityItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("MINDFULNESS");
  const [editDifficulty, setEditDifficulty] = useState("Easy");
  const [editDuration, setEditDuration] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editInstructions, setEditInstructions] = useState("");

  // Fetch activities from backend API if available
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const res = await fetch("/api/activities");
        if (!res.ok) return;
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : Array.isArray(data?.activities) ? data.activities : [];
        if (rawList.length > 0) {
          const normalized = rawList.map((item: any) => ({
            ...item,
            id: item.id || item._id,
            title: item.title || item.name || "Clinical Activity",
            category: (item.categoryTag || item.category || "MINDFULNESS").toUpperCase(),
            assignedTo: Array.isArray(item.assignedTo)
              ? item.assignedTo
              : typeof item.assignedTo === "string" && item.assignedTo
              ? [item.assignedTo]
              : [],
            frequency: item.repeat || item.frequency || "Daily",
            timeOfDay: item.timeOfDay || "Morning (8:00 AM)"
          }));
          setActivities(normalized);
        }
      } catch (err) {
        // Silently use local fallback state
      }
    };
    loadActivities();
  }, []);

  const handlePreviewActivity = (act: ActivityItem) => {
    setActiveActivity(act);
    setPreviewTab("game");
  };

  const handleSaveQuenzaActivity = (createdAct: any, andAssign?: boolean) => {
    const formattedAct: ActivityItem = {
      ...createdAct,
      id: createdAct.id || `ACT-${Date.now()}`,
      title: createdAct.title,
      category: createdAct.category || "MINDFULNESS",
      difficulty: createdAct.difficulty || "Easy",
      duration: createdAct.duration || "5-10 mins",
      dueDate: "Today",
      imageUrl: createdAct.imageUrl || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      status: "pending",
      description: createdAct.description || "Custom practitioner-designed clinical activity.",
      instructions: createdAct.instructions || createdAct.description,
      assignedTo: createdAct.assignedTo || [],
      clientAssignments: createdAct.clientAssignments || [],
      frequency: createdAct.frequency || "Daily",
      timeOfDay: createdAct.timeOfDay || "Morning (8:00 AM)"
    };

    setActivities((prev) => [formattedAct, ...prev]);

    if (andAssign) {
      openAssignModal(formattedAct);
    }
  };



  const handleDelete = async (act: ActivityItem) => {
    try {
      await fetch(`/api/activities/${act.id}`, { method: "DELETE" });
    } catch (e) {}

    setActivities((prev) => prev.filter((item) => item.id !== act.id));

    toast({
      title: "Activity Deleted",
      description: `"${act.title}" was removed.`,
      variant: "destructive"
    });
  };

  const openAssignModal = (act: ActivityItem, targetClient?: string) => {
    setAssignModalActivity(act);
    setAssignStep(targetClient ? 2 : 1);
    const clients = targetClient ? [targetClient] : (act.assignedTo || ["Sarah Jenkins"]);
    setSelectedClientsToAssign(clients);

    const initialFreqs: Record<string, { frequency: string; timeOfDay: string }> = {};
    CLIENT_LIST.forEach((cName) => {
      const existing = act.clientAssignments?.find((ca) => ca.clientName === cName);
      initialFreqs[cName] = {
        frequency: existing?.frequency || act.frequency || "Daily",
        timeOfDay: existing?.timeOfDay || act.timeOfDay || "Morning (8:00 AM)",
      };
    });
    setClientFrequencies(initialFreqs);
  };

  const toggleClientSelection = (clientName: string) => {
    setSelectedClientsToAssign((prev) =>
      prev.includes(clientName)
        ? prev.filter((c) => c !== clientName)
        : [...prev, clientName]
    );
  };

  const toggleSelectAllClients = () => {
    if (selectedClientsToAssign.length === CLIENT_LIST.length) {
      setSelectedClientsToAssign([]);
    } else {
      setSelectedClientsToAssign([...CLIENT_LIST]);
    }
  };

  const updateClientFrequency = (clientName: string, frequency: string) => {
    setClientFrequencies((prev) => ({
      ...prev,
      [clientName]: {
        ...(prev[clientName] || { timeOfDay: "Morning (8:00 AM)" }),
        frequency,
      },
    }));
  };

  const updateClientTimeOfDay = (clientName: string, timeOfDay: string) => {
    setClientFrequencies((prev) => ({
      ...prev,
      [clientName]: {
        ...(prev[clientName] || { frequency: "Daily" }),
        timeOfDay,
      },
    }));
  };

  const applyFrequencyToAll = (frequency: string) => {
    setClientFrequencies((prev) => {
      const next = { ...prev };
      selectedClientsToAssign.forEach((cName) => {
        next[cName] = {
          ...(next[cName] || { timeOfDay: "Morning (8:00 AM)" }),
          frequency,
        };
      });
      return next;
    });
  };

  const handleConfirmAssign = () => {
    if (!assignModalActivity) return;

    const updatedAssignments: ClientAssignment[] = selectedClientsToAssign.map((cName) => ({
      clientName: cName,
      frequency: clientFrequencies[cName]?.frequency || "Daily",
      timeOfDay: clientFrequencies[cName]?.timeOfDay || "Morning (8:00 AM)",
    }));

    setActivities((prev) =>
      prev.map((item) =>
        item.id === assignModalActivity.id
          ? {
              ...item,
              assignedTo: selectedClientsToAssign,
              clientAssignments: updatedAssignments,
              frequency: updatedAssignments[0]?.frequency || "Daily",
            }
          : item
      )
    );

    toast({
      title: "Per-Client Frequencies Saved!",
      description: `"${assignModalActivity.title}" assigned to ${selectedClientsToAssign.length} client(s) with custom frequency schedules.`,
    });

    setAssignModalActivity(null);
    setAssignStep(1);
  };

  const openEditModal = (act: ActivityItem) => {
    setEditModalActivity(act);
    setEditTitle(act.title);
    setEditCategory(act.category);
    setEditDifficulty(act.difficulty);
    setEditDuration(act.duration);
    setEditDueDate(act.dueDate);
    setEditDescription(act.description);
    setEditInstructions(act.instructions || "");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalActivity) return;

    setActivities((prev) =>
      prev.map((item) =>
        item.id === editModalActivity.id
          ? {
              ...item,
              title: editTitle.trim(),
              category: editCategory,
              difficulty: editDifficulty,
              duration: editDuration.trim(),
              dueDate: editDueDate.trim(),
              description: editDescription.trim(),
              instructions: editInstructions.trim(),
            }
          : item
      )
    );

    toast({
      title: "Activity Updated",
      description: `"${editTitle}" has been updated successfully.`,
    });

    setEditModalActivity(null);
  };



  const filteredActivities = activities.filter((act) => {
    const matchesCategory =
      selectedCategory === "All"
        ? true
        : act.category === selectedCategory;

    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.assignedTo && act.assignedTo.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesSearch;
  });

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



  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Activities Library"
        description="Browse, assign, and manage interactive Quenza-style therapeutic exercises, worksheets, and breathwork pacers with custom frequency schedules."
        badge="ACTIVITY MANAGEMENT & CREATOR STUDIO"
        icon={<Activity className="w-4 h-4 text-purple-200" />}
      >
        <Button
          onClick={() => setIsQuenzaBuilderOpen(true)}
          className="h-11 px-6 rounded-2xl bg-white text-[#5e2be2] hover:bg-white/90 font-extrabold text-sm shadow-xl shadow-purple-900/30 transition-all flex items-center gap-2 cursor-pointer shrink-0 border border-white/40 hover:scale-[1.02] active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-[#5e2be2] fill-[#5e2be2]" />
          <span>+ Create Activity (Quenza Studio)</span>
        </Button>
      </PageHeader>

      {/* Controls Bar: Search + Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none flex-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
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

        {/* Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search activities or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-full border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-[#5e2be2]"
          />
        </div>
      </div>

      {/* Activities Cards Grid */}
      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => {
            return (
              <div
                key={act.id}
                className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
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

                  {/* Top Right Controls: 3-Dot Menu */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">

                    {/* 3-Dot Options Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label="Activity Options"
                          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 flex items-center justify-center shadow-md border border-white/40 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4 stroke-[2.2]" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 shadow-xl border-slate-200">
                        {/* Direct Option to Assign Activity to Client */}
                        <DropdownMenuItem
                          onClick={() => openAssignModal(act)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm font-bold rounded-xl cursor-pointer text-[#5e2be2] bg-purple-50/50 hover:bg-purple-100/70 mb-1"
                        >
                          <UserPlus className="w-4 h-4 text-[#5e2be2]" />
                          <span>Assign to Clients & Set Frequency</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-1" />

                        {/* List of direct client options for quick frequency assign */}
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Quick Assign to Client:
                        </div>
                        {CLIENT_LIST.slice(0, 4).map((clientName) => (
                          <DropdownMenuItem
                            key={clientName}
                            onClick={() => openAssignModal(act, clientName)}
                            className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer text-slate-700 hover:bg-slate-50"
                          >
                            <span>{clientName}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </DropdownMenuItem>
                        ))}

                        <DropdownMenuSeparator className="my-1" />

                        <DropdownMenuItem
                          onClick={() => handlePreviewActivity(act)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-xl cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                          <span>Preview Exercise</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => openEditModal(act)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-xl cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 text-slate-600" />
                          <span>Edit Activity</span>
                        </DropdownMenuItem>



                        <DropdownMenuSeparator className="my-1" />

                        <DropdownMenuItem
                          onClick={() => handleDelete(act)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                        onClick={() => openAssignModal(act)}
                        className="flex-1 h-11 rounded-2xl bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-md shadow-purple-500/20 gap-2"
                      >
                        <UserPlus className="w-4 h-4 stroke-[2.2]" />
                        <span>Assign to Client</span>
                      </Button>
                      <Button
                        onClick={() => handlePreviewActivity(act)}
                        variant="outline"
                        className="h-11 px-3.5 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm cursor-pointer"
                        title="Preview Exercise Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <p className="text-slate-500 font-medium text-sm">No activities found matching your criteria.</p>
        </div>
      )}

      {/* Preview Activity Modal with Interactive Game Player */}
      <Dialog open={!!activeActivity} onOpenChange={() => setActiveActivity(null)}>
        {activeActivity && (
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl p-0 rounded-3xl overflow-hidden border-none shadow-2xl bg-slate-950 text-white max-h-[92vh] overflow-y-auto">
            {/* Header Banner */}
            <div className="relative h-40 w-full overflow-hidden bg-slate-900 shrink-0">
              <img
                src={activeActivity.imageUrl}
                alt={activeActivity.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              <div className="absolute bottom-4 left-6 right-6 text-white flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                    {getCategoryIcon(activeActivity.category)}
                    <span>{activeActivity.category} • {activeActivity.duration}</span>
                  </div>
                  <h2 className="text-2xl font-bold leading-tight text-white">
                    {activeActivity.title}
                  </h2>
                </div>

                {/* Tab Switcher: Game vs Guidelines */}
                <div className="flex items-center gap-1 bg-slate-900/90 border border-white/20 rounded-full p-1 backdrop-blur-md">
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
                <ActivityGamePlayer activity={activeActivity} />
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
              <div className="flex items-center justify-between pt-4 border-t border-slate-900">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveActivity(null)}
                  className="rounded-2xl border-slate-800 text-slate-300 hover:bg-slate-900 font-semibold text-xs h-11 px-5 cursor-pointer"
                >
                  Close Preview
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const actToAssign = activeActivity;
                    setActiveActivity(null);
                    openAssignModal(actToAssign);
                  }}
                  className="rounded-2xl bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs h-11 px-6 shadow-md shadow-purple-500/20 gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>Assign to Client & Set Frequency</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* PER-CLIENT FREQUENCY ASSIGNMENT MODAL */}
      <Dialog open={!!assignModalActivity} onOpenChange={() => { setAssignModalActivity(null); setAssignStep(1); }}>
        {assignModalActivity && (
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg p-4 sm:p-7 rounded-3xl bg-white border-none shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Header with Step indicator */}
            <DialogHeader className="pb-2">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                  {assignStep === 1 ? "1. Select Client(s)" : "2. Select Activity Frequency"}
                </DialogTitle>
                <span className="text-xs font-bold text-[#5e2be2] bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                  Step {assignStep} of 2
                </span>
              </div>
              <DialogDescription className="text-slate-500 text-sm font-medium">
                {assignStep === 1
                  ? `Choose which client(s) will receive "${assignModalActivity.title}".`
                  : `Configure individual practice frequencies for each assigned client.`}
              </DialogDescription>
            </DialogHeader>

            {/* STEP 1: Select Client(s) */}
            {assignStep === 1 && (
              <div className="space-y-4 my-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Clients ({selectedClientsToAssign.length} selected)
                  </span>
                  <button
                    type="button"
                    onClick={toggleSelectAllClients}
                    className="text-xs font-bold text-[#5e2be2] hover:underline cursor-pointer"
                  >
                    {selectedClientsToAssign.length === CLIENT_LIST.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {CLIENT_LIST.map((client) => {
                    const isChecked = selectedClientsToAssign.includes(client);
                    return (
                      <div
                        key={client}
                        onClick={() => toggleClientSelection(client)}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? "bg-purple-50/80 border-[#5e2be2]/40 text-[#5e2be2] font-semibold"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              isChecked
                                ? "bg-[#5e2be2] border-[#5e2be2] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-sm font-semibold">{client}</span>
                        </div>


                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Configure Per-Client Frequency & Schedule */}
            {assignStep === 2 && (
              <div className="space-y-4 my-2">
                {/* Bulk Shortcut Bar */}
                <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Quick Bulk Apply:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Daily", "2-3 Times / Week", "Weekly", "As Needed (PRN)"].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => applyFrequencyToAll(f)}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white hover:bg-purple-50 text-slate-700 hover:text-[#5e2be2] border border-slate-200 hover:border-[#5e2be2]/30 transition-colors cursor-pointer"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Per-Client Frequency Configuration List */}
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {selectedClientsToAssign.map((clientName) => {
                    const currentConfig = clientFrequencies[clientName] || {
                      frequency: "Daily",
                      timeOfDay: "Morning (8:00 AM)",
                    };
                    const initials = clientName
                      .split(" ")
                      .map((n) => n[0])
                      .join("");

                    return (
                      <div
                        key={clientName}
                        className="p-3.5 rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:border-purple-200 transition-all space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-[#5e2be2] font-bold flex items-center justify-center text-xs shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-tight">{clientName}</p>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Individual Schedule</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-[#5e2be2] border border-purple-100">
                            {currentConfig.frequency}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Frequency
                            </label>
                            <select
                              value={currentConfig.frequency}
                              onChange={(e) => updateClientFrequency(clientName, e.target.value)}
                              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#5e2be2] focus:outline-none"
                            >
                              {FREQUENCY_OPTIONS.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Preferred Time
                            </label>
                            <select
                              value={currentConfig.timeOfDay}
                              onChange={(e) => updateClientTimeOfDay(clientName, e.target.value)}
                              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#5e2be2] focus:outline-none"
                            >
                              {TIME_SLOTS.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal Footer Navigation */}
            <DialogFooter className="pt-3 border-t border-slate-100 gap-2 flex flex-row items-center justify-between">
              {assignStep === 2 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAssignStep(1)}
                  className="rounded-2xl border-slate-200 font-semibold h-11 gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Clients</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAssignModalActivity(null)}
                  className="rounded-2xl border-slate-200 font-semibold h-11"
                >
                  Cancel
                </Button>
              )}

              {assignStep === 1 ? (
                <Button
                  type="button"
                  onClick={() => setAssignStep(2)}
                  disabled={selectedClientsToAssign.length === 0}
                  className="rounded-2xl bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold h-11 px-6 shadow-md shadow-purple-500/20 cursor-pointer disabled:opacity-50 gap-1.5"
                >
                  <span>Select Frequency</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleConfirmAssign}
                  className="rounded-2xl bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold h-11 px-6 shadow-md shadow-purple-500/20 cursor-pointer gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirm Assignment</span>
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Edit Activity Modal */}
      <Dialog open={!!editModalActivity} onOpenChange={() => setEditModalActivity(null)}>
        {editModalActivity && (
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg p-4 sm:p-7 rounded-3xl bg-white border-none shadow-2xl max-h-[92vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                Edit Activity
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm font-medium">
                Update activity title, category, difficulty, duration or instructions.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Title *
                </label>
                <Input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="rounded-2xl border-slate-200 h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5e2be2]"
                  >
                    <option value="MINDFULNESS">MINDFULNESS</option>
                    <option value="CBT">CBT</option>
                    <option value="GRATITUDE">GRATITUDE</option>
                    <option value="BREATHING">BREATHING</option>
                    <option value="SOMATIC">SOMATIC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5e2be2]"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Duration
                  </label>
                  <Input
                    type="text"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="rounded-2xl border-slate-200 h-11"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Due Date
                  </label>
                  <Input
                    type="text"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="rounded-2xl border-slate-200 h-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5e2be2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Instructions
                </label>
                <textarea
                  rows={3}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5e2be2]"
                />
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalActivity(null)}
                  className="rounded-2xl border-slate-200 font-semibold h-11"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-2xl bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold h-11 px-6 shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>
      {/* Quenza Modular Activity Creator Studio Modal */}
      <QuenzaActivityBuilderModal
        isOpen={isQuenzaBuilderOpen}
        onClose={() => setIsQuenzaBuilderOpen(false)}
        onSaveActivity={handleSaveQuenzaActivity}
      />
    </div>
  );
}
