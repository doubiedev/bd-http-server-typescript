import express from "express";

import { handlerReadiness } from "./api/readiness.js";
import {
    middlewareLogResponse,
    middlewareMetricsInc,
} from "./api/middleware.js";
import { handlerMetrics, handlerResetMetrics } from "./api/metrics.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponse);
app.use("/app", middlewareMetricsInc);
app.use("/metrics", handlerMetrics);
app.use("/reset", handlerResetMetrics);

app.use("/app", express.static("./src/app"));

app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
