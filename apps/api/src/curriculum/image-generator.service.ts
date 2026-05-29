import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as https from 'https';

const SUBJECT_PROMPTS: Record<string, string> = {
  عربي:     'Colorful Arabic calligraphy art with flowing letters, vibrant green and gold palette, educational illustration style, clean white background, no text',
  عبري:     'Hebrew letters and Star of David motif, blue and white colors, modern educational illustration, geometric patterns, clean background, no text',
  رياضيات: 'Colorful math symbols — numbers, geometry shapes, plus signs — floating in cheerful cartoon style, purple and yellow palette, educational poster, no text',
  إنجليزي: 'British flag colors with book and speech bubbles, orange and blue tones, friendly cartoon illustration for kids, educational style, clean background, no text',
  علوم:     'Science icons — atom, beaker, magnifying glass, planet — colorful cartoon illustration, cyan and teal palette, educational for children, no text',
};

const GRADIENT_FALLBACKS: Record<string, string> = {
  عربي:     'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  عبري:     'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
  رياضيات: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
  إنجليزي: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
  علوم:     'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
};

@Injectable()
export class ImageGeneratorService implements OnModuleInit {
  private readonly logger = new Logger(ImageGeneratorService.name);
  private imageCache: Record<string, string> = {};

  async onModuleInit() {
    if (!process.env.OPENAI_API_KEY) {
      this.logger.log('No OPENAI_API_KEY — using gradient fallbacks for subject images');
      return;
    }
    this.logger.log('Generating DALL-E subject images...');
    await Promise.allSettled(
      Object.keys(SUBJECT_PROMPTS).map((subject) => this.generateImage(subject)),
    );
    this.logger.log(`Generated ${Object.keys(this.imageCache).length} subject images`);
  }

  getImageUrl(subjectName: string): string | null {
    return this.imageCache[subjectName] ?? null;
  }

  getGradient(subjectName: string): string {
    return GRADIENT_FALLBACKS[subjectName] ?? 'linear-gradient(135deg, #1A1F5E 0%, #3B4CB8 100%)';
  }

  getSubjectVisual(subjectName: string): { type: 'image'; url: string } | { type: 'gradient'; value: string } {
    const url = this.imageCache[subjectName];
    if (url) return { type: 'image', url };
    return { type: 'gradient', value: this.getGradient(subjectName) };
  }

  private async generateImage(subjectName: string): Promise<void> {
    const prompt = SUBJECT_PROMPTS[subjectName];
    if (!prompt) return;

    const body = JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url',
    });

    try {
      const url = await new Promise<string>((resolve, reject) => {
        const req = https.request(
          {
            hostname: 'api.openai.com',
            path: '/v1/images/generations',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Length': Buffer.byteLength(body),
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                const parsed = JSON.parse(data);
                const imageUrl = parsed?.data?.[0]?.url;
                if (imageUrl) resolve(imageUrl);
                else reject(new Error(`No URL in response: ${data}`));
              } catch (e) {
                reject(e);
              }
            });
          },
        );
        req.on('error', reject);
        req.write(body);
        req.end();
      });

      this.imageCache[subjectName] = url;
      this.logger.log(`Generated image for ${subjectName}`);
    } catch (err) {
      this.logger.warn(`Failed to generate image for ${subjectName}: ${(err as Error).message}`);
    }
  }
}
