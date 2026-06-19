import {
  Type, AlignLeft, Hash, Mail, Phone, CreditCard, MapPin,
  Calendar, Clock, ChevronDown, CircleDot, CheckSquare, ListChecks,
  Upload, EyeOff, Layers, BoxSelect, List, ScrollText,
  Lock, ToggleLeft, SlidersHorizontal, Star, Palette, Search,
  Timer, CalendarRange, LayoutList,
} from "lucide-react";

export const FIELD_TYPES = [
  // ── Texto ──────────────────────────────────────
  { component: "texto", label: "Texto", icon: Type, group: "texto" },
  { component: "textarea", label: "Área de texto", icon: AlignLeft, group: "texto" },
  { component: "number", label: "Número", icon: Hash, group: "texto" },
  { component: "email", label: "E-mail", icon: Mail, group: "texto" },
  { component: "password", label: "Senha", icon: Lock, group: "texto" },
  // ── Seleção ────────────────────────────────────
  { component: "select", label: "Seleção", icon: ChevronDown, group: "selecao" },
  { component: "autocomplete", label: "Autocomplete", icon: Search, group: "selecao" },
  { component: "radio", label: "Radio", icon: CircleDot, group: "selecao" },
  { component: "checkbox", label: "Checkbox", icon: CheckSquare, group: "selecao" },
  { component: "checkbox_group", label: "Grupo de checkboxes", icon: ListChecks, group: "selecao" },
  { component: "switch", label: "Switch (toggle)", icon: ToggleLeft, group: "selecao" },
  // ── Numérico / Range ───────────────────────────
  { component: "slider", label: "Slider", icon: SlidersHorizontal, group: "range" },
  { component: "rating", label: "Avaliação (estrelas)", icon: Star, group: "range" },
  { component: "color", label: "Cor", icon: Palette, group: "range" },
  // ── Data / Hora ────────────────────────────────
  { component: "date", label: "Data", icon: Calendar, group: "data" },
  { component: "datetime", label: "Data e hora", icon: Clock, group: "data" },
  { component: "time", label: "Horário", icon: Timer, group: "data" },
  { component: "date_range", label: "Período", icon: CalendarRange, group: "data" },
  // ── Contato / Endereço ─────────────────────────
  { component: "telefone", label: "Telefone", icon: Phone, group: "contato" },
  { component: "cpf", label: "CPF", icon: CreditCard, group: "contato" },
  { component: "cep", label: "CEP", icon: MapPin, group: "contato" },
  // ── Arquivo / Outros ───────────────────────────
  { component: "file", label: "Arquivo", icon: Upload, group: "outros" },
  { component: "hidden", label: "Oculto", icon: EyeOff, group: "outros" },
  { component: "field_array", label: "Lista de itens", icon: List, group: "outros" },
  { component: "terms", label: "Termos e condições", icon: ScrollText, group: "outros" },
  { component: "sub_form", label: "Sub-formulário", icon: LayoutList, group: "outros" },
  // participation_type e payment_method não aparecem aqui —
  // são inseridos APENAS via blocos pré-configurados (PRESET_STEP_BLOCKS).
];

export const STRUCTURE_TYPES = [
  { component: "step", label: "Step", icon: Layers, color: "border-primary/40 bg-primary/5" },
  { component: "container", label: "Container", icon: BoxSelect, color: "border-blue-500/40 bg-blue-500/5" },
];

/**
 * Variáveis do evento disponíveis para interpolação (`{{evento.xxx}}`) e
 * condicionais com `source='evento'`.
 *
 * ⚠️ Mantenha em sincronia com o que o backend expõe no DTO público do evento
 * e com o `eventoResumoToVars` do frontend (a fonte de verdade em runtime).
 * Capacidade/valor-por-dia NÃO vivem mais em colunas flat do evento — saíram
 * pra `vaga_cotas` / `evento_dias`; por isso não há `vagasTotal`/`valorPorDia`/etc.
 * aqui (resolveriam pra `undefined`).
 */
export const EVENT_VARIABLES = [
  { key: 'evento.nome', label: 'Nome do evento', type: 'string' },
  { key: 'evento.descricao', label: 'Descrição', type: 'string' },
  { key: 'evento.valor', label: 'Valor (centavos)', type: 'number' },
  { key: 'evento.controlaDias', label: 'Inscrição por dia?', type: 'boolean' },
  { key: 'evento.controlaGenero', label: 'Controla gênero?', type: 'boolean' },
  { key: 'evento.dataInicioEvento', label: 'Data início', type: 'date' },
  { key: 'evento.dataFimEvento', label: 'Data fim', type: 'date' },
  { key: 'evento.dataAberturaInscricoes', label: 'Abertura inscrições', type: 'date' },
  { key: 'evento.localNome', label: 'Local - Nome', type: 'string' },
  { key: 'evento.localEndereco', label: 'Local - Endereço', type: 'string' },
  { key: 'evento.localTelefone', label: 'Local - Telefone', type: 'string' },
  { key: 'evento.localMapUrl', label: 'Local - URL do mapa', type: 'string' },
  { key: 'evento.localMapLink', label: 'Local - Link do mapa', type: 'string' },
  { key: 'evento.status', label: 'Status do evento', type: 'string' },
  { key: 'evento.publicId', label: 'ID público (URL)', type: 'string' },
  { key: 'evento.fotoCapa', label: 'URL da foto de capa', type: 'string' },
  { key: 'evento.template', label: 'Template visual', type: 'string' },
];

export const getItemType = (id: string): "step" | "container" | "field" => {
  if (id.startsWith("step-") || id === "step") return "step";
  if (id.startsWith("container-") || id === "container") return "container";
  return "field";
};

export const getFieldMeta = (componentType: string) =>
  FIELD_TYPES.find((f) => f.component === componentType);

export const getFieldMetaById = (id: string) => {
  // Tipos com underscore no nome precisam de match exato pelo prefixo
  const underscoreTypes = FIELD_TYPES.map((f) => f.component).filter((c) => c.includes("_"));
  for (const type of underscoreTypes) {
    if (id.startsWith(type)) return FIELD_TYPES.find((f) => f.component === type);
  }
  const base = id.split("-")[0];
  return FIELD_TYPES.find((f) => f.component === base);
};
