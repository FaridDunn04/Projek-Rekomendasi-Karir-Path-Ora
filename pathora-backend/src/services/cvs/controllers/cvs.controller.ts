/**
 * services/cvs/controllers/cvs.controller.ts
 *
 * Controller untuk domain CVs (FR-008..FR-012, SDD §3.7.3).
 * Identitas user selalu dari req.user (JWT), tidak dari body (SEC-003).
 */

import type { Request, Response, NextFunction } from "express";
import { response } from "../../../utils/response.js";
import { parsePagination } from "../../../utils/pagination.js";
import type { UploadCvTextDto } from "../validators/cvs.schema.js";

// ── Dependency Interfaces ──────────────────────────────────────────────────────

interface UploadCvTextUseCase {
  execute(input: { userId: string; raw_text: string }): Promise<unknown>;
}

interface UploadCvFileUseCase {
  execute(input: {
    userId: string;
    buffer: Buffer;
    mimeType: string;
    fileName: string;
  }): Promise<unknown>;
}

interface DeleteCvUseCase {
  execute(cvId: string, userId: string): Promise<void>;
}

interface ListCvsUseCase {
  execute(
    userId: string,
    pagination: { limit: number; offset: number },
  ): Promise<{ cvs: unknown[]; meta: unknown }>;
}

interface GetCvUseCase {
  execute(cvId: string, userId: string): Promise<unknown>;
}

interface CvsControllerDeps {
  uploadCvTextUseCase: UploadCvTextUseCase;
  uploadCvFileUseCase: UploadCvFileUseCase;
  deleteCvUseCase: DeleteCvUseCase;
  listCvsUseCase: ListCvsUseCase;
  getCvUseCase: GetCvUseCase;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createCvsController({
  uploadCvTextUseCase,
  uploadCvFileUseCase,
  deleteCvUseCase,
  listCvsUseCase,
  getCvUseCase,
}: CvsControllerDeps) {
  /**
   * POST /cvs
   * Upload CV — deteksi mode: berkas (req.file) atau teks (req.body).
   */
  async function upload(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      let cv: unknown;

      if (req.file) {
        // Mode berkas — buffer mentah diteruskan ke AI saat analyze (revisi v1.1)
        cv = await uploadCvFileUseCase.execute({
          userId,
          buffer: req.file.buffer,
          mimeType: req.file.mimetype,
          fileName: req.file.originalname,
        });
      } else {
        // Mode teks
        const body = req.body as UploadCvTextDto;
        cv = await uploadCvTextUseCase.execute({
          userId,
          raw_text: body.raw_text,
        });
      }

      res.status(201).json(response.success(cv));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /cvs
   * Daftar CV milik user dengan paginasi.
   */
  async function list(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const pagination = parsePagination(req.query as Record<string, unknown>);
      const result = await listCvsUseCase.execute(userId, pagination);
      res
        .status(200)
        .json(
          response.success(result.cvs, result.meta as Record<string, unknown>),
        );
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /cvs/:cvId
   * Detail satu CV.
   */
  async function getOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { cvId } = req.params as { cvId: string };
      const cv = await getCvUseCase.execute(cvId, req.user!.id);
      res.status(200).json(response.success(cv));
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /cvs/:cvId
   * Hapus CV milik user.
   */
  async function remove(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { cvId } = req.params as { cvId: string };
      await deleteCvUseCase.execute(cvId, req.user!.id);
      res.status(200).json(response.success(null));
    } catch (err) {
      next(err);
    }
  }

  return { upload, list, getOne, remove };
}
