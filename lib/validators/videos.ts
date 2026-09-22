import { z } from "zod";

const nonNegativeInt = z.number().int().min(0);

export const VideoMetricsSchema = z.object({
  views: nonNegativeInt,
  likes: nonNegativeInt,
  shares: nonNegativeInt,
  comments: nonNegativeInt,
  saves: nonNegativeInt,
  watch_time_seconds: nonNegativeInt,
});

export const CreateVideoSchema = z.object({
  script_id: z.string().uuid().optional(),
  title: z.string().min(1).max(500),
  platform: z.enum(["instagram", "tiktok", "youtube", "other"]).default("instagram"),
  published_at: z.string().datetime().optional(),
  ...VideoMetricsSchema.shape,
});

export const UpdateVideoSchema = CreateVideoSchema.partial();

export type CreateVideoInput = z.infer<typeof CreateVideoSchema>;
export type UpdateVideoInput = z.infer<typeof UpdateVideoSchema>;
export type VideoMetricsInput = z.infer<typeof VideoMetricsSchema>;
