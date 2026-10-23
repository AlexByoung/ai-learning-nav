import { defineCollection, reference } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES, FORMATS, LEVELS } from './data/taxonomy';

// Any schema violation (missing required field, bad enum value, malformed URL)
// makes `astro build` exit non-zero, so broken data never reaches the site.

const httpsUrl = z.url({ protocol: /^https$/, error: '必须是 https:// 开头的完整 URL' });

const youtubeUrl = httpsUrl.refine(
  (value) => /^(www\.)?(youtube\.com|youtu\.be)$/.test(new URL(value).hostname),
  { message: 'links.youtube 必须指向 youtube.com 或 youtu.be' },
);

const courses = defineCollection({
  loader: file('src/data/courses.yaml'),
  schema: z
    .object({
      id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id 只能用小写字母、数字和连字符'),
      title: z.string().min(1),
      provider: z.string().min(1),
      category: z.enum(CATEGORIES),
      level: z.enum(LEVELS),
      prerequisites: z.array(z.string().min(1)),
      formats: z.array(z.enum(FORMATS)).min(1),
      free: z.boolean(),
      term: z.string().min(1).nullable(),
      links: z.strictObject({
        official: httpsUrl,
        youtube: youtubeUrl.optional(),
        other: httpsUrl.optional(),
      }),
      summary_zh: z.string().min(1),
      why: z.string().min(1),
      verified_at: z.date(),
    })
    .strict()
    .refine((c) => !c.links.youtube || c.formats.includes('video'), {
      message: '有 links.youtube 时 formats 必须包含 video',
      path: ['formats'],
    }),
});

const paths = defineCollection({
  loader: file('src/data/paths.yaml'),
  schema: z
    .object({
      id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
      title: z.string().min(1),
      description: z.string().min(1),
      featured: z.boolean().default(false),
      steps: z
        .array(
          z.strictObject({
            course: reference('courses'),
            note: z.string().min(1),
          }),
        )
        .min(1),
    })
    .strict(),
});

export const collections = { courses, paths };
