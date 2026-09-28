# PDF/OCR Engine boundary

Production implementation belongs here and is independently deployable from the candidate exam application.

Recommended pipeline:

1. Validate MIME, size and PDF structure.
2. Inspect page text density and image density.
3. Detect page layout, columns and repeated regions.
4. Extract native text and coordinates.
5. Remove repeated headers/footers/page numbers/watermarks when classified as page furniture.
6. Detect sections, question starts, options and continuation pages.
7. Preserve diagrams/tables/images as assets with stable IDs.
8. Use OCR only for image-only or low-confidence regions.
9. Optionally use an AI fallback only for ambiguous blocks.
10. Return normalized Exam JSON plus confidence and warnings.

The candidate application must consume only the normalized schema in `../../schemas/exam.schema.json`.
