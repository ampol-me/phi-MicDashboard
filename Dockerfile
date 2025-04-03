FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
FROM base as deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Build the application
FROM deps as build
COPY . .
RUN bun run build

# Production image
FROM base as production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY --from=build /app/.nuxt ./.nuxt

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"] 