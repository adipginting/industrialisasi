# GitLab DevOps Pipeline — Full Setup Documentation

## Overview

This document covers the complete setup of a self-hosted GitLab CE instance on a local machine using Docker Compose, with a GitLab Runner for CI/CD that automatically builds Docker images and pushes them to the GitLab Container Registry for deployment on a VPS.

---

## Architecture

```
Local Machine
─────────────────────────────────────────────────────
  Turborepo Project
   ├── apps/frontend         ─── git push ──►  GitLab CE
   └── apps/backend                               │
                                                  │ CI/CD triggers
                                                  ▼
                                           GitLab Runner
                                                  │
                                                  │ builds images
                                                  ▼
                                        GitLab Container Registry
                                                  │
                                                  ▼
VPS ──────────────────── docker pull ─────────────┘
 └── docker run frontend
 └── docker run backend
```

---

## Stack

| Component | Choice |
|---|---|
| GitLab | Self-hosted CE via Docker Compose |
| GitLab Runner | Separate Docker container |
| Container Registry | GitLab built-in registry |
| Project type | Turborepo (frontend + backend) |
| VPS OS | Ubuntu/Debian |

---

## Port Mapping

| Host Port | Container Port | Purpose |
|---|---|---|
| `8929` | `8929` | GitLab Web UI |
| `2424` | `22` | SSH (git) |
| `443` | `443` | HTTPS |
| `5050` | `5050` | Container Registry |

---

## Docker Networking

```
Host Machine (172.17.0.1)
│
├── docker0 bridge
│      │
│      ├── gitlab container       (service name: gitlab)
│      ├── gitlab-runner container
│      └── job containers         (spawned by runner, outside compose network)
```

Key networking rules:
- From **host machine** → use `localhost:8929`
- From **inside Docker Compose** → use `http://gitlab:8929`
- From **job containers** (docker:24) → use `http://172.17.0.1:8929`

---

## File Structure

```
project/
  ├── docker-compose.yml
  ├── gitlab/
  │   ├── config/          ← gitlab.rb config persisted here
  │   ├── logs/            ← gitlab logs persisted here
  │   └── data/            ← repos & registry data persisted here
  └── gitlab-runner/
      └── config/
          └── config.toml  ← runner config persisted here
```

---

## Configuration Files

### docker-compose.yml

```yaml
services:
  gitlab:
    image: gitlab/gitlab-ce:latest
    container_name: gitlab
    restart: always
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'http://localhost:8929'
        nginx['listen_port'] = 8929
        nginx['listen_https'] = false
        nginx['proxy_set_headers'] = {
          "X-Forwarded-Proto" => "https",
          "X-Forwarded-Ssl" => "on"
        }
        gitlab_rails['gitlab_shell_ssh_port'] = 2424
        registry_external_url 'http://localhost:5050'
        gitlab_rails['registry_enabled'] = true
    ports:
      - "8929:8929"
      - "443:443"
      - "2424:22"
      - "5050:5050"
    volumes:
      - ./gitlab/config:/etc/gitlab
      - ./gitlab/logs:/var/log/gitlab
      - ./gitlab/data:/var/opt/gitlab
    dns:
      - 8.8.8.8
      - 8.8.4.4

  gitlab-runner:
    image: gitlab/gitlab-runner:latest
    container_name: gitlab-runner
    restart: always
    depends_on:
      - gitlab
    volumes:
      - ./gitlab-runner/config:/etc/gitlab-runner
      - /var/run/docker.sock:/var/run/docker.sock
```

---

### gitlab-runner/config/config.toml

```toml
concurrent = 1
check_interval = 0

[[runners]]
  name = "cicd"
  url = "http://gitlab:8929"
  token = "your-runner-token"
  executor = "docker"
  clone_url = "http://172.17.0.1:8929"    # host IP — used by job containers to clone repo

  [runners.docker]
    image = "docker:24"
    privileged = true
    network_mode = "host"
    volumes = ["/cache", "/var/run/docker.sock:/var/run/docker.sock"]
```

