import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout"; 
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Check } from "lucide-react";

const KINSHIPS = ["Pai", "Mãe", "Irmão", "Irmã", "Avô/Á", "Tio/A", "Outro"];

// Tradução Integrada para a Página de Dados
const traducoesDados = {
  pt: {
    birthdate: "Data de Nascimento",
    cc_number: "Cartão de Cidadão",
    nif: "NIF",
    phone: "Telemóvel",
    address: "Morada Completa",
    postal_code: "Código Postal",
    city: "Cidade / Localidade",
    institution: "Instituição de Ensino Superior",
    course: "Curso",
    academic_year: "Ano Curricular",
    add_member: "Adicionar Membro",
    full_name: "Nome Completo",
    kinship: "Grau de Parentesco",
    back: "Voltar ao Painel",
    save_continue: "Gravar e Continuar"
  },
  en: {
    birthdate: "Birthdate",
    cc_number: "Citizen Card Number",
    nif: "Tax ID (NIF)",
    phone: "Phone Number",
    address: "Full Address",
    postal_code: "Postal Code",
    city: "City",
    institution: "Higher Education Institution",
    course: "Course",
    academic_year: "Academic Year",
    add_member: "Add Member",
    full_name: "Full Name",
    kinship: "Kinship Relation",
    back: "Back to Dashboard",
    save_continue: "Save and Continue"
  }
};

