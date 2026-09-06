import { Router, type IRouter } from "express";
import { db, therapistsTable } from "@workspace/db";
import { GetTherapistResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const MOCK_THERAPIST = {
  id: 1,
  name: "Sadaf Bhimani",
  title: "Certified Mental Health Counsellor & Psychologist",
  avatarUrl: "https://res.cloudinary.com/ddgvdabyf/image/upload/v1766954534/uploads/orwxj9dw0f2bnj5cgxex.webp",
  yearsOfExperience: 3,
  specializations: [
    "Psychologist & Mental Health Counselling",
    "Relationship Therapy & Conflict Resolution",
    "REBT & Cognitive Behavioral Therapy (CBT)",
    "Stress & Anxiety Management",
    "Adolescents & Adult Wellness",
    "Trauma-Informed Care"
  ],
  languages: ["English", "Hindi"],
  bio: "Sadaf Bhimani is a certified Psychologist with a Master of Arts in Clinical Psychology and a Post Graduate Diploma in Therapeutic Counselling. She provides a safe, empathetic, and supportive space tailored to your emotional wellness journey.",
  isVerified: true,
  rating: "4.95",
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
