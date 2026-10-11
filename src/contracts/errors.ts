import { ZodError } from 'zod';
export class FitlogError extends Error {
  constructor(public code: string, message: string) { super(message); }
}
export function publicError(error: unknown) {
  if (error instanceof FitlogError) return { code: error.code, message: error.message };
  if (error instanceof ZodError) return { code: 'VALIDATION_ERROR', message: error.issues.map(i => i.message).join(' ') };
  if (error instanceof Error && /locked|busy/i.test(error.message)) return { code: 'STORAGE_BUSY', message: '저장소 사용 중입니다. 잠시 후 다시 시도하세요.' };
  return { code: 'STORAGE_ERROR', message: '작업을 완료하지 못했습니다. 입력은 유지하고 다시 시도하세요.' };
}
