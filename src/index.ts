import { Container, getContainer, getRandom } from "@cloudflare/containers";
import { Hono } from "hono";

export class MyContainer extends Container<Env> {
	// Port the container listens on (default: 8080)
	defaultPort = 8080;
	// Time before container sleeps due to inactivity (default: 30s)
	sleepAfter = "2m";
	// Environment variables passed to the container
	envVars = {
		MESSAGE: "I was passed in via the container class!",
	};

	// Optional lifecycle hooks
	override onStart() {
		console.log("Container successfully started");
	}

	override onStop() {
		console.log("Container successfully shut down");
	}

	override onError(error: unknown) {
		console.log("Container error:", error);
	}
}

// Create Hono app with proper typing for Cloudflare Workers
const app = new Hono<{
	Bindings: Env;
}>();

function stripPathPrefix(pathname: string, segmentCount: number) {
	const segments = pathname.split("/").filter(Boolean);
	const rest = segments.slice(segmentCount);
	return rest.length === 0 ? "/" : `/${rest.join("/")}`;
}

function rewriteRequestPath(request: Request, pathname: string) {
	const url = new URL(request.url);
	url.pathname = pathname;
	return new Request(url.toString(), request);
}

// Home route with available endpoints
app.get("/", (c) => {
	return c.text(
		"Available endpoints:\n" +
			"GET / - Show this list\n" +
			"ALL /container/<id>[/<path>] - Dedicated container by id\n" +
			"ALL /singleton[/<path>] - Singleton container instance\n" +
			"ALL /lb[/<path>] - Random container among multiple instances\n" +
			"POST /singleton/v1/mail/send - Example Java endpoint through singleton\n" +
			"POST /container/<id>/v1/mail/send - Example Java endpoint through dedicated instance\n" +
			"GET /error - Route to the error-test container (error handling demo)",
	);
});

// Route requests to a specific container using the container ID
app.all("/container/:id", async (c) => {
	const id = c.req.param("id");
	const containerId = c.env.MY_CONTAINER.idFromName(`/container/${id}`);
	const container = c.env.MY_CONTAINER.get(containerId);
	const request = rewriteRequestPath(c.req.raw, "/");
	return await container.fetch(request);
});

app.all("/container/:id/*", async (c) => {
	const id = c.req.param("id");
	const containerId = c.env.MY_CONTAINER.idFromName(`/container/${id}`);
	const container = c.env.MY_CONTAINER.get(containerId);
	const forwardedPath = stripPathPrefix(new URL(c.req.url).pathname, 2);
	const request = rewriteRequestPath(c.req.raw, forwardedPath);
	return await container.fetch(request);
});

// Demonstrate error handling - this route forces a panic in the container
app.get("/error", async (c) => {
	const container = getContainer(c.env.MY_CONTAINER, "error-test");
	return await container.fetch(c.req.raw);
});

// Load balance requests across multiple containers
app.all("/lb", async (c) => {
	const container = await getRandom(c.env.MY_CONTAINER, 3);
	const request = rewriteRequestPath(c.req.raw, "/");
	return await container.fetch(request);
});

app.all("/lb/*", async (c) => {
	const container = await getRandom(c.env.MY_CONTAINER, 3);
	const forwardedPath = stripPathPrefix(new URL(c.req.url).pathname, 1);
	const request = rewriteRequestPath(c.req.raw, forwardedPath);
	return await container.fetch(request);
});

// Get a single container instance (singleton pattern)
app.all("/singleton", async (c) => {
	const container = getContainer(c.env.MY_CONTAINER);
	const request = rewriteRequestPath(c.req.raw, "/");
	return await container.fetch(request);
});

app.all("/singleton/*", async (c) => {
	const container = getContainer(c.env.MY_CONTAINER);
	const forwardedPath = stripPathPrefix(new URL(c.req.url).pathname, 1);
	const request = rewriteRequestPath(c.req.raw, forwardedPath);
	return await container.fetch(request);
});

export default app;
