/**
 * 120+ regex presets organized by category.
 * Each preset has: pattern, label (short name), description (tooltip).
 */

export interface RegexPreset {
    pattern: string;
    label: string;
    description: string;
}

export interface RegexCategory {
    category: string;
    presets: RegexPreset[];
}

export const REGEX_PRESETS: RegexCategory[] = [
    {
        category: "Texto básico",
        presets: [
            { pattern: "^[A-Za-z]+$", label: "Apenas letras", description: "Aceita somente letras de A-Z (maiúsculas e minúsculas), sem espaços, números ou especiais." },
            { pattern: "^[a-z]+$", label: "Apenas minúsculas", description: "Aceita somente letras minúsculas de a-z." },
            { pattern: "^[A-Z]+$", label: "Apenas maiúsculas", description: "Aceita somente letras maiúsculas de A-Z." },
            { pattern: "^[A-Za-zÀ-ÿ]+$", label: "Letras com acentos", description: "Aceita letras incluindo acentuadas (é, ã, ü, etc.)." },
            { pattern: "^[A-Za-zÀ-ÿ\\s]+$", label: "Letras, acentos e espaços", description: "Aceita letras com acentos e espaços — ideal para nomes completos." },
            { pattern: "^[A-Za-z0-9]+$", label: "Alfanumérico", description: "Apenas letras e números, sem espaços ou caracteres especiais." },
            { pattern: "^[A-Za-z0-9\\s]+$", label: "Alfanumérico com espaços", description: "Letras, números e espaços." },
            { pattern: "^[A-Za-z0-9_]+$", label: "Alfanumérico + underscore", description: "Letras, números e underscore (_). Padrão para usernames." },
            { pattern: "^[A-Za-z0-9_-]+$", label: "Slug-friendly", description: "Letras, números, underscore e hífen. Ideal para slugs de URL." },
            { pattern: "^\\S+$", label: "Sem espaços", description: "Aceita qualquer caractere exceto espaços em branco." },
            { pattern: "^.{1,}$", label: "Não vazio", description: "Exige pelo menos 1 caractere (qualquer um)." },
        ],
    },
    {
        category: "Números",
        presets: [
            { pattern: "^[0-9]+$", label: "Apenas dígitos", description: "Aceita somente dígitos numéricos (0-9)." },
            { pattern: "^-?[0-9]+$", label: "Inteiro (com negativo)", description: "Número inteiro, opcionalmente negativo." },
            { pattern: "^[0-9]+\\.?[0-9]*$", label: "Decimal positivo", description: "Número decimal positivo (ex: 3.14, 42)." },
            { pattern: "^-?[0-9]+\\.?[0-9]*$", label: "Decimal (com negativo)", description: "Número decimal, opcionalmente negativo." },
            { pattern: "^\\d{1,3}(\\.\\d{3})*(,\\d{2})?$", label: "Formato BR (1.234,56)", description: "Número no formato brasileiro com pontos de milhar e vírgula decimal." },
            { pattern: "^\\d{1,3}(,\\d{3})*(\\.\\d{2})?$", label: "Formato US (1,234.56)", description: "Número no formato americano com vírgulas de milhar e ponto decimal." },
            { pattern: "^[01]+$", label: "Binário", description: "Aceita apenas 0 e 1 — representação binária." },
            { pattern: "^[0-9A-Fa-f]+$", label: "Hexadecimal", description: "Aceita dígitos hexadecimais (0-9, A-F)." },
            { pattern: "^0[xX][0-9A-Fa-f]+$", label: "Hex com prefixo 0x", description: "Hexadecimal com prefixo 0x (ex: 0xFF)." },
            { pattern: "^[0-7]+$", label: "Octal", description: "Aceita apenas dígitos octais (0-7)." },
            { pattern: "^\\d+(\\.\\d{1,2})?$", label: "Monetário (2 casas)", description: "Número com até 2 casas decimais — ideal para valores monetários." },
            { pattern: "^\\d+(\\.\\d{1,4})?$", label: "Até 4 casas decimais", description: "Número com até 4 casas decimais." },
        ],
    },
    {
        category: "Documentos BR",
        presets: [
            { pattern: "^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$", label: "CPF (com máscara)", description: "CPF formatado: 123.456.789-00." },
            { pattern: "^\\d{11}$", label: "CPF (sem máscara)", description: "CPF apenas dígitos: 12345678900." },
            { pattern: "^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$", label: "CNPJ (com máscara)", description: "CNPJ formatado: 12.345.678/0001-00." },
            { pattern: "^\\d{14}$", label: "CNPJ (sem máscara)", description: "CNPJ apenas dígitos: 12345678000100." },
            { pattern: "^\\d{5}-?\\d{3}$", label: "CEP", description: "CEP brasileiro: 12345-678 ou 12345678." },
            { pattern: "^\\d{1,2}\\.\\d{3}\\.\\d{3}[-]?\\d{1}$", label: "RG (formato comum)", description: "RG no formato mais comum: 1.234.567-8." },
            { pattern: "^\\d{11}$", label: "PIS/PASEP", description: "PIS/PASEP com 11 dígitos." },
            { pattern: "^\\d{3}\\.?\\d{7}-?\\d{1}$", label: "Título de eleitor", description: "Título de eleitor com 12 dígitos." },
            { pattern: "^[A-Z]{2}\\d{7}$", label: "Passaporte BR", description: "Passaporte brasileiro: 2 letras + 7 dígitos (ex: AB1234567)." },
            { pattern: "^\\d{11}$", label: "CNH (registro)", description: "Número de registro da CNH: 11 dígitos." },
            { pattern: "^\\d{10}$", label: "Certidão (matrícula)", description: "Matrícula de certidão de nascimento/casamento." },
            { pattern: "^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$|^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$", label: "CPF ou CNPJ", description: "Aceita CPF (123.456.789-00) ou CNPJ (12.345.678/0001-00)." },
        ],
    },
    {
        category: "Contato",
        presets: [
            { pattern: "^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$", label: "E-mail simples", description: "Validação básica de e-mail: usuario@dominio.com." },
            { pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", label: "E-mail completo", description: "E-mail com mais caracteres aceitos no usuário." },
            { pattern: "^\\(\\d{2}\\)\\s?\\d{4,5}-\\d{4}$", label: "Telefone BR (com máscara)", description: "Telefone formatado: (11) 91234-5678 ou (11) 1234-5678." },
            { pattern: "^\\d{10,11}$", label: "Telefone BR (sem máscara)", description: "Telefone apenas dígitos: 11912345678." },
            { pattern: "^\\+\\d{1,3}\\s?\\d{2,3}\\s?\\d{4,5}[-]?\\d{4}$", label: "Telefone internacional", description: "Formato +55 11 91234-5678." },
            { pattern: "^\\+55\\d{10,11}$", label: "Celular BR (+55)", description: "Celular brasileiro com DDI: +5511912345678." },
            { pattern: "^\\d{4,5}-\\d{4}$", label: "Telefone (sem DDD)", description: "Número local: 1234-5678 ou 91234-5678." },
            { pattern: "^0800\\d{6,7}$", label: "0800", description: "Número 0800 (SAC): 0800XXXXXXX." },
        ],
    },
    {
        category: "Internet / URLs",
        presets: [
            { pattern: "^https?://[\\w.-]+(:\\d+)?(/[\\w./-]*)*$", label: "URL HTTP/HTTPS", description: "URL completa com protocolo http ou https." },
            { pattern: "^(https?://)?[\\w.-]+\\.[A-Za-z]{2,}(/.*)?$", label: "URL (protocolo opcional)", description: "URL com ou sem http:// na frente." },
            { pattern: "^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\\.[a-z]{2,}$", label: "Domínio", description: "Nome de domínio válido: exemplo.com.br." },
            { pattern: "^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$", label: "IPv4", description: "Endereço IPv4: 192.168.0.1." },
            { pattern: "^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$", label: "IPv6 (completo)", description: "Endereço IPv6 completo." },
            { pattern: "^[a-z][a-z0-9-]*$", label: "Subdomínio", description: "Nome de subdomínio válido (letra inicial, alfanumérico + hífen)." },
            { pattern: "^[A-Za-z][A-Za-z0-9+.-]*://.*$", label: "URI genérica", description: "Qualquer URI com esquema (ftp://, mailto:, tel:, etc.)." },
            { pattern: "^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$", label: "Cor hex (#FFF)", description: "Código de cor hexadecimal: #FFF ou #FFFFFF." },
            { pattern: "^#[0-9A-Fa-f]{8}$", label: "Cor hex com alpha", description: "Cor hexadecimal com canal alpha: #FFFFFFFF." },
            { pattern: "^rgb\\(\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*\\)$", label: "Cor RGB", description: "Cor no formato rgb(255, 0, 0)." },
        ],
    },
    {
        category: "Data e hora",
        presets: [
            { pattern: "^\\d{2}/\\d{2}/\\d{4}$", label: "Data DD/MM/AAAA", description: "Data no formato brasileiro: 25/12/2024." },
            { pattern: "^\\d{4}-\\d{2}-\\d{2}$", label: "Data ISO (AAAA-MM-DD)", description: "Data no formato ISO 8601: 2024-12-25." },
            { pattern: "^\\d{2}/\\d{2}/\\d{2}$", label: "Data DD/MM/AA", description: "Data com ano de 2 dígitos: 25/12/24." },
            { pattern: "^\\d{2}-\\d{2}-\\d{4}$", label: "Data DD-MM-AAAA", description: "Data com hífens: 25-12-2024." },
            { pattern: "^\\d{2}:\\d{2}$", label: "Hora HH:MM", description: "Horário 24h: 14:30." },
            { pattern: "^\\d{2}:\\d{2}:\\d{2}$", label: "Hora HH:MM:SS", description: "Horário com segundos: 14:30:59." },
            { pattern: "^(0[1-9]|1[0-2])/\\d{4}$", label: "Mês/Ano (MM/AAAA)", description: "Mês e ano: 12/2024." },
            { pattern: "^\\d{4}$", label: "Ano (4 dígitos)", description: "Ano com 4 dígitos: 2024." },
            { pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$", label: "DateTime ISO (sem seg)", description: "Data e hora ISO: 2024-12-25T14:30." },
            { pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$", label: "DateTime ISO (com seg)", description: "Data e hora ISO com segundos." },
            { pattern: "^\\d{2}/\\d{2}/\\d{4}\\s\\d{2}:\\d{2}$", label: "DateTime BR", description: "Data e hora BR: 25/12/2024 14:30." },
        ],
    },
    {
        category: "Senhas",
        presets: [
            { pattern: "^.{6,}$", label: "Mín. 6 caracteres", description: "Exige no mínimo 6 caracteres (qualquer tipo)." },
            { pattern: "^.{8,}$", label: "Mín. 8 caracteres", description: "Exige no mínimo 8 caracteres." },
            { pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$", label: "Forte (letra+número)", description: "Mín. 8 chars com pelo menos 1 maiúscula, 1 minúscula e 1 número." },
            { pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$", label: "Muito forte", description: "Mín. 8 chars com maiúscula, minúscula, número e caractere especial." },
            { pattern: "^(?=.*[A-Z])(?=.*\\d).{6,}$", label: "Média (maiúsc+número)", description: "Mín. 6 chars com pelo menos 1 maiúscula e 1 número." },
            { pattern: "^(?!.*\\s).{8,}$", label: "Sem espaços (mín. 8)", description: "Mín. 8 caracteres, sem espaços." },
        ],
    },
    {
        category: "Nomes e texto formatado",
        presets: [
            { pattern: "^[A-Za-zÀ-ÿ]{2,}(\\s[A-Za-zÀ-ÿ]{2,})+$", label: "Nome completo", description: "Nome e sobrenome (mínimo 2 palavras, cada com 2+ letras)." },
            { pattern: "^[A-Za-zÀ-ÿ]{2,}$", label: "Primeiro nome", description: "Apenas o primeiro nome (mínimo 2 letras, com acentos)." },
            { pattern: "^[A-Za-zÀ-ÿ'\\-\\s]+$", label: "Nome com apóstrofo/hífen", description: "Nome que aceita D'Silva, Maria-José, etc." },
            { pattern: "^[A-Z][a-zà-ÿ]+(\\s[A-Z][a-zà-ÿ]+)*$", label: "Nome capitalizado", description: "Cada palavra inicia com maiúscula: João Silva." },
            { pattern: "^@[A-Za-z0-9_]{1,30}$", label: "Username (@handle)", description: "Username no estilo @usuario (letras, números, underscore, até 30 chars)." },
            { pattern: "^[a-z0-9_]{3,20}$", label: "Username simples", description: "Username minúsculo: 3-20 chars, letras, números e underscore." },
            { pattern: "^[A-Za-z0-9._%+-]+$", label: "Parte local do e-mail", description: "Parte antes do @ em endereços de e-mail." },
        ],
    },
    {
        category: "Endereço",
        presets: [
            { pattern: "^[A-Za-zÀ-ÿ0-9\\s,./-]+$", label: "Endereço genérico", description: "Aceita letras, números, espaços, vírgulas, pontos, barras e hífens." },
            { pattern: "^\\d{1,6}$", label: "Número residencial", description: "Número do endereço: 1 a 6 dígitos." },
            { pattern: "^\\d{5}-?\\d{3}$", label: "CEP", description: "CEP: 12345-678 ou 12345678." },
            { pattern: "^[A-Z]{2}$", label: "UF (estado)", description: "Sigla do estado brasileiro: SP, RJ, MG, etc." },
            { pattern: "^(Rua|Av|Avenida|Travessa|Alameda|Praça|Rod|Rodovia)\\s.+$", label: "Logradouro BR", description: "Começa com tipo de via: Rua, Avenida, Travessa, etc." },
            { pattern: "^(Apt|Apto|Sala|Bloco|Lote|Casa)\\s?\\d+.*$", label: "Complemento", description: "Complemento: Apto 123, Bloco B, Sala 3, etc." },
        ],
    },
    {
        category: "Financeiro",
        presets: [
            { pattern: "^R\\$\\s?\\d{1,3}(\\.\\d{3})*(,\\d{2})?$", label: "Moeda BRL (R$)", description: "Valor em reais: R$ 1.234,56." },
            { pattern: "^\\$\\d{1,3}(,\\d{3})*(\\.\\d{2})?$", label: "Moeda USD ($)", description: "Valor em dólares: $1,234.56." },
            { pattern: "^\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}$", label: "Cartão de crédito", description: "Número de cartão: 1234 5678 9012 3456." },
            { pattern: "^(0[1-9]|1[0-2])/\\d{2}$", label: "Validade cartão (MM/AA)", description: "Data de validade: 12/25." },
            { pattern: "^\\d{3,4}$", label: "CVV", description: "Código de segurança: 3 ou 4 dígitos." },
            { pattern: "^\\d{1,6}(-[0-9Xx])?$", label: "Agência bancária", description: "Número da agência: 1234-5 ou 1234." },
            { pattern: "^\\d{1,12}(-[0-9Xx])?$", label: "Conta bancária", description: "Número da conta: até 12 dígitos com dígito verificador." },
            { pattern: "^\\d{1,3}(\\.\\d{3})*(,\\d{2})$", label: "Valor BR sem símbolo", description: "Valor monetário sem R$: 1.234,56." },
        ],
    },
    {
        category: "Veículos",
        presets: [
            { pattern: "^[A-Z]{3}-?\\d{4}$", label: "Placa antiga (ABC-1234)", description: "Placa veicular formato antigo: ABC-1234." },
            { pattern: "^[A-Z]{3}\\d[A-Z]\\d{2}$", label: "Placa Mercosul (ABC1D23)", description: "Placa veicular Mercosul: ABC1D23." },
            { pattern: "^[A-Z]{3}-?\\d{4}$|^[A-Z]{3}\\d[A-Z]\\d{2}$", label: "Placa (ambos formatos)", description: "Aceita placa antiga (ABC-1234) ou Mercosul (ABC1D23)." },
            { pattern: "^\\d{11}$", label: "RENAVAM", description: "RENAVAM: 11 dígitos numéricos." },
            { pattern: "^[A-Z0-9]{17}$", label: "Chassi (VIN)", description: "Número de chassi/VIN: 17 caracteres alfanuméricos maiúsculos." },
        ],
    },
    {
        category: "Códigos e identificadores",
        presets: [
            { pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", label: "UUID v4", description: "UUID formato padrão: 550e8400-e29b-41d4-a716-446655440000." },
            { pattern: "^[A-Za-z0-9+/]+={0,2}$", label: "Base64", description: "String codificada em Base64." },
            { pattern: "^[A-Za-z0-9-_]+$", label: "Base64 URL-safe", description: "Base64 com caracteres seguros para URL." },
            { pattern: "^[0-9a-f]{32}$", label: "MD5 hash", description: "Hash MD5: 32 caracteres hexadecimais." },
            { pattern: "^[0-9a-f]{40}$", label: "SHA-1 hash", description: "Hash SHA-1: 40 caracteres hexadecimais." },
            { pattern: "^[0-9a-f]{64}$", label: "SHA-256 hash", description: "Hash SHA-256: 64 caracteres hexadecimais." },
            { pattern: "^\\d{8,14}$", label: "Código de barras", description: "Código de barras numérico: 8-14 dígitos." },
            { pattern: "^\\d{44}$", label: "Linha digitável boleto", description: "Linha digitável de boleto: 44 dígitos." },
            { pattern: "^[A-Z]{2}\\d{2}[A-Z0-9]{4}\\d{7}([A-Z0-9]?){0,16}\\d{2}$", label: "IBAN", description: "Código bancário internacional IBAN." },
            { pattern: "^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$", label: "SWIFT/BIC", description: "Código SWIFT bancário: 8 ou 11 caracteres." },
        ],
    },
    {
        category: "Saúde e governo",
        presets: [
            { pattern: "^\\d{15}$", label: "Cartão SUS", description: "Número do Cartão Nacional de Saúde: 15 dígitos." },
            { pattern: "^\\d{6,7}$", label: "CRM/CRO/CRP", description: "Número de registro profissional de saúde." },
            { pattern: "^\\d{3}\\.\\d{5}\\.\\d{2}-\\d$", label: "NIT/PIS", description: "Número de Identificação do Trabalhador." },
            { pattern: "^\\d{7}-?\\d{2}\\.\\d{4}\\.\\d\\.\\d{2}\\.\\d{4}$", label: "Processo judicial", description: "Número de processo judicial (formato CNJ)." },
            { pattern: "^\\d{12}$", label: "Inscrição estadual (genérica)", description: "Inscrição estadual genérica: 12 dígitos." },
            { pattern: "^\\d{11}$", label: "NIS/NIT", description: "Número de Identificação Social: 11 dígitos." },
        ],
    },
    {
        category: "Redes sociais",
        presets: [
            { pattern: "^https?://(www\\.)?instagram\\.com/[A-Za-z0-9_.]+/?$", label: "Perfil Instagram", description: "URL de perfil do Instagram." },
            { pattern: "^https?://(www\\.)?facebook\\.com/.+$", label: "Perfil Facebook", description: "URL de perfil ou página do Facebook." },
            { pattern: "^https?://(www\\.)?linkedin\\.com/in/[A-Za-z0-9-]+/?$", label: "Perfil LinkedIn", description: "URL de perfil do LinkedIn." },
            { pattern: "^https?://(www\\.)?(twitter|x)\\.com/[A-Za-z0-9_]+/?$", label: "Perfil Twitter/X", description: "URL de perfil no Twitter/X." },
            { pattern: "^https?://(www\\.)?youtube\\.com/(c/|channel/|@)[A-Za-z0-9_-]+/?$", label: "Canal YouTube", description: "URL de canal do YouTube." },
            { pattern: "^https?://(www\\.)?github\\.com/[A-Za-z0-9_-]+/?$", label: "Perfil GitHub", description: "URL de perfil do GitHub." },
            { pattern: "^https?://(www\\.)?tiktok\\.com/@[A-Za-z0-9_.]+/?$", label: "Perfil TikTok", description: "URL de perfil do TikTok." },
        ],
    },
    {
        category: "Programação",
        presets: [
            { pattern: "^[a-z][a-zA-Z0-9]*$", label: "camelCase", description: "Formato camelCase: minúscula inicial, sem espaços." },
            { pattern: "^[A-Z][a-zA-Z0-9]*$", label: "PascalCase", description: "Formato PascalCase: maiúscula inicial." },
            { pattern: "^[a-z]+(_[a-z]+)*$", label: "snake_case", description: "Formato snake_case: minúsculas separadas por underscore." },
            { pattern: "^[a-z]+(-[a-z]+)*$", label: "kebab-case", description: "Formato kebab-case: minúsculas separadas por hífen." },
            { pattern: "^[A-Z]+(_[A-Z]+)*$", label: "SCREAMING_SNAKE", description: "Constantes: MAIÚSCULAS_COM_UNDERSCORES." },
            { pattern: "^[a-zA-Z_$][a-zA-Z0-9_$]*$", label: "Variável JS válida", description: "Nome de variável JavaScript válido." },
            { pattern: "^v?\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9.]+)?$", label: "Semver", description: "Versionamento semântico: v1.2.3 ou 1.2.3-beta.1." },
            { pattern: "^[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$", label: "Nome de pacote npm", description: "Nome válido de pacote npm." },
        ],
    },
];

/** Flat list for search */
export const ALL_REGEX_PRESETS: RegexPreset[] = REGEX_PRESETS.flatMap(
    (c) => c.presets,
);
