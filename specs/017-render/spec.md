# Render web service configuration

Use Render's assigned `PORT` and bind `0.0.0.0` only when `RENDER=true`; retain loopback for local use. Select the external URL supplied by Render for origin checks unless `ALLOWED_ORIGIN` is explicitly set. Publish only application files and the Three.js runtime, not local work, environment files, server sources or tests. Provide correct model/image MIME types. Pin the Node version and document `npm ci` / `npm start` and private NASA configuration.

Validation: automated tests start the actual entry point with Render variables and check its bind, origin handling, private file restrictions, and browser assets. A clean temporary `npm ci` and browser smoke test were completed. Actual cloud deployment and a public URL require the user to create the Render service.
