"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const health_route_1 = __importDefault(require("./routes/health.route"));
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
// Request Parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logging
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/health', health_route_1.default);
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: 'Resource not found' });
});
exports.default = app;
