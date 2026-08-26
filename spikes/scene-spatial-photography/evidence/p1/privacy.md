# P1 Privacy

Hard boundary verified by types, runtime output, replay, tests, and browser evidence:

- raw keyframes are transient browser-memory inputs;
- raw media persisted/uploaded: 0;
- raw video upload: 0;
- frame stream upload: 0;
- third-party image upload: 0;
- Provider calls: 0;
- backend per-frame calls: 0;
- Luna calls: 0;
- committed real-user media: 0.

Persistable P1 output contains only versioned context, descriptors, opportunity scalars, identifiers, reason codes, limitations, and timing. Thumbnails and pixel arrays are deliberately absent from export/evidence.
