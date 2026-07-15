import express from "express";
import { search } from "../controllers/searchController.js";

const router = express.Router();

// GET /api/search?query=mountains -> public search across users and posts
router.get("/", search);

export default router;