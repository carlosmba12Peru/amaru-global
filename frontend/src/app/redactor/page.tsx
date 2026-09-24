"use client";

import React, { useState, useEffect } from "react";
import {
    Scale,
    ShieldAlert,
    Landmark,
    Users,
    Building2,
    ScrollText,
    FileText,
    CheckCircle2,
    Copy,
    Download,
    Printer,
    Sparkles,
    Search,
    AlertTriangle,
    ShieldCheck,
    QrCode,
    FileEdit
} from "lucide-react";

interface FacultadInfo {
    codigo: string;
    nombre: string;
    descripcion: string;
    icono: string;
    tipos_documentos: { codigo: string; nombre: string }[];
}

interface SeccionDoc {
    subtitulo: string;
    contenido: string;
}

interface DocumentoEmitido {
    documento_id: string;
    correlativo_oficial: string;
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    facultad_tematica: string;
    tipo_documento: string;
    titulo: string;
    sumilla: string;
    destinatario: string;
    base_legal: string[];
    visto?: string;
    considerandos: string[];
    articulado_o_cuerpo: SeccionDoc[];
    conclusiones_o_resuelve: string[];
    firmante_nombre: string;
    firmante_cargo: string;
    firmante_entidad: string;
    texto_completo_markdown: string;
    hash_sha256: string;
    fecha_emision_pe: string;
    hora_emision_pe: string;
    qr_verification_url: string;
    pdf_disponible: boolean;
    metricas_datos_duros: Record<string, any>;
}

