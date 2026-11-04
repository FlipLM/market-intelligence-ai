import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Compass, Search, FileText } from "lucide-react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const metadata: Metadata = {
  title: "Market Intelligence B2B — Plataforma de Análise de Nichos",
  description: "Inteligência prévia à prospecção para validação e venda de softwares e sistemas sob demanda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans transition-colors">
        <ThemeProvider>
          {/* Header no estilo do Prospector */}
          <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-white/[0.08] shadow-sm transition-colors">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              {/* Logo & Marca */}
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-600/15 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center group-hover:border-blue-500/50 transition-colors shadow-sm">
                    <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                        Market<span className="text-blue-600 dark:text-blue-400">Intelligence</span>
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/[0.08]">
                        B2B
                      </span>
                    </div>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      Inteligência Pré-Prospecção
                    </span>
                  </div>
                </Link>

                <div className="h-5 w-px bg-slate-200 dark:bg-white/[0.08] hidden sm:block" />

                <nav className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href="/"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
                  >
                    Painel Geral
                  </Link>
                  <Link
                    href="/pesquisa"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
                  >
                    Pesquisar Nichos
                  </Link>
                  <Link
                    href="/relatorios"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
                  >
                    Relatórios
                  </Link>
                </nav>
              </div>

              {/* Status de Conexão com G:\Prospector & Theme Toggle */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-white/[0.04] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.06]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-medium font-mono text-[11px]">G:\Prospector Conectado</span>
                </div>

                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Conteúdo Principal */}
          <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>

          {/* Rodapé Glassmorphism */}
          <footer className="border-t border-slate-200/80 dark:border-white/[0.08] glass-panel-subtle py-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>Market Intelligence B2B — Terminal de Decisão Comercial</span>
              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                Integrado a IBGE CEMPRE, Google Trends, Meta Ad Library & Receita Federal
              </span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
