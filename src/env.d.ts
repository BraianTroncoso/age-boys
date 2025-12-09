/// <reference path="../.astro/types.d.ts" />

import type { User } from './db/schema';

declare namespace App {
  interface Locals {
    user: User | null | undefined;
  }
}
