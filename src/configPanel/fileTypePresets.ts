/**
 * Common MIME / file-type presets organized by category.
 * Each preset has: value (MIME or extension), label, description.
 */

export interface FileTypePreset {
    /** Chave semântica do preset. Se `group` estiver definido, este valor NÃO é armazenado diretamente. */
    value: string;
    label: string;
    description: string;
    /**
     * Se definido, selecionar este atalho adiciona/remove todos os MIMEs deste array.
     * O `value` acima é apenas um identificador interno e não fica no array final.
     */
    group?: string[];
}

export interface FileTypeCategory {
    category: string;
    presets: FileTypePreset[];
}

export const FILE_TYPE_PRESETS: FileTypeCategory[] = [
    {
        category: "Imagens",
        presets: [
            { value: "image/jpeg", label: "JPEG", description: "Imagem JPEG — formato mais comum para fotos. Boa compressão, perde qualidade." },
            { value: "image/png", label: "PNG", description: "Imagem PNG — suporta transparência, sem perda de qualidade. Arquivos maiores." },
            { value: "image/gif", label: "GIF", description: "Imagem GIF — suporta animações simples e transparência. Limitado a 256 cores." },
            { value: "image/webp", label: "WebP", description: "Formato moderno do Google — compressão superior ao JPEG e PNG." },
            { value: "image/svg+xml", label: "SVG", description: "Imagem vetorial XML — escalável sem perda. Ideal para logos e ícones." },
            { value: "image/bmp", label: "BMP", description: "Bitmap — sem compressão, arquivos muito grandes." },
            { value: "image/tiff", label: "TIFF", description: "Imagem TIFF — alta qualidade, usado em impressão profissional." },
            { value: "image/avif", label: "AVIF", description: "Formato moderno — melhor compressão que WebP, suporte crescente." },
            { value: "image/heic", label: "HEIC", description: "Formato padrão do iPhone — alta qualidade, tamanho reduzido." },
            { value: "image/*", label: "Qualquer imagem", description: "Aceita todos os formatos de imagem (JPEG, PNG, GIF, WebP, etc.)." },
        ],
    },
    {
        category: "Documentos",
        presets: [
            { value: "application/pdf", label: "PDF", description: "Documento PDF — formato universal para documentos. Preserva formatação." },
            { value: "application/msword", label: "DOC (Word antigo)", description: "Microsoft Word 97-2003 (.doc)." },
            { value: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "DOCX (Word)", description: "Microsoft Word moderno (.docx) — formato atual do Word." },
            { value: "application/vnd.ms-excel", label: "XLS (Excel antigo)", description: "Microsoft Excel 97-2003 (.xls)." },
            { value: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", label: "XLSX (Excel)", description: "Microsoft Excel moderno (.xlsx) — formato atual do Excel." },
            { value: "application/vnd.ms-powerpoint", label: "PPT (PowerPoint antigo)", description: "Microsoft PowerPoint 97-2003 (.ppt)." },
            { value: "application/vnd.openxmlformats-officedocument.presentationml.presentation", label: "PPTX (PowerPoint)", description: "Microsoft PowerPoint moderno (.pptx)." },
            { value: "application/vnd.oasis.opendocument.text", label: "ODT (LibreOffice)", description: "Documento de texto LibreOffice/OpenOffice (.odt)." },
            { value: "application/vnd.oasis.opendocument.spreadsheet", label: "ODS (LibreOffice)", description: "Planilha LibreOffice/OpenOffice (.ods)." },
            { value: "application/rtf", label: "RTF", description: "Rich Text Format — compatível com quase todos os editores de texto." },
            { value: "text/plain", label: "TXT", description: "Texto puro sem formatação (.txt)." },
            { value: "text/csv", label: "CSV", description: "Valores separados por vírgula — planilhas simples e dados tabulares." },
        ],
    },
    {
        category: "Vídeos",
        presets: [
            { value: "video/mp4", label: "MP4", description: "Vídeo MP4 — formato mais compatível, boa compressão (H.264/H.265)." },
            { value: "video/webm", label: "WebM", description: "Vídeo WebM — formato aberto do Google, boa compressão." },
            { value: "video/quicktime", label: "MOV", description: "Vídeo QuickTime — formato padrão do macOS/iPhone." },
            { value: "video/x-msvideo", label: "AVI", description: "Vídeo AVI — formato antigo da Microsoft, arquivos grandes." },
            { value: "video/x-matroska", label: "MKV", description: "Matroska — contêiner flexível, suporta múltiplas faixas de áudio/legenda." },
            { value: "video/*", label: "Qualquer vídeo", description: "Aceita todos os formatos de vídeo." },
        ],
    },
    {
        category: "Áudios",
        presets: [
            { value: "audio/mpeg", label: "MP3", description: "Áudio MP3 — formato mais popular, boa compressão com perda." },
            { value: "audio/wav", label: "WAV", description: "Áudio WAV — sem compressão, alta qualidade, arquivos grandes." },
            { value: "audio/ogg", label: "OGG", description: "Áudio OGG Vorbis — formato aberto, boa qualidade." },
            { value: "audio/aac", label: "AAC", description: "Áudio AAC — qualidade superior ao MP3 no mesmo bitrate." },
            { value: "audio/flac", label: "FLAC", description: "Áudio FLAC — compressão sem perda, alta fidelidade." },
            { value: "audio/webm", label: "WebM Áudio", description: "Áudio no contêiner WebM." },
            { value: "audio/*", label: "Qualquer áudio", description: "Aceita todos os formatos de áudio." },
        ],
    },
    {
        category: "Compactados",
        presets: [
            { value: "application/zip", label: "ZIP", description: "Arquivo compactado ZIP — o mais universal." },
            { value: "application/x-rar-compressed", label: "RAR", description: "Arquivo compactado RAR — boa compressão, formato proprietário." },
            { value: "application/gzip", label: "GZ / GZIP", description: "Compactação GZIP — muito usado em ambientes Unix/Linux." },
            { value: "application/x-7z-compressed", label: "7Z", description: "Arquivo 7-Zip — excelente taxa de compressão." },
            { value: "application/x-tar", label: "TAR", description: "TAR — agrupa arquivos sem compressão (usado com gzip)." },
        ],
    },
    {
        category: "Dados / Código",
        presets: [
            { value: "application/json", label: "JSON", description: "Dados JSON — formato leve para troca de dados." },
            { value: "application/xml", label: "XML", description: "Dados XML — formato de marcação extensível." },
            { value: "text/html", label: "HTML", description: "Página web HTML." },
            { value: "text/css", label: "CSS", description: "Folha de estilo CSS." },
            { value: "application/javascript", label: "JavaScript", description: "Código JavaScript (.js)." },
            { value: "application/x-yaml", label: "YAML", description: "Dados YAML — formato legível para configurações." },
            { value: "text/markdown", label: "Markdown", description: "Texto Markdown (.md) — formatação leve." },
        ],
    },
    {
        category: "Fontes",
        presets: [
            { value: "font/ttf", label: "TTF", description: "Fonte TrueType — amplamente suportada." },
            { value: "font/otf", label: "OTF", description: "Fonte OpenType — recursos tipográficos avançados." },
            { value: "font/woff", label: "WOFF", description: "Web Open Font Format — otimizado para web." },
            { value: "font/woff2", label: "WOFF2", description: "WOFF2 — compressão superior ao WOFF." },
        ],
    },
    {
        category: "Atalhos comuns",
        presets: [
            { value: "image/*", label: "Todas as imagens", description: "Aceita qualquer formato de imagem." },
            { value: "video/*", label: "Todos os vídeos", description: "Aceita qualquer formato de vídeo." },
            { value: "audio/*", label: "Todos os áudios", description: "Aceita qualquer formato de áudio." },
            {
                value: "_group_documentos",
                label: "Documentos comuns",
                description: "PDF + Word .doc e .docx.",
                group: [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ],
            },
            {
                value: "_group_imagens_web",
                label: "Imagens web",
                description: "JPEG, PNG e WebP — formatos mais usados na web.",
                group: ["image/jpeg", "image/png", "image/webp"],
            },
            {
                value: "_group_planilhas",
                label: "Planilhas",
                description: "Excel .xls, .xlsx e CSV.",
                group: [
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "text/csv",
                ],
            },
        ],
    },
];

/** Flat list for search */
export const ALL_FILE_TYPE_PRESETS: FileTypePreset[] = FILE_TYPE_PRESETS.flatMap(
    (c) => c.presets,
);
