# ---- base image ----
FROM node:17.3.1-slim

# ---- start in /app ----
WORKDIR /app

# ---- install dependencies ----
COPY package* /app/
RUN npm ci --only=prod

# ---- copy app ----
COPY lib /app/

# ---- set user ----
USER node

# ---- create www directory ----
WORKDIR /www

# ---- entrypoint ----
ENTRYPOINT [ "/app/bin.js" ]
CMD [ "--root=/www" ]
