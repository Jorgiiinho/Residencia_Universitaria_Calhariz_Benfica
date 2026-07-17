import { useNavigate } from "react-router-dom"; 
import { useEffect, useMemo, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext"; 
import { PublicLayout } from "@/components/PublicLayout"; 
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useI18n, useStore } from "@/lib/providers";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/Table";
import { Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { CandidaturaAPI } from "@/services/api";

const KINSHIPS = ["Pai", "Mãe", "Irmão", "Irmã", "Avô/Avó", "Tio/A", "Outro"];

export default function WizardData() {
  const { t } = useI18n();
  const { user, authenticated } = useContext(AuthContext); 
  const { getApplicationForCurrent, updateApplication, syncCandidatura } = useStore();
  const navigate = useNavigate();

  // Segurança de sessão pura
  useEffect(() => {
    if (!authenticated) navigate("/login");
  }, [authenticated, navigate]);

  const app = getApplicationForCurrent();

  const [personal, setPersonal] = useState(() => app?.personal ?? {});
  const [family, setFamily] = useState(() => app?.family ?? []);

  useEffect(() => {
    if (app?.personal) setPersonal(app.personal);
    if (app?.family) setFamily(app.family);
  }, [app]);

  const setP = (k, v) => setPersonal((p) => ({ ...p, [k]: v }));

  const formatPostal = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 7);
    if (d.length <= 4) return d;
    return `${d.slice(0, 4)}-${d.slice(4)}`;
  };

  const addMember = () => {
    setFamily((f) => [
      ...f,
      { id: `m-${Date.now()}`, fullName: "", nif: "", phone: "", kinship: "Outro" }
    ]);
  };

  const updateMember = (id, patch) => {
    setFamily((f) => f.map((m) => m.id === id ? { ...m, ...patch } : m));
  };

  const removeMember = (id) => setFamily((f) => f.filter((m) => m.id !== id));

  // VALIDAÇÃO TOTAL DO FORMULÁRIO (Com "freguesia" obrigatória)
  const isFormValid = () => {
    console.log("📋 [Validação] A testar todos os campos obrigatórios...", personal);

    if (!personal.birthdate) {
      console.warn("❌ Falha na validação: Falta a Data de Nascimento.");
      toast.error("A data de nascimento é obrigatória.");
      return false;
    }
    if (!personal.ccNumber || personal.ccNumber.trim().length < 8) {
      console.warn("❌ Falha na validação: CC ausente ou curto.");
      toast.error("O número do Cartão de Cidadão é obrigatório (mín. 8 caracteres).");
      return false;
    }
    if (!personal.nif || personal.nif.length !== 9) {
      console.warn("❌ Falha na validação: NIF inválido.");
      toast.error("O NIF é obrigatório e deve conter exatamente 9 dígitos.");
      return false;
    }
    if (!personal.phone || personal.phone.replace(/[^0-9]/g, "").length < 9) {
      console.warn("❌ Falha na validação: Telefone inválido.");
      toast.error("O telefone é obrigatório e deve ter um formato válido (mín. 9 dígitos).");
      return false;
    }
    if (!personal.address || personal.address.trim().length < 5) {
      console.warn("❌ Falha na validação: Morada vazia ou muito curta.");
      toast.error("A morada é obrigatória.");
      return false;
    }
    const postalRegex = /^\d{4}-\d{3}$/;
    if (!personal.postalCode || !postalRegex.test(personal.postalCode)) {
      console.warn("❌ Falha na validação: Código Postal incorreto.");
      toast.error("O código postal é obrigatório e deve seguir o formato XXXX-XXX.");
      return false;
    }
    if (!personal.freguesia || personal.freguesia.trim().length < 2) {
      console.warn("❌ Falha na validação: Freguesia vazia.");
      toast.error("A freguesia é obrigatória.");
      return false;
    }
    if (!personal.institution || personal.institution.trim().length < 3) {
      console.warn("❌ Falha na validação: Instituição ausente.");
      toast.error("A instituição de ensino superior (1ª preferência) é obrigatória.");
      return false;
    }
    if (!personal.course || personal.course.trim().length < 3) {
      console.warn("❌ Falha na validação: Curso ausente.");
      toast.error("O curso de ensino superior é obrigatório.");
      return false;
    }
    if (!personal.academicYear) {
      console.warn("❌ Falha na validação: Ano Letivo ausente.");
      toast.error("A seleção do ano letivo é obrigatória.");
      return false;
    }

    for (let i = 0; i < family.length; i++) {
      const m = family[i];
      if (!m.fullName || m.fullName.trim().length < 3) {
        console.warn(`❌ Falha no agregado familiar: Membro #${i + 1} sem nome.`);
        toast.error(`O nome do familiar #${i + 1} é obrigatório.`);
        return false;
      }
      if (!m.nif || m.nif.length !== 9) {
        console.warn(`❌ Falha no agregado familiar: Membro ${m.fullName} com NIF incorreto.`);
        toast.error(`O NIF do familiar "${m.fullName}" deve ter exatamente 9 dígitos.`);
        return false;
      }
      if (!m.phone || m.phone.replace(/[^0-9]/g, "").length < 9) {
        console.warn(`❌ Falha no agregado familiar: Membro ${m.fullName} sem telefone.`);
        toast.error(`O telefone de "${m.fullName}" deve ter um formato válido (mín. 9 dígitos).`);
        return false;
      }
    }

    console.log("✅ [Validação] Formulário 100% correto! A enviar...");
    return true;
  };

  const submit = async () => {
    if (!isFormValid()) return;

    const targetAppId = app?.id || `APP-${new Date().getFullYear()}-TEMP`;
    
    const payload = {
      candidato: {
        data_nascimento: personal.birthdate,
        num_cc: personal.ccNumber,
        nif: personal.nif,
        morada: personal.address,
        codigo_postal: personal.postalCode,
        freguesia: personal.freguesia,
        telefone: personal.phone,
        instituicao_1: personal.institution,
        instituicao_2: personal.institutionAlt2 ?? null,
        instituicao_3: personal.institutionAlt3 ?? null,
        curso: personal.course,
        ano_letivo: personal.academicYear,
      },
      agregado_familiar: family.map((m) => ({
        nome_completo: m.fullName,
        nif: m.nif,
        telefone: m.phone,
        grau_parentesco: m.kinship,
      })),
    };

    try {
      //  Grava na Base de Dados real (TiDB)
      await CandidaturaAPI.criarOuAtualizar(payload);
      
      //  Sincroniza o estado passando os dados reais do AuthContext para a ponte
      if (syncCandidatura && user) {
        await syncCandidatura(user.id || user.userId, user.role || user.tipo);
      }

      toast.success("Dados guardados com sucesso!");
      
      // Navega para a etapa de uploads
      navigate("/candidatura/documentos");
    } catch (err) {
      console.error("Erro na API ao guardar:", err);
      toast.error("Ocorreu um erro ao salvar na base de dados externa.");
    }
  }
  const progress = useMemo(() => {
    const required = ["birthdate", "ccNumber", "nif", "address", "postalCode", "freguesia", "institution", "course", "academicYear", "phone"];
    const filled = required.filter((k) => !!personal[k]).length;
    return Math.round((filled / required.length) * 100);
  }, [personal]);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <WizardHeader current={1} progress={progress} />

        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-bold text-emerald-900">
              1. Dados pessoais e académicos
            </h2>
            <div className="gov-gold-rule mt-2 mb-6 w-12 bg-amber-500 h-0.5" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("birthdate")} required>
                <Input type="date" value={personal.birthdate ?? ""} onChange={(e) => setP("birthdate", e.target.value)} />
              </Field>
              
              <Field label={t("cc_number")} required>
                <Input 
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="12345678"
                  value={personal.ccNumber ?? ""} 
                  onChange={(e) => setP("ccNumber", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} 
                />
              </Field>
              
              <Field label={t("nif")} required>
                <Input 
                  inputMode="numeric" 
                  maxLength={9} 
                  placeholder="123456789"
                  value={personal.nif ?? ""} 
                  onChange={(e) => setP("nif", e.target.value.replace(/\D/g, ""))} 
                />
              </Field>
              
              <Field label={t("phone")} required>
                <Input 
                  type="tel"
                  maxLength={9} 
                  placeholder="912345678"
                  value={personal.phone ?? ""} 
                  onChange={(e) => setP("phone", e.target.value.replace(/[^0-9+\s]/g, ""))} 
                />
              </Field>
              
              <Field label={t("address")} className="sm:col-span-2" required>
                <Input 
                  maxLength={150} 
                  placeholder="Rua, número de porta, andar"
                  value={personal.address ?? ""} 
                  onChange={(e) => setP("address", e.target.value)} 
                />
              </Field>
              
              <Field label={t("postal_code")} required>
                <Input 
                  placeholder="0000-000" 
                  maxLength={8} 
                  value={personal.postalCode ?? ""} 
                  onChange={(e) => setP("postalCode", formatPostal(e.target.value))} 
                />
              </Field>
              
              <Field label={t("freguesia")} required> 
                <Input 
                  maxLength={50} 
                  placeholder="Ex: Ribeira Brava"
                  value={personal.freguesia ?? ""} 
                  onChange={(e) => setP("freguesia", e.target.value)} 
                />
              </Field>
            </div>

            <h3 className="mt-8 font-display text-base font-bold text-emerald-900">Ensino Superior</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <Field label={`1ª preferência`} required>
                <Input 
                  maxLength={100} 
                  value={personal.institution ?? ""} 
                  onChange={(e) => setP("institution", e.target.value)} 
                />
              </Field>
              <Field label="2ª preferência">
                <Input 
                  maxLength={100} 
                  placeholder="Opcional"
                  value={personal.institutionAlt2 ?? ""} 
                  onChange={(e) => setP("institutionAlt2", e.target.value)} 
                />
              </Field>
              <Field label="3ª preferência">
                <Input 
                  maxLength={100} 
                  placeholder="Opcional"
                  value={personal.institutionAlt3 ?? ""} 
                  onChange={(e) => setP("institutionAlt3", e.target.value)} 
                />
              </Field>
              <Field label={t("course")} className="sm:col-span-2" required>
                <Input 
                  maxLength={100} 
                  value={personal.course ?? ""} 
                  onChange={(e) => setP("course", e.target.value)} 
                />
              </Field>
              <Field label={t("academic_year")} required>
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

        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-emerald-900">Agregado familiar</h2>
                <p className="text-xs text-muted-foreground">Adicione todos os membros que compõem o seu agregado.</p>
              </div>
              <Button onClick={addMember} variant="outline" className="gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                <Plus className="h-4 w-4" /> {t("add_member")}
              </Button>
            </div>
            <div className="gov-gold-rule mt-2 mb-4 w-12 bg-amber-500 h-0.5" />

            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("full_name")} <span className="text-red-500">*</span></TableHead>
                    <TableHead>{t("nif")} <span className="text-red-500">*</span></TableHead>
                    <TableHead>{t("phone")} <span className="text-red-500">*</span></TableHead>
                    <TableHead>{t("kinship")} <span className="text-red-500">*</span></TableHead>
                    <TableHead className="w-14" />
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
                        <Input 
                          maxLength={100} 
                          placeholder="Nome do familiar"
                          value={m.fullName} 
                          onChange={(e) => updateMember(m.id, { fullName: e.target.value })} 
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          inputMode="numeric" 
                          maxLength={9} 
                          placeholder="123456789"
                          value={m.nif} 
                          onChange={(e) => updateMember(m.id, { nif: e.target.value.replace(/\D/g, "") })} 
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="tel"
                          maxLength={9} 
                          placeholder="912345678"
                          value={m.phone} 
                          onChange={(e) => updateMember(m.id, { phone: e.target.value.replace(/[^0-9+\s]/g, "") })} 
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={m.kinship} onValueChange={(v) => updateMember(m.id, { kinship: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {KINSHIPS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => removeMember(m.id)} className="cursor-pointer">
                          <Trash2 className="h-4 w-4 text-red-500" />
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
          <Button variant="outline" onClick={() => navigate("/painel")} className="cursor-pointer">
            {t("back")}
          </Button>
          <Button size="lg" onClick={submit} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
            <Check className="h-4 w-4" /> {t("save_continue")}
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}

function Field({ label, children, className, required }) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-red-500 font-bold">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function WizardHeader({ current, progress }) {
  const steps = ["Dados", "Documentos", "Revisão"];
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-emerald-600 font-bold">
        Passo {current} de 3
      </div>
      <h1 className="mt-1 font-display text-2xl font-bold text-emerald-950 sm:text-3xl">
        Nova candidatura
      </h1>
      <div className="gov-gold-rule mt-2 mb-6 w-16 bg-amber-500 h-0.5" />
      <div className="grid grid-cols-3 gap-2">
        {steps.map((s, i) => {
          const idx = i + 1;
          const done = idx < current;
          const active = idx === current;
          return (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 font-display text-sm font-bold ${done ? "border-emerald-600 bg-emerald-600 text-white" : active ? "border-emerald-600 bg-background text-emerald-600" : "border-border bg-background text-muted-foreground"}`}
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
          className="h-full rounded-full bg-emerald-600 transition-all"
          style={{ width: `${progress ?? ((current - 1) / 3) * 100 + 15}%` }}
        />
      </div>
    </div>
  );
}