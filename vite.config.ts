import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        react(),
        dts({
            include: ['src'],
            outDir: 'dist',
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'SchemaFormsBuilder',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'cjs' ? 'cjs' : 'js'}`,
        },
        rollupOptions: {
            external: [
                'react',
                'react/jsx-runtime',
                'react-dom',
                'lucide-react',
                '@dnd-kit/core',
                '@dnd-kit/sortable',
                '@dnd-kit/utilities',
                '@schema-forms-data/core',
                '@schema-forms-data/templates',
                '@schema-forms-data/ui',
                '@schema-forms-data/renderer',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react/jsx-runtime': 'ReactJSXRuntime',
                    'react-dom': 'ReactDOM',
                    'lucide-react': 'LucideReact',
                    '@dnd-kit/core': 'DndKitCore',
                    '@dnd-kit/sortable': 'DndKitSortable',
                    '@dnd-kit/utilities': 'DndKitUtilities',
                    '@schema-forms-data/core': 'SchemaFormsCore',
                    '@schema-forms-data/templates': 'SchemaFormsTemplates',
                    '@schema-forms-data/ui': 'SchemaFormsUI',
                    '@schema-forms-data/renderer': 'SchemaFormsRenderer',
                },
            },
        },
        sourcemap: true,
        minify: false,
    },
});
