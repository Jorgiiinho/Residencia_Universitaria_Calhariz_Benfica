# Residencia_Universitaria_Calhariz_Benfica

## Environment setup

The backend loads environment variables only from `Backend/.env` using `@dotenvx/dotenvx`, and the server checks the database connection on startup.

Recommended safe workflow:

1. Keep real values only in `Backend/.env`.
2. Never commit `Backend/.env`, `Backend/.env.keys`, or any secret values.
3. Use `npm run check:backend` to validate syntax.
4. Run the backend with `npm run start:backend`.

If you want to encrypt env files for safer sharing and CI/CD, use the official `dotenvx` encrypt flow after creating the local `.env` file.
