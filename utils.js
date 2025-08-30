export function urgencyTextToNumber(txt) {
  if (!txt) return 3;
  const t = txt.toString().toLowerCase();
  if (t.includes("urgente") || t.includes("crítica") || t.includes("critica"))
    return 5;
  if (t.includes("alta")) return 4;
  if (t.includes("média") || t.includes("media") || t.includes("normal"))
    return 3;
  if (t.includes("baixa") || t.includes("baixo")) return 2;
  return Number.isFinite(+t) ? Math.min(Math.max(+t, 1), 5) : 3;
}

export function extractJSON(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start)
    throw new Error("JSON não encontrado");
  const candidate = text.slice(start, end + 1);
  return JSON.parse(candidate);
}