> `clone_url` is critical — job containers (docker:24) are spawned outside the Docker Compose network and cannot resolve the `gitlab` hostname. Using `172.17.0.1` (the Docker host IP) allows them to reach GitLab through the host machine.

Verify your Docker host IP with:
```bash
ip addr show docker0 | grep inet
```

---

## Runner Setup

### Register the Runner

```bash
# Get registration token from:
# GitLab UI → Admin → Runners → New instance runner

docker compose exec gitlab-runner gitlab-runner register \
  --url http://gitlab:8929 \
  --registration-token YOUR_TOKEN_HERE \
  --executor docker \
  --docker-image docker:24 \
  --description "cicd" \
  --run-untagged true \
  --non-interactive
```

Then manually add `clone_url` and `network_mode` to `config.toml` as shown above.

### Restart Runner After Config Changes

```bash
docker compose restart gitlab-runner
```

### Verify Runner is Online

```bash
docker compose exec gitlab-runner gitlab-runner list
```

Check in GitLab UI:
```
http://localhost:8929/admin/runners
```
You should see a green dot 🟢 next to your runner.

---

## SSH Setup

```bash
# Generate SSH key if needed
ssh-keygen -t ed25519 -C "your@email.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Paste into: GitLab UI → Profile → SSH Keys → Add key

# Test connection
ssh -T git@localhost -p 2424
# Expected: Welcome to GitLab, @yourusername!
```

Add to `~/.ssh/config` for convenience:

```
Host gitlab-local
    HostName localhost
    User git
    Port 2424
    IdentityFile ~/.ssh/id_ed25519
```

---

## Project Structure (Turborepo)

```
my-turborepo/
  ├── apps/
  │   ├── frontend/
  │   │   └── Dockerfile
  │   └── backend/
  │       └── Dockerfile
  ├── packages/
  │   └── shared/
  ├── .gitlab-ci.yml
  └── turbo.json
```

---

## Dockerfiles

### apps/frontend/Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npx turbo build --filter=frontend
EXPOSE 3000
CMD ["npm", "start"]
```

### apps/backend/Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npx turbo build --filter=backend
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

---

## CI/CD Pipeline

### .gitlab-ci.yml

One file at the Turborepo root with separate jobs per app. Each job only triggers when its relevant files change.

```yaml
stages:
  - build