export default function RedactorQilqayPage() {
    // Estado de selección
    const [facultades, setFacultades] = useState<FacultadInfo[]>([]);
    const [selectedFacultad, setSelectedFacultad] = useState<string>("JURIDICO_EDIL");
    const [selectedTipoDoc, setSelectedTipoDoc] = useState<string>("RESOLUCION_ALCALDIA");
    const [ubigeo, setUbigeo] = useState<string>("200105"); // Catacaos por defecto
    const [searchMuni, setSearchMuni] = useState<string>("");
    const [destinatario, setDestinatario] = useState<string>("");
    const [instrucciones, setInstrucciones] = useState<string>("");

    // Estado de emisión y carga
    const [loading, setLoading] = useState<boolean>(false);
    const [docEmitido, setDocEmitido] = useState<DocumentoEmitido | null>(null);
    const [copied, setCopied] = useState<boolean>(false);

    // Distritos piloto sugeridos
    const distritosPiloto = [
        { ubigeo: "200105", nombre: "Catacaos", region: "Piura", ds124: true },
        { ubigeo: "150118", nombre: "Lurigancho-Chosica", region: "Lima", ds124: true },
        { ubigeo: "130202", nombre: "Chicama", region: "La Libertad", ds124: true },
        { ubigeo: "200801", nombre: "Sechura", region: "Piura", ds124: true },
        { ubigeo: "061003", nombre: "Eduardo Villanueva", region: "Cajamarca", ds124: true },
        { ubigeo: "110101", nombre: "Ica", region: "Ica", ds124: true }
    ];

    // Cargar catálogo de facultades al montar
    useEffect(() => {
        fetch("/api/v1/agents/qilqay/facultades")
            .then((r) => r.json())
            .then((d) => {
                if (d.facultades) {
                    setFacultades(d.facultades);
                }
            })
            .catch((e) => console.error("Error cargando facultades QILQAY:", e));
    }, []);

    // Actualizar tipo de documento por defecto cuando cambia la facultad
    useEffect(() => {
        const fac = facultades.find((f) => f.codigo === selectedFacultad);
        if (fac && fac.tipos_documentos.length > 0) {
            setSelectedTipoDoc(fac.tipos_documentos[0].codigo);
        }
    }, [selectedFacultad, facultades]);

    // Redactar documento oficial
    const handleRedactar = async () => {
        setLoading(true);
        try {
            const resp = await fetch("/api/v1/agents/qilqay/redactar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ubigeo: ubigeo.trim(),
                    facultad_tematica: selectedFacultad,
                    tipo_documento: selectedTipoDoc,
                    destinatario: destinatario.trim() || undefined,
                    instrucciones_adicionales: instrucciones.trim() || undefined
                })
            });
            if (resp.ok) {
                const data: DocumentoEmitido = await resp.json();
                setDocEmitido(data);
            } else {
                alert("Error al redactar el documento oficial.");
            }
        } catch (e) {
            console.error("Error ejecutando QILQAY:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!docEmitido) return;
        navigator.clipboard.writeText(docEmitido.texto_completo_markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleDownloadPdf = () => {
        if (!docEmitido) return;
        window.open(`/api/v1/agents/qilqay/documento/${docEmitido.documento_id}/pdf`, "_blank");
    };

    const facultadActual = facultades.find((f) => f.codigo === selectedFacultad);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
            {/* Cabecera Principal */}
            <header className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                AGENTE 8 • ESCRIBANO MAYOR DE LA REPÚBLICA
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                FE PÚBLICA ESTATAL FEN 2026–2027
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                            <span className="text-emerald-400">AGENTE QILQAY</span>
                            <span className="text-slate-500 font-light">|</span>
                            <span className="text-slate-300 text-2xl font-semibold">Redacción Estatal Multi-Temática</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
                            Escribano soberano de actos administrativos, resoluciones de alcaldía, expedientes de contratación directa (Ley 30225), padrones de damnificados (Bono BAE), expedientes IOARR FONDES y peritajes forenses con sellado SHA-256 para los 1,891 municipios del Perú.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                        <div>
                            <div className="text-xs text-slate-400 font-medium">Principio Operativo:</div>
                            <div className="text-xs font-bold text-slate-200">Enjaulamiento Determinístico de Datos (Zero-Hallucination)</div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Panel Lateral: Parámetros y Selector de Facultad (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* 1. Selector de Municipio / UBIGEO */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-2">
                            <Search className="w-4 h-4 text-emerald-400" />
                            1. Municipio o Distrito (UBIGEO 6 dígitos)
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={ubigeo}
                                onChange={(e) => setUbigeo(e.target.value)}
                                placeholder="Ej. 200105 o 150118"
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                            />
                        </div>

                        {/* Badges rápidos de distritos */}
                        <div className="flex flex-wrap gap-1.5">
                            {distritosPiloto.map((d) => (
                                <button
                                    key={d.ubigeo}
                                    onClick={() => setUbigeo(d.ubigeo)}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition border ${
                                        ubigeo === d.ubigeo
                                            ? "bg-emerald-600 text-white border-emerald-500"
                                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                                    }`}
                                >
                                    {d.nombre} ({d.region})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Selector de las 6 Facultades Temáticas */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
                            2. Facultad Temática de Redacción
                        </label>

                        <div className="space-y-2">
                            {[
                                { id: "JURIDICO_EDIL", icon: Scale, label: "1. Jurídico-Edil", desc: "Resoluciones de Alcaldía, Ordenanzas" },
                                { id: "TACTICO_SINAGERD", icon: ShieldAlert, label: "2. Táctico SINAGERD", desc: "Planes FEN, Oficios de Maquinaria, Boletines" },
                                { id: "FISCAL_CONTRATACIONES", icon: Landmark, label: "3. Fiscal y Contrataciones", desc: "Dossiers Ley 30225, OCI/CGR, PP 0068" },
                                { id: "SOCIAL_HUMANITARIO", icon: Users, label: "4. Social-Humanitario", desc: "Padrones Bono BAE, Seguro SAC, Ollas" },
                                { id: "TECNICO_INGENIERIL", icon: Building2, label: "5. Técnico-Ingenieril", desc: "Expedientes IOARR FONDES, Cómputos BOQ" },
                                { id: "FE_PUBLICA_PERITAJE", icon: ScrollText, label: "6. Fe Pública y Peritaje", desc: "Folios ReNITLI (Art. 220 CPP), Actas ISO" },
                            ].map((f) => {
                                const Icon = f.icon;
                                const isSel = selectedFacultad === f.id;
                                return (
                                    <button
                                        key={f.id}
                                        onClick={() => setSelectedFacultad(f.id)}
                                        className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                                            isSel
                                                ? "bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-500/10 text-white"
                                                : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isSel ? "text-emerald-400" : "text-slate-500"}`} />
                                        <div>
                                            <div className="text-xs font-bold text-slate-200">{f.label}</div>
                                            <div className="text-[11px] text-slate-400">{f.desc}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Selección del Tipo Específico de Documento */}
                    {facultadActual && (
                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                                3. Instrumento Documental Específico
                            </label>
                            <select
                                value={selectedTipoDoc}
                                onChange={(e) => setSelectedTipoDoc(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                            >
                                {facultadActual.tipos_documentos.map((t) => (
                                    <option key={t.codigo} value={t.codigo}>
                                        {t.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* 4. Instrucciones o Personalización del Alcalde */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                        <div>
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                                Destinatario Oficial (Opcional):
                            </label>
                            <input
                                type="text"
                                value={destinatario}
                                onChange={(e) => setDestinatario(e.target.value)}
                                placeholder="Ej. Gobernador Regional / Jefe de INDECI / OCI"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                                Instrucción o Requerimiento Específico:
                            </label>
                            <textarea
                                rows={2}
                                value={instrucciones}
                                onChange={(e) => setInstrucciones(e.target.value)}
                                placeholder="Ej. Solicitar 3 motobombas de 8 pulgadas para el Dren Sullana y declarar sesión permanente..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        {/* Botón de Ejecución */}
                        <button
                            onClick={handleRedactar}
                            disabled={loading || !ubigeo}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 hover:from-emerald-500 hover:to-sky-600 font-bold text-sm text-white shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                            <Sparkles className="w-4 h-4 text-emerald-200" />
                            <span>{loading ? "Redactando con Fe Pública..." : "Redactar Documento Oficial QILQAY"}</span>
                        </button>
                    </div>
                </div>

                {/* Panel Central/Derecha: Visualización del Documento Oficial (8 Cols) */}
                <div className="lg:col-span-8">
                    {docEmitido ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                            {/* Barra de Acciones y Folio */}
                            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3">
                                <div>
                                    <div className="text-[11px] font-mono font-bold text-emerald-400">
                                        ID: {docEmitido.documento_id}
                                    </div>
                                    <div className="text-sm font-black text-white">
                                        {docEmitido.correlativo_oficial}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                                        title="Copiar texto formal completo"
                                    >
                                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copied ? "¡Copiado!" : "Copiar Texto"}</span>
                                    </button>

                                    <button
                                        onClick={handleDownloadPdf}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition"
                                        title="Descargar PDF A4 oficial con QR y firma"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Descargar PDF Oficial</span>
                                    </button>

                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                                        title="Imprimir documento"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Imprimir</span>
                                    </button>
                                </div>
                            </div>

                            {/* Hoja de Documento Oficial A4 (Estilo Estatal Peruano) */}
                            <div className="p-6 md:p-10 bg-slate-900/50 space-y-6 text-slate-200">
                                {/* Encabezado Institucional */}
                                <div className="text-center border-b border-slate-800 pb-5">
                                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shadow-inner">
                                        🏛️
                                    </div>
                                    <div className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                                        REPÚBLICA DEL PERÚ • GOBIERNO LOCAL
                                    </div>
                                    <div className="text-base md:text-lg font-black text-white mt-1">
                                        {docEmitido.firmante_entidad.toUpperCase()}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        Provincia de {docEmitido.provincia} • Departamento de {docEmitido.departamento}
                                    </div>
                                </div>

                                {/* Título y Sumilla */}
                                <div className="space-y-2">
                                    <div className="text-base md:text-lg font-black text-emerald-400 text-center leading-snug">
                                        {docEmitido.titulo}
                                    </div>
                                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
                                        <b>SUMILLA:</b> {docEmitido.sumilla}
                                    </div>
                                    <div className="text-xs font-semibold text-slate-300">
                                        <b>DESTINATARIO:</b> {docEmitido.destinatario}
                                    </div>
                                </div>

                                {/* I. Base Legal */}
                                <div className="space-y-1.5">
                                    <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Scale className="w-3.5 h-3.5" />
                                        I. Base Legal y Jurisprudencia Aplicable
                                    </h3>
                                    <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc marker:text-emerald-500">
                                        {docEmitido.base_legal.map((bl, i) => (
                                            <li key={i}>{bl}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* II. Visto */}
                                {docEmitido.visto && (
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                                            II. Visto
                                        </h3>
                                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                                            {docEmitido.visto}
                                        </p>
                                    </div>
                                )}

                                {/* III. Considerando */}
                                {docEmitido.considerandos.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                                            III. Considerando
                                        </h3>
                                        <div className="text-xs text-slate-300 space-y-2">
                                            {docEmitido.considerandos.map((c, i) => (
                                                <p key={i} className="leading-relaxed text-justify">
                                                    {c}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* IV. Parte Dispositiva / Resolutiva */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5" />
                                        IV. Parte Dispositiva / Articulado
                                    </h3>
                                    <div className="space-y-3">
                                        {docEmitido.articulado_o_cuerpo.map((art, i) => (
                                            <div key={i} className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                                                <div className="text-xs font-black text-white mb-1">
                                                    {art.subtitulo}
                                                </div>
                                                <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                                                    {art.contenido}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* V. Disposiciones Finales */}
                                {docEmitido.conclusiones_o_resuelve.length > 0 && (
                                    <div className="space-y-1.5 border-t border-slate-800 pt-4">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            V. Disposiciones Finales
                                        </h3>
                                        <ul className="text-xs text-slate-300 space-y-1">
                                            {docEmitido.conclusiones_o_resuelve.map((con, i) => (
                                                <li key={i} className="font-semibold">• {con}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Bloque de Firma y Sellado Criptográfico */}
                                <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center shadow-lg">
                                            <QrCode className="w-16 h-16 text-slate-950" />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-mono text-emerald-400 font-bold">
                                                SELLO CRIPTOGRÁFICO SHA-256:
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-400 break-all max-w-sm">
                                                {docEmitido.hash_sha256}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1">
                                                Fecha y Hora: {docEmitido.fecha_emision_pe} - {docEmitido.hora_emision_pe} (Hora de Lima)
                                            </div>
                                            <div className="text-[10px] text-amber-400 font-medium">
                                                Verificación en campo vía escaneo de código QR
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
                                        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                                            Firmado Digitalmente en Sede:
                                        </div>
                                        <div className="text-sm font-black text-white">
                                            {docEmitido.firmante_nombre}
                                        </div>
                                        <div className="text-xs text-emerald-400 font-semibold">
                                            {docEmitido.firmante_cargo}
                                        </div>
                                        <div className="text-[11px] text-slate-400 italic">
                                            {docEmitido.firmante_entidad}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Estado Inicial de Espera */
                        <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
                                <FileEdit className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">
                                Sala de Redacción Estatal Soberana
                            </h2>
                            <p className="text-slate-400 text-sm max-w-md mb-6">
                                Seleccione un municipio, la facultad temática requerida y haga clic en <b>Redactar Documento Oficial QILQAY</b> para emitir el acto formal listo para trámite, firma e impresión oficial.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-left max-w-lg">
                                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
                                    <b className="text-emerald-400 block mb-0.5">🏛️ Jurídico-Edil</b>
                                    <span className="text-slate-400">Resoluciones de Alcaldía, Ordenanzas</span>
                                </div>
                                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
                                    <b className="text-sky-400 block mb-0.5">🛡️ Táctico SINAGERD</b>
                                    <span className="text-slate-400">Planes FEN, Oficios al COER</span>
                                </div>
                                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
                                    <b className="text-amber-400 block mb-0.5">⚖️ Fiscal y OCI</b>
                                    <span className="text-slate-400">Contratación Directa Art. 27</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
