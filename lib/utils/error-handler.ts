/**
 * Institutional Error Diagnostic Engine
 * Translates low-level database and logic failures into human-readable insights.
 */
export function handleDatabaseError(error: any, fallbackMessage: string = 'Operation failed'): string {
  console.error('DIAGNOSTIC_CATCH:', error);

  // Prisma Error Handling (P-Series)
  if (error && typeof error === 'object' && error.code) {
    switch (error.code) {
      case 'P2002': {
        const target = Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : 'field';
        return `A record with this ${target} already exists.`;
      }
      case 'P2003':
        return 'This operation is blocked because the record is referenced elsewhere.';
      case 'P2025':
        return 'The requested record could not be found in the registry.';
      case 'P2014':
        return 'The change you are trying to make would violate a required relationship.';
    }
  }

  // General Error Handling
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallbackMessage;
}