export default function CandidaturaDados() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [lang] = useState("pt"); // Língua padrão
  const t = (key) => traducoesDados[lang]?.[key] || key;

  const [personal, setPersonal] = useState({
    birthdate: "",
    ccNumber: "",
    nif: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    institution: "",
    institutionAlt2: "",
    institutionAlt3: "",
    course: "",
    academicYear: ""
  });
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Proteger Rota
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  //Tenta ler candidatura existente do aluno
  useEffect(() => {
    const carregarCandidaturaExistente = async () => {
      try {
        const response = await api.get("/candidatura/minha");
        if (response.data && response.data.candidatura) {
          const app = response.data.candidatura;
          setPersonal({
            birthdate: app.data_nascimento ? app.data_nascimento.substring(0, 10) : "",
            ccNumber: app.num_cc || "",
            nif: app.nif || "",
            phone: app.telefone || "",
            address: app.morada || "",
            postalCode: app.codigo_postal || "",
            city: app.cidade || "",
            institution: app.instituicao_1 || "",
            institutionAlt2: app.instituicao_2 || "",
            institutionAlt3: app.instituicao_3 || "",
            course: app.curso || "",
            academicYear: app.ano_letivo || ""
          });
          setFamily(response.data.familia || []);
        }
      } catch (err) {
        // Se der 404 significa que é uma candidatura nova, não há problema nenhum!
        if (err.response?.status !== 404) {
          console.error("Erro a carregar candidatura:", err);
          setError("Erro ao carregar dados existentes do servidor.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) carregarCandidaturaExistente();
  }, [user]);

  const setP = (k, v) => setPersonal((p) => ({ ...p, [k]: v }));

  const formatPostal = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 7);
    if (d.length <= 4) return d;
    return `${d.slice(0, 4)}-${d.slice(4)}`;
  };

  const addMember = () => {
    setFamily((f) => [
      ...f,
      { id: `m-${Date.now()}`, nome_completo: "", nif: "", telefone: "", parentesco: "Outro" },
    ]);
  };

  const updateMember = (id, patch) => {
    setFamily((f) => f.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const removeMember = (id) => setFamily((f) => f.filter((m) => m.id !== id));

  // Gravar candidatura
  const submit = async () => {
    try {
      setError("");
      // Mapeia os dados do formulário de volta para os campos exatos do teu Backend
      const payload = {
        data_nascimento: personal.birthdate,
        num_cc: personal.ccNumber,
        nif: personal.nif,
        morada: personal.address,
        codigo_postal: personal.postalCode,
        telefone: personal.phone,
        cidade: personal.city,
        instituicao_1: personal.institution,
        instituicao_2: personal.institutionAlt2 || null,
        instituicao_3: personal.institutionAlt3 || null,
        curso: personal.course,
        ano_letivo: personal.academicYear,
        agregado: family // Envia os membros do agregado familiar associados
      };

      const response = await api.post("/candidatura", payload);

      if (response.data.ok) {
        alert("Dados guardados com sucesso!");
        navigate("/candidatura/documentos");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Ocorreu um erro ao gravar a sua candidatura.");
    }
  };

  const progress = useMemo(() => {
    const required = ["birthdate", "ccNumber", "nif", "address", "postalCode", "phone", "institution", "course", "academicYear"];
    const filled = required.filter((k) => !!personal[k]).length;
    return Math.round((filled / required.length) * 100);
  }, [personal]);

  if (loading) return <div className="p-8 text-center">A verificar candidatura...</div>;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <WizardHeader current={1} progress={progress} />

        {error && <div className="mt-4 text-red-600 font-bold">⚠️ {error}</div>}

        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-bold text-deep">
              1. Dados pessoais e académicos
            </h2>
            <div className="gov-gold-rule mt-2 mb-6 w-12" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("birthdate")}>
                <Input
                  type="date"
                  value={personal.birthdate ?? ""}
                  onChange={(e) => setP("birthdate", e.target.value)}
                />
              </Field>
              <Field label={t("cc_number")}>
                <Input
                  value={personal.ccNumber ?? ""}
                  onChange={(e) => setP("ccNumber", e.target.value)}
                />
              </Field>
              <Field label={t("nif")}>
                <Input
                  inputMode="numeric"
                  maxLength={9}
                  value={personal.nif ?? ""}
                  onChange={(e) => setP("nif", e.target.value.replace(/\D/g, ""))}
                />
              </Field>
              <Field label={t("phone")}>
                <Input
                  value={personal.phone ?? ""}
                  onChange={(e) => setP("phone", e.target.value)}
                />
              </Field>
              <Field label={t("address")} className="sm:col-span-2">
                <Input
                  value={personal.address ?? ""}
                  onChange={(e) => setP("address", e.target.value)}
                />
              </Field>
              <Field label={t("postal_code")}>
                <Input
                  placeholder="0000-000"
                  value={personal.postalCode ?? ""}
                  onChange={(e) => setP("postalCode", formatPostal(e.target.value))}
                />
              </Field>
              <Field label={t("city")}>
                <Input
                  value={personal.city ?? ""}
                  onChange={(e) => setP("city", e.target.value)}
                />
              </Field>
            </div>

            <h3 className="mt-8 font-display text-base font-bold text-deep">
              Ensino Superior
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <Field label={`${t("institution")} — 1ª preferência`}>
                <Input
                  value={personal.institution ?? ""}
                  onChange={(e) => setP("institution", e.target.value)}
                />
              </Field>
              <Field label="2ª preferência">
                <Input
                  value={personal.institutionAlt2 ?? ""}
                  onChange={(e) => setP("institutionAlt2", e.target.value)}
                />
              </Field>
              <Field label="3ª preferência">
                <Input
                  value={personal.institutionAlt3 ?? ""}
                  onChange={(e) => setP("institutionAlt3", e.target.value)}
                />
              </Field>
              <Field label={t("course")} className="sm:col-span-2">
                <Input
                  value={personal.course ?? ""}
                  onChange={(e) => setP("course", e.target.value)}
                />
              </Field>
              <Field label={t("academic_year")}>
                <Select value={personal.academicYear ?? ""} onValueChange={(v) => setP("academicYear", v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {["1º ano", "2º ano", "3º ano", "4º ano", "5º ano", "Mestrado"].map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Agregado Familiar */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-deep">
                  Agregado familiar
                </h2>
                <p className="text-xs text-muted-foreground">
                  Adicione todos os membros que compõem o seu agregado.
                </p>
              </div>
              <Button onClick={addMember} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> {t("add_member")}
              </Button>
            </div>
            <div className="gov-gold-rule mt-2 mb-4 w-12" />

            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("full_name")}</TableHead>
                    <TableHead>{t("nif")}</TableHead>
                    <TableHead>{t("phone")}</TableHead>
                    <TableHead>{t("kinship")}</TableHead>
                    <TableHead className="w-14"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {family.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                        Nenhum membro adicionado ainda.
                      </TableCell>
                    </TableRow>
                  )}
                  {family.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <Input value={m.nome_completo || m.fullName} onChange={(e) => updateMember(m.id, { nome_completo: e.target.value })} />
                      </TableCell>
                      <TableCell>
                        <Input
                          inputMode="numeric"
                          maxLength={9}
                          value={m.nif}
                          onChange={(e) => updateMember(m.id, { nif: e.target.value.replace(/\D/g, "") })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input value={m.telefone || m.phone} onChange={(e) => updateMember(m.id, { telefone: e.target.value })} />
                      </TableCell>
                      <TableCell>
                        <Select value={m.parentesco || m.kinship} onValueChange={(v) => updateMember(m.id, { parentesco: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {KINSHIPS.map((k) => (
                              <SelectItem key={k} value={k}>{k}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => removeMember(m.id)}>
                          <Trash2 className="h-4 w-4 text-status-danger" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => navigate("/painel")}>
            {t("back")}
          </Button>
          <Button size="lg" onClick={submit} className="gap-2">
            <Check className="h-4 w-4" /> {t("save_continue")}
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}

function Field({ label, children, className }) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function WizardHeader({ current, progress }) {
  const steps = ["Dados", "Documentos", "Revisão"];
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-primary">
        Passo {current} de 3
      </div>
      <h1 className="mt-1 font-display text-2xl font-bold text-deep sm:text-3xl">
        Nova candidatura
      </h1>
      <div className="gov-gold-rule mt-2 mb-6 w-16" />
      <div className="grid grid-cols-3 gap-2">
        {steps.map((s, i) => {
          const idx = i + 1;
          const done = idx < current;
          const active = idx === current;
          return (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 font-display text-sm font-bold ${
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary bg-background text-primary"
                      : "border-border bg-background text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : idx}
              </div>
              <div className="min-w-0">
                <div className={`truncate text-sm font-medium ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
                  {s}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress ?? ((current - 1) / 3) * 100 + 15}%` }}
        />
      </div>
    </div>
  );
}