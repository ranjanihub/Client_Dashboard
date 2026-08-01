import { Router, type IRouter } from "express";
import { db, therapistsTable } from "@workspace/db";
import { GetTherapistResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const MOCK_THERAPIST = {
  id: 1,
  name: "Dr. Sarah Jenkins",
  title: "Licensed Clinical Psychologist (PsyD)",
  avatarUrl: "https://images.unsplash.com/photo-1594824813566-78a9c3756b57?w=300&auto=format&fit=crop&q=80",
  yearsOfExperience: 12,
  specializations: ["Cognitive Behavioral Therapy (CBT)", "Anxiety & Panic Disorders", "Stress Management", "Mindfulness-Based Therapy"],
  languages: ["English", "Spanish"],
  bio: "Dr. Sarah Jenkins is a compassionate clinical psychologist with over 12 years of experience specializing in evidence-based CBT and mindfulness approaches for anxiety, stress management, and personal growth.",
  isVerified: true,
  rating: "4.9",
};

router.get("/therapist", async (req, res): Promise<void> => {
  try {
    const [therapist] = await db.select().from(therapistsTable).limit(1);
    if (therapist) {
      res.json(GetTherapistResponse.parse({
        id: therapist.id,
        name: therapist.name,
        title: therapist.title,
        avatarUrl: therapist.avatarUrl,
        yearsOfExperience: therapist.yearsOfExperience,
        specializations: therapist.specializations ?? [],
        languages: therapist.languages ?? [],
        bio: therapist.bio,
        isVerified: therapist.isVerified,
        rating: therapist.rating,
      }));
      return;
    }
  } catch (err) {
    // DB offline fallback
  }
  res.json(GetTherapistResponse.parse(MOCK_THERAPIST));
});

export default router;
