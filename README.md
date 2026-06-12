# Containers Starter

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/containers-template)

![Containers Template Preview](https://imagedelivery.net/_yJ02hpOMj_EnGvsU2aygw/5aba1fb7-b937-46fd-fa67-138221082200/public)

<!-- dash-content-start -->

This is a [Container](https://developers.cloudflare.com/containers/) starter template.

It demonstrates basic Container configuration, launching and routing to individual container, load balancing over multiple container, running basic hooks on container status changes.

<!-- dash-content-end -->

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/containers-template
```

## Getting Started

First, run:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then run the development server (using the package manager of your choice):

```bash
npm run dev
```

Open [http://localhost:8787](http://localhost:8787) with your browser to see the result.

You can start editing your Worker by modifying `src/index.ts` and you can start
editing your Container by editing the content of `container_src`.

## Deploying To Production

| Command          | Action                                |
| :--------------- | :------------------------------------ |
| `npm run deploy` | Deploy your application to Cloudflare |

## Deploy A Maven Java App (mail-gateway-java)

This repository is already configured so Wrangler builds the container image from `./Dockerfile`.
To deploy your `mail-gateway-java` application with Cloudflare Containers, use this flow.

If your Java project is in a sibling folder (for example `../mail-gateway-java`), this repo now includes an automatic sync step before `dev` and `deploy`.

### Sibling Folder Workflow (current setup)

Expected parent layout:

```text
projet/
├── containers-template/
└── mail-gateway-java/
```

Run as usual:

```bash
npm install
npm run dev
```

or:

```bash
npm run deploy
```

Before each `dev` and `deploy`, the script `npm run sync:mail-gateway` copies `../mail-gateway-java` into this repo at `./mail-gateway-java` (excluding `.git`, `target`, `node_modules`, `.idea`, `.vscode`) so Docker build context stays valid.

### In-Repo Workflow (optional)

If you prefer to keep everything directly in this repository, place your project under `./mail-gateway-java` and keep the same commands.

To deploy your app with this approach, ensure:

1. Add your Java project under `mail-gateway-java/` at the repository root.
2. Ensure at minimum these files exist:
	- `mail-gateway-java/pom.xml`
	- `mail-gateway-java/src/...`
3. The `Dockerfile` in this repo already builds this Maven project and runs the generated jar.
4. Make sure your Java server listens on `0.0.0.0:8080`.
	- The Worker container class currently uses port `8080` (see `src/index.ts`).

Expected layout:

```text
.
├── Dockerfile
├── mail-gateway-java/
│   ├── pom.xml
│   └── src/
└── src/
	 └── index.ts
```

### Local Development

```bash
npm install
npm run dev
```

Then call one of the Worker routes that forwards traffic to the container, for example:

- `GET /singleton`
- `GET /container/<id>`

### Production Deployment

```bash
npm run deploy
```

Wrangler will build the Java container image from the `Dockerfile`, upload it, and deploy your Worker + Container configuration.

## Learn More

To learn more about Containers, take a look at the following resources:

- [Container Documentation](https://developers.cloudflare.com/containers/) - learn about Containers
- [Container Class](https://github.com/cloudflare/containers) - learn about the Container helper class

Your feedback and contributions are welcome!