# ─── FRONTEND ────────────────────────────────────────────────
build-frontend:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  tags:
    - build                          # matches runner tag
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE/frontend:latest ./apps/frontend
    - docker push $CI_REGISTRY_IMAGE/frontend:latest
  only:
    changes:
      - apps/frontend/**             # only builds if frontend changed
      - packages/**                  # or shared packages changed

# ─── BACKEND ─────────────────────────────────────────────────
build-backend:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  tags:
    - build                          # matches runner tag
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE/backend:latest ./apps/backend
    - docker push $CI_REGISTRY_IMAGE/backend:latest
  only:
    changes:
      - apps/backend/**              # only builds if backend changed
      - packages/**                  # or shared packages changed
```

### Automatic CI/CD Variables (No Setup Needed)

| Variable | Value |
|---|---|
| `$CI_REGISTRY` | `localhost:5050` |
| `$CI_REGISTRY_USER` | Your GitLab username |
| `$CI_REGISTRY_PASSWORD` | Your GitLab password |
| `$CI_REGISTRY_IMAGE` | Full path to your image |

### Build Trigger Logic

| Push to | Frontend builds | Backend builds |
|---|---|---|
| `apps/frontend/` | ✅ Yes | ❌ No |
| `apps/backend/` | ❌ No | ✅ Yes |
| `packages/shared/` | ✅ Yes | ✅ Yes |

### About Runner Tags

Runner tags in `.gitlab-ci.yml` are **not** related to git tags. They serve different purposes:

| | CI/CD Runner Tag | Git Tag |
|---|---|---|
| Purpose | Match job to correct runner | Mark a release in git history |
| Where | `.gitlab-ci.yml` | `git tag v1.0.0` |
| Example | `tags: [build]` | `git tag v1.0.0` |

---

## VPS Deployment

### docker-compose.yml on VPS

```yaml
services:
  frontend:
    image: your-local-ip:5050/username/project/frontend:latest
    restart: always
    ports:
      - "3000:3000"

  backend:
    image: your-local-ip:5050/username/project/backend:latest
    restart: always
    ports:
      - "4000:4000"
```

### Pull and Run on VPS

```bash
# Login to registry
docker login your-local-ip:5050 -u root -p your-gitlab-password

# Pull latest images
docker compose pull

# Run
docker compose up -d
```

---

## Common Issues & Fixes

### GitLab Unhealthy (404 health check)

**Cause:** Health check hits port 80 which is not mapped.

**Fix:** Set `external_url 'http://localhost:8929'` in `GITLAB_OMNIBUS_CONFIG`.

---

### Runner Token 404 Error

**Cause:** Runner token is expired or invalid.

**Fix:**
```bash
rm ./gitlab-runner/config/config.toml
# Re-register the runner (see Runner Setup above)
```

---

### DNS Not Working Inside Container

**Cause:** Host uses `127.0.0.53` (systemd-resolved) which containers can't reach.

**Fix:** Add to `docker-compose.yml`:
```yaml
dns:
  - 8.8.8.8
  - 8.8.4.4
```

---

### `localhost` Connection Refused in Runner

**Cause:** Inside a container, `localhost` = the container itself, not the host.

**Fix:** Use container service name (`gitlab`) or host IP (`172.17.0.1`).

---

### `Could not resolve host: gitlab` in Job Container

**Cause:** Job containers (docker:24) are spawned outside the Docker Compose network and can't resolve the `gitlab` hostname.

**Fix:** Set `clone_url = "http://172.17.0.1:8929"` in `config.toml`.

---

### Cloudflare Proxy Not Working

**Cause:** SSL/port mismatch between Cloudflare and GitLab.

**Fix:**
- Set Cloudflare SSL to **Flexible**
- Only use ports supported by Cloudflare (80, 443)
- Set `nginx['listen_https'] = false` in GitLab config
- Note: SSH does **not** work through Cloudflare proxy — use DNS-only mode for SSH

---

## Useful Debug Commands

```bash
# Check all containers
docker compose ps

# Check GitLab health
docker inspect --format='{{json .State.Health}}' $(docker compose ps -q gitlab) | python3 -m json.tool

# Check GitLab logs
docker compose logs --tail=50 gitlab

# Manually test health endpoint
curl http://localhost:8929/-/health

# Check services inside GitLab
docker compose exec gitlab gitlab-ctl status

# Check runner is connected
docker compose exec gitlab-runner gitlab-runner verify

# Check runner list
docker compose exec gitlab-runner gitlab-runner list

# Check memory (GitLab needs 4GB+)
free -h

# Find Docker host IP
ip addr show docker0 | grep inet

# Watch container status live
watch -n5 "docker compose ps"
```

---

## Complete Flow Summary

```
1. git push origin main
        │
        ▼
2. GitLab detects .gitlab-ci.yml
        │
        ▼
3. GitLab creates job, adds to queue
        │
        ▼
4. Runner polls GitLab every few seconds
   GET http://gitlab:8929/api/v4/jobs/request
        │
        ▼
5. Runner picks up job, spawns docker:24 container
        │
        ▼
6. Job container clones repo via http://172.17.0.1:8929
        │
        ▼
7. Job builds Docker image using Dockerfile
        │
        ▼
8. Job pushes image to GitLab Registry (localhost:5050)
        │
        ▼
9. Pipeline marked ✅ passed in GitLab UI
        │
        ▼
10. VPS runs: docker pull → docker compose up -d  🚀
```