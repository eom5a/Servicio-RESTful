#!/usr/bin/env node
// Genera el hash bcrypt para AUTH_PASSWORD_HASH.
// Uso: node scripts/hash-password.mjs "tu-contraseña"
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error('Uso: node scripts/hash-password.mjs "tu-contraseña"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log(hash);
