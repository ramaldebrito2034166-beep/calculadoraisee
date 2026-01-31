/* Simulador ISEE e ISPE - Academitaly
   Regras: tudo roda localmente no navegador, sem coleta/armazenamento/envio de dados. */

const $ = (sel) => document.querySelector(sel);

const form = $("#sim-form");
const formError = $("#form-error");
const copyStatus = $("#copy-status");

const outSection = $("#resultado");
const outScala = $("#out-scala");
const outImovel = $("#out-imovel");
const outIse = $("#out-ise");
const outIsee = $("#out-isee");
const outIspe = $("#out-ispe");
const outDetails = $("#out-details");

const btnCopiar = $("#btn-copiar");
const btnLimpar = $("#btn-limpar");

const nfEUR = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const nfNumber2 = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function setFieldError(id, message) {
  const el = $(`#${id}-error`);
  if (!el) return;
  el.textContent = message || "";
}

function clearErrors() {
  formError.style.display = "none";
  formError.textContent = "";
  setFieldError("membros", "");
  setFieldError("renda", "");
  setFieldError("patrimonio", "");
  setFieldError("metragem", "");
  copyStatus.textContent = "";
}

function showFormError(message) {
  formError.textContent = message;
  formError.style.display = "block";
}

function parseNumberValue(raw) {
  // Inputs type="number" já entregam ponto decimal; ainda assim normalizamos.
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return { ok: false, value: null };
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return { ok: false, value: null };
  return { ok: true, value: num };
}

function scalaEquivalenza(n) {
  if (n <= 1) return 1.0;
  if (n === 2) return 1.57;
  if (n === 3) return 2.04;
  if (n === 4) return 2.46;
  if (n === 5) return 2.85;
  return 2.85 + 0.35 * (n - 5);
}

function formatEUR(value) {
  return nfEUR.format(value);
}

function renderResult({
  membros,
  scala,
  metragem,
  valorImovel,
  renda,
  patrimonio,
  ise,
  isee,
  ispe,
}) {
  outScala.textContent = nfNumber2.format(scala);
  outImovel.textContent = `${nfNumber2.format(metragem)} m² x 500 = ${formatEUR(valorImovel)}`;
  outIse.textContent = formatEUR(ise);
  outIsee.textContent = formatEUR(isee);
  outIspe.textContent = formatEUR(ispe);

  const detalhes = [
    `Valor patrimonial do imóvel (exterior): <code>${nfNumber2.format(metragem)}</code> x <code>500</code> = <code>${formatEUR(valorImovel)}</code>`,
    `ISE (base): <code>${formatEUR(renda)}</code> + <code>20%</code> do (<code>${formatEUR(patrimonio)}</code> + <code>${formatEUR(valorImovel)}</code>) = <code>${formatEUR(
      ise
    )}</code>`,
    `ISEE: <code>${formatEUR(ise)}</code> / <code>${nfNumber2.format(scala)}</code> = <code>${formatEUR(
      isee
    )}</code>`,
    `ISPE: <code>${formatEUR(valorImovel)}</code> / <code>${nfNumber2.format(scala)}</code> = <code>${formatEUR(
      ispe
    )}</code>`,
  ];

  outDetails.innerHTML = detalhes.map((x) => `<div>${x}</div>`).join("");
  outSection.hidden = false;

  btnCopiar.disabled = false;
  btnCopiar.dataset.copyText = `Membros: ${membros} | Escala: ${nfNumber2.format(scala)} | ISE: ${formatEUR(
    ise
  )} | ISEE: ${formatEUR(isee)} | ISPE: ${formatEUR(ispe)}`;
}

async function copyText(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // cai no fallback abaixo
  }

  // Fallback para ambientes que bloqueiam Clipboard API.
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "true");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearErrors();

  const rawMembros = $("#membros").value;
  const rawRenda = $("#renda").value;
  const rawPatrimonio = $("#patrimonio").value;
  const rawMetragem = $("#metragem").value;

  let hasError = false;

  const membrosParsed = parseNumberValue(rawMembros);
  if (!membrosParsed.ok) {
    setFieldError("membros", "Informe o número de membros (1 a 10).");
    hasError = true;
  }

  const membros = membrosParsed.ok ? Math.trunc(membrosParsed.value) : null;
  if (membrosParsed.ok) {
    if (!Number.isFinite(membros) || membros < 1 || membros > 10) {
      setFieldError("membros", "Informe um inteiro entre 1 e 10.");
      hasError = true;
    } else if (membrosParsed.value !== membros) {
      setFieldError("membros", "Use um número inteiro (sem casas decimais).");
      hasError = true;
    }
  }

  const rendaParsed = parseNumberValue(rawRenda);
  if (!rendaParsed.ok) {
    setFieldError("renda", "Informe a renda anual total (pode ser 0).");
    hasError = true;
  }

  const patrimonioParsed = parseNumberValue(rawPatrimonio);
  if (!patrimonioParsed.ok) {
    setFieldError("patrimonio", "Informe o patrimônio móvel total (pode ser 0).");
    hasError = true;
  }

  const metragemParsed = parseNumberValue(rawMetragem);
  if (!metragemParsed.ok) {
    setFieldError("metragem", "Informe a metragem total (pode ser 0).");
    hasError = true;
  }

  const renda = rendaParsed.ok ? rendaParsed.value : null;
  const patrimonio = patrimonioParsed.ok ? patrimonioParsed.value : null;
  const metragem = metragemParsed.ok ? metragemParsed.value : null;

  const negativeFields = [
    { id: "renda", value: renda },
    { id: "patrimonio", value: patrimonio },
    { id: "metragem", value: metragem },
  ];
  for (const f of negativeFields) {
    if (typeof f.value === "number" && f.value < 0) {
      setFieldError(f.id, "Não aceitamos valores negativos.");
      hasError = true;
    }
  }

  if (hasError) {
    showFormError("Revise os campos destacados para calcular.");
    outSection.hidden = true;
    btnCopiar.disabled = true;
    btnCopiar.dataset.copyText = "";
    return;
  }

  const scala = scalaEquivalenza(membros);
  const valorImovel = metragem * 500;
  const ise = renda + 0.2 * (patrimonio + valorImovel);
  const isee = ise / scala;
  const ispe = valorImovel / scala;

  renderResult({
    membros,
    scala,
    metragem,
    valorImovel,
    renda,
    patrimonio,
    ise,
    isee,
    ispe,
  });
});

btnCopiar.addEventListener("click", async () => {
  copyStatus.textContent = "";
  const text = btnCopiar.dataset.copyText || "";
  const ok = await copyText(text);
  copyStatus.textContent = ok
    ? "Resultado copiado para a área de transferência."
    : "Não foi possível copiar automaticamente. Selecione e copie manualmente.";
});

btnLimpar.addEventListener("click", () => {
  form.reset();
  clearErrors();
  outSection.hidden = true;
  btnCopiar.disabled = true;
  btnCopiar.dataset.copyText = "";
});

