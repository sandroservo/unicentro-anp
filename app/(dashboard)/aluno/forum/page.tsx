import { Header } from "@/components/layout/header";
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  Bot,
  Clock,
  Plus,
  Search,
} from "lucide-react";

const posts = [
  {
    id: "p1",
    title: "Dúvida sobre funções com múltiplos parâmetros",
    content: "Como faço para criar uma função que aceita um número variável de argumentos?",
    author: "Maria Silva",
    course: "Introdução à Programação",
    lesson: "Funções",
    replies: 3,
    upvotes: 5,
    resolved: true,
    hasAIReply: true,
    createdAt: "2 horas atrás",
  },
  {
    id: "p2",
    title: "Diferença entre lista e tupla",
    content: "Alguém pode explicar quando usar lista e quando usar tupla?",
    author: "João Santos",
    course: "Introdução à Programação",
    lesson: "Listas e Tuplas",
    replies: 5,
    upvotes: 12,
    resolved: true,
    hasAIReply: true,
    createdAt: "5 horas atrás",
  },
  {
    id: "p3",
    title: "Erro ao executar loop while",
    content: "Meu código entra em loop infinito, o que pode estar errado?",
    author: "Ana Costa",
    course: "Introdução à Programação",
    lesson: "Estruturas de Controle",
    replies: 2,
    upvotes: 3,
    resolved: false,
    hasAIReply: false,
    createdAt: "1 dia atrás",
  },
  {
    id: "p4",
    title: "Dicas para o projeto final",
    content: "Quais são as melhores práticas para organizar o código do projeto?",
    author: "Pedro Lima",
    course: "Introdução à Programação",
    lesson: "Projeto Final",
    replies: 8,
    upvotes: 15,
    resolved: false,
    hasAIReply: true,
    createdAt: "2 dias atrás",
  },
];

export default function ForumPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Fórum"
        subtitle="Discussões e dúvidas dos cursos"
      />

      <div className="flex-1 p-6 overflow-auto">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar discussões..."
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium">
            <Plus size={20} />
            Nova Discussão
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{posts.length}</p>
            <p className="text-sm text-muted-foreground">Discussões</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {posts.filter((p) => p.resolved).length}
            </p>
            <p className="text-sm text-muted-foreground">Resolvidas</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {posts.filter((p) => p.hasAIReply).length}
            </p>
            <p className="text-sm text-muted-foreground">Com resposta IA</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {posts.reduce((acc, p) => acc + p.replies, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Respostas</p>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                  {post.author[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {post.content}
                      </p>
                    </div>
                    {post.resolved && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium whitespace-nowrap">
                        <CheckCircle size={12} />
                        Resolvido
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{post.course}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {post.createdAt}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ThumbsUp size={14} />
                      {post.upvotes}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare size={14} />
                      {post.replies} respostas
                    </span>
                    {post.hasAIReply && (
                      <span className="flex items-center gap-1 text-sm text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        <Bot size={14} />
                        Resposta IA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
