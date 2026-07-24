import { useState, useEffect, useContext } from "react";
import { AdminShell } from "@/components/AdminLayout";
import { AuthContext } from "@/context/AuthContext";
import { FaqAPI } from "@/services/api";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/Dialog";
import { 
  HelpCircle, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Tag 
} from "lucide-react";

const CATEGORIAS = [
  { id: "candidatura", label: "Candidatura" },
  { id: "documentos", label: "Documentos" },
  { id: "residencia", label: "Residência" },
  { id: "prazos", label: "Prazos" },
  { id: "financeiro", label: "Custos / Financeiro" },
  { id: "elegibilidade", label: "Elegibilidade" },
];

export default function AdminFaqs() {
  const { user } = useContext(AuthContext);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Estado do Modal (Criar / Editar)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null); // null = criar, objecto = editar
  const [formData, setFormData] = useState({
    pergunta: "",
    resposta: "",
    categoria: "candidatura"
  });
  const [saving, setSaving] = useState(false);

  // Carregar FAQs do Backend
  const carregarFaqs = async () => {
    setLoading(true);
    try {
      const res = await FaqAPI.listar();
      if (res.data?.ok) {
        setFaqs(res.data.faqs || []);
      }
    } catch (err) {
      toast.error("Erro ao carregar a lista de FAQs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFaqs();
  }, []);

  // Abrir Modal para Criar
  const handleOpenCreate = () => {
    setEditingFaq(null);
    setFormData({ pergunta: "", resposta: "", categoria: "candidatura" });
    setModalOpen(true);
  };

  // Abrir Modal para Editar
  const handleOpenEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      pergunta: faq.pergunta || "",
      resposta: faq.resposta || "",
      categoria: faq.categoria || "candidatura"
    });
    setModalOpen(true);
  };

  // Guardar (Criar ou Atualizar)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.pergunta.trim() || !formData.resposta.trim()) {
      toast.error("Preencha a pergunta e a resposta.");
      return;
    }

    setSaving(true);
    try {
      if (editingFaq) {
        // Atualizar FAQ existente
        await FaqAPI.atualizar(editingFaq.id, formData);
        toast.success("FAQ atualizada com sucesso!");
      } else {
        // Criar nova FAQ
        await FaqAPI.criar(formData);
        toast.success("Nova FAQ adicionada com sucesso!");
      }
      setModalOpen(false);
      carregarFaqs();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erro ao guardar a FAQ.");
    } finally {
      setSaving(false);
    }
  };

  // Apagar FAQ
  const handleDelete = async (id) => {
    if (!window.confirm("Tem a certeza que pretende eliminar esta pergunta frequente?")) return;

    try {
      await FaqAPI.eliminar(id);
      toast.success("FAQ eliminada com sucesso!");
      setFaqs(faqs.filter(f => f.id !== id));
    } catch (err) {
      toast.error("Erro ao eliminar a FAQ.");
    }
  };

  // Filtragem local por pesquisa
  const filteredFaqs = faqs.filter(f => 
    f.pergunta.toLowerCase().includes(query.toLowerCase()) ||
    f.resposta.toLowerCase().includes(query.toLowerCase()) ||
    f.categoria.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AdminShell title="Gestão de Perguntas Frequentes (FAQs)">
      {/* CABEÇALHO COM AÇÕES */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-emerald-950 font-display">Perguntas Frequentes</h2>
          <p className="text-xs text-muted-foreground">Adicione, edite ou remova FAQs visíveis na página pública.</p>
        </div>

        <Button 
          onClick={handleOpenCreate} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Nova Pergunta
        </Button>
      </div>

      {/* TABELA DE FAQS */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar FAQs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-bold text-emerald-950 w-1/3">Pergunta</TableHead>
                  <TableHead className="font-bold text-emerald-950 w-1/2">Resposta</TableHead>
                  <TableHead className="font-bold text-emerald-950">Categoria</TableHead>
                  <TableHead className="text-right font-bold text-emerald-950">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground animate-pulse">
                      A carregar FAQs...
                    </TableCell>
                  </TableRow>
                ) : filteredFaqs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      Nenhuma FAQ encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFaqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell className="font-semibold text-emerald-950 text-sm">
                        {faq.pergunta}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                        {faq.resposta}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Tag className="h-3 w-3" />
                          {faq.categoria}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleOpenEdit(faq)}
                            className="h-8 w-8 p-0 cursor-pointer text-slate-700 hover:bg-slate-100"
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(faq.id)}
                            className="h-8 w-8 p-0 cursor-pointer text-red-600 hover:bg-red-50 border-red-200"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE CRIAR / EDITAR FAQ */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg bg-background border border-border">
          <DialogHeader>
            <DialogTitle className="text-emerald-950 font-display flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-emerald-600" />
              {editingFaq ? "Editar Pergunta Frequente" : "Adicionar Nova FAQ"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 my-2">
            <div className="space-y-1.5">
              <Label htmlFor="categoria">Categoria *</Label>
              <select
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pergunta">Pergunta *</Label>
              <Input
                id="pergunta"
                placeholder="Ex: Qual é o prazo limite de candidatura?"
                value={formData.pergunta}
                onChange={(e) => setFormData({ ...formData, pergunta: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="resposta">Resposta *</Label>
              <Textarea
                id="resposta"
                placeholder="Escreva a resposta detalhada..."
                rows={4}
                value={formData.resposta}
                onChange={(e) => setFormData({ ...formData, resposta: e.target.value })}
                required
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="cursor-pointer">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-bold"
              >
                {saving ? "A guardar..." : (editingFaq ? "Atualizar" : "Criar FAQ")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}