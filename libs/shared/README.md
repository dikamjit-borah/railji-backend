# Shared Libraries

This directory contains shared libraries used across multiple apps in the workspace.

## Structure

```
libs/
└── shared/
    ├── src/
    │   ├── constants/
    │   ├── utils/
    │   ├── decorators/
    │   ├── guards/
    │   ├── interfaces/
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

## Usage

Import shared utilities from any app:

```typescript
import { sharedConstant, sharedUtil } from '@libs/shared';
```

## Development

Create modules that can be reused across applications:

- **Constants**: Shared configuration values
- **Utils**: Helper functions
- **Decorators**: Custom NestJS decorators
- **Guards**: Authentication and authorization guards
- **Interfaces**: Shared TypeScript interfaces

## Example

```typescript
// In libs/shared/src/utils/validation.ts
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// In any app
import { isValidEmail } from '@libs/shared';
```
