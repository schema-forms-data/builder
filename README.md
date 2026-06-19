# @schema-forms-data/builder

> Builder visual de formulários SchemaForms — editor drag-and-drop para criar e editar `FormSchema`.

[![npm](https://img.shields.io/npm/v/@schema-forms-data/builder)](https://www.npmjs.com/package/@schema-forms-data/builder)
[![license](https://img.shields.io/npm/l/@schema-forms-data/builder)](./LICENSE)

Interface visual completa para construção de formulários. Usa `@dnd-kit` para drag-and-drop, exibe um preview em tempo real do formulário via `@schema-forms-data/renderer` e exporta o schema resultante.

## Install

```bash
pnpm add @schema-forms-data/builder
```

## O que inclui

- **`BuilderWrapper`** — componente top-level com canvas + palette + config panel
- **Canvas** — área de edição visual com grid e drag-and-drop de steps/containers/campos
- **Palette** — lista de tipos de campo arrastáveis
- **ConfigPanel** — editor de propriedades do campo selecionado (validação, condições, opções)
- **LivePreview** — preview do formulário em tempo real dentro do builder

## Peer dependencies

```bash
pnpm add react react-dom lucide-react @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Dependências em outros pacotes

| Depende de | Motivo |
|---|---|
| `@schema-forms-data/core` | Tipos e enums do schema |
| `@schema-forms-data/templates` | Sistema de temas |
| `@schema-forms-data/ui` | Componentes visuais do painel de config |
| `@schema-forms-data/renderer` | Renderiza o LivePreview dentro do builder |

> Ao instalar `@schema-forms-data/builder`, todas as quatro dependências acima já vêm automaticamente.

## Uso

```tsx
import { BuilderWrapper } from '@schema-forms-data/builder';

<BuilderWrapper
  initialSchema={existingSchema}
  onChange={(schema) => console.log(schema)}
/>
```

---

## Build

```bash
pnpm install
pnpm build      # tsc -> dist/
```

## Publicar

Automático: a cada **push na `main`**, o workflow (`.github/workflows/publish.yml`)
publica **somente se a versão do `package.json` ainda não existir no npm**. Push de
README/refactor não republica nada — pra lançar, basta dar bump na versão:

```bash
npm version patch        # 4.0.7 -> 4.0.8 (faz commit + tag)
git push --follow-tags   # push na main dispara o publish da nova versão
```

Usa **npm Trusted Publishing (OIDC)** — sem `NPM_TOKEN` armazenado — e anexa
**provenance** automaticamente.

> Primeira publicação: o Trusted Publisher do npm precisa do pacote já existindo.
> Faça a versão inicial uma vez manualmente (`npm publish`), depois configure o Trusted
> Publisher no npmjs.com e deixe o restante por conta do workflow.

## Licença

[MIT](LICENSE) © Inovex Tecnologia
