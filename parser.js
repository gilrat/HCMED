/**
 * Extrator de Exames Laboratoriais - HCMED Parser
 * 
 * Este script parseia o texto bruto copiado do sistema HCMED e
 * gera um resumo organizado dos resultados laboratoriais.
 */

// ===== MAPEAMENTO DE EXAMES =====
const EXAM_MAPPINGS = {
    // Gerais - Hemograma
    'HEMOGLOBINA': { abbrev: 'Hb', category: 'gerais', unit: 'g/dL' },
    'HEMATÓCRITO': { abbrev: 'Ht', category: 'gerais', unit: '%' },
    'HEMATOCRITO': { abbrev: 'Ht', category: 'gerais', unit: '%' },
    'VCM': { abbrev: 'VCM', category: 'gerais', unit: 'fL' },
    'LEUCÓCITOS': { abbrev: 'Leuco', category: 'gerais', unit: 'mil/mm³' },
    'NEUTRÓFILOS': { abbrev: 'N', category: 'leucograma', unit: '%' },
    'LINFÓCITOS': { abbrev: 'Ly', category: 'leucograma', unit: '%' },
    'MONÓCITOS': { abbrev: 'Mo', category: 'leucograma', unit: '%' },
    'EOSINÓFILOS': { abbrev: 'Eo', category: 'leucograma', unit: '%' },
    'PLAQUETAS': { abbrev: 'Plaq', category: 'gerais', unit: 'mil/mm³' },

    // Gerais - Bioquímica
    'CREATININA': { abbrev: 'Cr', category: 'gerais', unit: 'mg/dL' },
    'URÉIA': { abbrev: 'Ur', category: 'gerais', unit: 'mg/dL' },
    'UREIA': { abbrev: 'Ur', category: 'gerais', unit: 'mg/dL' },
    'SÓDIO': { abbrev: 'Na', category: 'gerais', unit: 'mEq/L' },
    'SODIO': { abbrev: 'Na', category: 'gerais', unit: 'mEq/L' },
    'POTÁSSIO': { abbrev: 'K', category: 'gerais', unit: 'mEq/L' },
    'POTASSIO': { abbrev: 'K', category: 'gerais', unit: 'mEq/L' },
    'CLORO': { abbrev: 'Cl', category: 'gerais', unit: 'mEq/L' },
    'CÁLCIO TOTAL': { abbrev: 'Ca', category: 'gerais', unit: 'mg/dL' },
    'CÁLCIO IÔNICO': { abbrev: 'CaI', category: 'gerais', unit: 'mg/dL' },
    'FÓSFORO': { abbrev: 'P', category: 'gerais', unit: 'mg/dL' },
    'FOSFORO': { abbrev: 'P', category: 'gerais', unit: 'mg/dL' },
    'MAGNÉSIO': { abbrev: 'Mg', category: 'gerais', unit: 'mg/dL' },
    'MAGNESIO': { abbrev: 'Mg', category: 'gerais', unit: 'mg/dL' },

    // Gerais - Hepático
    'TGO': { abbrev: 'TGO', category: 'gerais', unit: 'U/L' },
    'AST': { abbrev: 'TGO', category: 'gerais', unit: 'U/L' },
    'ASPARTATO AMINOTRANSFERASE': { abbrev: 'TGO', category: 'gerais', unit: 'U/L' },
    'TGP': { abbrev: 'TGP', category: 'gerais', unit: 'U/L' },
    'ALT': { abbrev: 'TGP', category: 'gerais', unit: 'U/L' },
    'ALANINA AMINOTRANSFERASE': { abbrev: 'TGP', category: 'gerais', unit: 'U/L' },
    'BILIRRUBINA TOTAL': { abbrev: 'BT', category: 'gerais', unit: 'mg/dL' },
    'BILIRRUBINA DIRETA': { abbrev: 'BD', category: 'gerais', unit: 'mg/dL' },
    'PROTEÍNAS TOTAIS': { abbrev: 'PT', category: 'gerais', unit: 'g/dL' },
    'PROTEINAS TOTAIS': { abbrev: 'PT', category: 'gerais', unit: 'g/dL' },
    'ALBUMINA': { abbrev: 'ALB', category: 'gerais', unit: 'g/dL' },
    'FOSFATASE ALCALINA': { abbrev: 'FA', category: 'gerais', unit: 'U/L' },
    'GAMA GT': { abbrev: 'GGT', category: 'gerais', unit: 'U/L' },
    'GAMA-GT': { abbrev: 'GGT', category: 'gerais', unit: 'U/L' },
    'GGT': { abbrev: 'GGT', category: 'gerais', unit: 'U/L' },
    'AMILASE': { abbrev: 'AMIL', category: 'gerais', unit: 'U/L' },
    'LIPASE': { abbrev: 'LIP', category: 'gerais', unit: 'U/L' },

    // Coagulação - DD e Fibrinogênio agora em trombofilias
    // INR is handled specially in parseGenericExam - not in generic mapping
    'D-DÍMERO': { abbrev: 'DD', category: 'trombofilias', unit: 'ng/mL' },
    'D-DIMERO': { abbrev: 'DD', category: 'trombofilias', unit: 'ng/mL' },
    'DIMERO-D': { abbrev: 'DD', category: 'trombofilias', unit: 'ng/mL' },
    'DOSAGEM DO DÍMERO-D QUANTITATIVO': { abbrev: 'DD', category: 'trombofilias', unit: 'ng/mL' },
    'FIBRINOGÊNIO': { abbrev: 'Fibrinogênio', category: 'trombofilias', unit: 'mg/dL' },
    'FIBRINOGENIO': { abbrev: 'Fibrinogênio', category: 'trombofilias', unit: 'mg/dL' },

    // Sorologias
    'ANTI-HBC': { abbrev: 'HepB.Anti-HBc', category: 'sorologias' },
    'ANTI-HBC TOTAL': { abbrev: 'HepB.Anti-HBc', category: 'sorologias' },
    'HEPATITE B - ANTI-HBC TOTAL': { abbrev: 'HepB.Anti-HBc', category: 'sorologias' },
    'ANTI-HBS': { abbrev: 'HepB.Anti-HBs', category: 'sorologias' },
    'HEPATITE B - ANTI-HBS': { abbrev: 'HepB.Anti-HBs', category: 'sorologias' },
    'AGHBS': { abbrev: 'HepB.Ag-HBs', category: 'sorologias' },
    'AG-HBS': { abbrev: 'HepB.Ag-HBs', category: 'sorologias' },
    'AGHBE': { abbrev: 'HepB.Ag-HBe', category: 'sorologias' },
    'HEPATITE B - AGHBS': { abbrev: 'HepB.Ag-HBs', category: 'sorologias' },
    'HEPATITE B - AGHBE': { abbrev: 'HepB.Ag-HBe', category: 'sorologias' },
    'ANTI-HCV': { abbrev: 'HepC', category: 'sorologias' },
    'HEPATITE C': { abbrev: 'HepC', category: 'sorologias' },
    'HEPATITE C - SOROLOGIA': { abbrev: 'HepC', category: 'sorologias' },
    'ANTI-HIV': { abbrev: 'Anti-HIV', category: 'sorologias' },
    'HIV': { abbrev: 'Anti-HIV', category: 'sorologias' },
    'VDRL': { abbrev: 'VDRL', category: 'sorologias' },
    'TREPONEMA PALLIDUM': { abbrev: 'VDRL', category: 'sorologias' },
    'SOROLOGIA PARA TREPONEMA PALLIDUM': { abbrev: 'VDRL', category: 'sorologias' },
    'CMV IGG': { abbrev: 'CMV.IgG', category: 'sorologias' },
    'CMV IGM': { abbrev: 'CMV.IgM', category: 'sorologias' },
    'CITOMEGALOVIRUS IGG': { abbrev: 'CMV.IgG', category: 'sorologias' },
    'CITOMEGALOVIRUS IGM': { abbrev: 'CMV.IgM', category: 'sorologias' },
    'VARICELA IGG': { abbrev: 'VZV.IgG', category: 'sorologias' },
    'VARICELA IGM': { abbrev: 'VZV.IgM', category: 'sorologias' },
    'VZV IGG': { abbrev: 'VZV.IgG', category: 'sorologias' },
    'VZV IGM': { abbrev: 'VZV.IgM', category: 'sorologias' },
    'HERPES SIMPLES IGG': { abbrev: 'HSV.IgG', category: 'sorologias' },
    'HERPES SIMPLES IGM': { abbrev: 'HSV.IgM', category: 'sorologias' },
    'HSV IGG': { abbrev: 'HSV.IgG', category: 'sorologias' },
    'HSV IGM': { abbrev: 'HSV.IgM', category: 'sorologias' },
    'HTLV IGG': { abbrev: 'HTLV.IgG', category: 'sorologias' },
    'HTLV IGM': { abbrev: 'HTLV.IgM', category: 'sorologias' },
    'TOXOPLASMOSE IGG': { abbrev: 'TOXO.IgG', category: 'sorologias' },
    'TOXOPLASMOSE IGM': { abbrev: 'TOXO.IgM', category: 'sorologias' },
    'TOXOPLASMA IGG': { abbrev: 'TOXO.IgG', category: 'sorologias' },
    'TOXOPLASMA IGM': { abbrev: 'TOXO.IgM', category: 'sorologias' },

    // Metabólico
    'GLICOSE': { abbrev: 'Glic', category: 'metabolico', unit: 'mg/dL' },
    'GLICEMIA': { abbrev: 'Glic', category: 'metabolico', unit: 'mg/dL' },
    'HEMOGLOBINA GLICADA': { abbrev: 'HbGlic', category: 'metabolico', unit: '%' },
    'HBA1C': { abbrev: 'HbGlic', category: 'metabolico', unit: '%' },
    'HDL': { abbrev: 'HDL', category: 'metabolico', unit: 'mg/dL' },
    'HDL-COLESTEROL': { abbrev: 'HDL', category: 'metabolico', unit: 'mg/dL' },
    'HDL - COLESTEROL': { abbrev: 'HDL', category: 'metabolico', unit: 'mg/dL' },
    'LDL': { abbrev: 'LDL', category: 'metabolico', unit: 'mg/dL' },
    'LDL-COLESTEROL': { abbrev: 'LDL', category: 'metabolico', unit: 'mg/dL' },
    'LDL - COLESTEROL': { abbrev: 'LDL', category: 'metabolico', unit: 'mg/dL' },
    'VLDL': { abbrev: 'VLDL', category: 'metabolico', unit: 'mg/dL' },
    'VLDL - COLESTEROL': { abbrev: 'VLDL', category: 'metabolico', unit: 'mg/dL' },
    'COLESTEROL TOTAL': { abbrev: 'ColT', category: 'metabolico', unit: 'mg/dL' },
    'TRIGLICÉRIDES': { abbrev: 'Trig', category: 'metabolico', unit: 'mg/dL' },
    'TRIGLICERIDES': { abbrev: 'Trig', category: 'metabolico', unit: 'mg/dL' },
    'NT-PROBNP': { abbrev: 'NT-proBNP', category: 'cardio', unit: 'pg/mL' },
    'BNP': { abbrev: 'NT-proBNP', category: 'cardio', unit: 'pg/mL' },
    'TSH': { abbrev: 'TSH', category: 'metabolico', unit: 'µUI/mL' },
    'HORMÔNIO TIREO-ESTIMULANTE': { abbrev: 'TSH', category: 'metabolico', unit: 'µUI/mL' },
    'T4 LIVRE': { abbrev: 'T4L', category: 'metabolico', unit: 'ng/dL' },
    'T4L': { abbrev: 'T4L', category: 'metabolico', unit: 'ng/dL' },
    'VITAMINA B12': { abbrev: 'B12', category: 'metabolico', unit: 'pg/mL' },
    'VITAMINA B 12': { abbrev: 'B12', category: 'metabolico', unit: 'pg/mL' },
    'B12': { abbrev: 'B12', category: 'metabolico', unit: 'pg/mL' },
    'ÁCIDO FÓLICO': { abbrev: 'AF', category: 'metabolico', unit: 'ng/mL' },
    'ACIDO FOLICO': { abbrev: 'AF', category: 'metabolico', unit: 'ng/mL' },
    'VITAMINA D': { abbrev: 'VitD', category: 'metabolico', unit: 'ng/mL' },
    '25-HIDROXIVITAMINA D': { abbrev: 'VitD', category: 'metabolico', unit: 'ng/mL' },
    'PTH': { abbrev: 'PTH', category: 'metabolico', unit: 'pg/mL' },
    'PARATORMÔNIO': { abbrev: 'PTH', category: 'metabolico', unit: 'pg/mL' },
    'CPK': { abbrev: 'CPK', category: 'metabolico', unit: 'U/L' },
    'CREATINOQUINASE': { abbrev: 'CPK', category: 'metabolico', unit: 'U/L' },
    'TROPONINA': { abbrev: 'Tropo-T', category: 'cardio', unit: 'ng/L' },
    'TROPONINA T': { abbrev: 'Tropo-T', category: 'cardio', unit: 'ng/L' },
    'TROPONINA I': { abbrev: 'Tropo-T', category: 'cardio', unit: 'ng/L' },
    'TROPONINA I ULTRASENSÍVEL': { abbrev: 'Tropo-T', category: 'cardio', unit: 'ng/L' },
    'FERRO': { abbrev: 'Fe', category: 'metabolico', unit: 'µg/dL' },
    'FERRO SÉRICO': { abbrev: 'Fe', category: 'metabolico', unit: 'µg/dL' },
    'FERRITINA': { abbrev: 'Ferritina', category: 'metabolico', unit: 'ng/mL' },
    'CAPACIDADE TOTAL DE LIGAÇÃO DO FERRO': { abbrev: 'CTLF', category: 'metabolico', unit: 'µg/dL' },
    'CAPACIDADE TOTAL DE LIGAÇÃO DE FERRO': { abbrev: 'CTLF', category: 'metabolico', unit: 'µg/dL' },
    'CTLF': { abbrev: 'CTLF', category: 'metabolico', unit: 'µg/dL' },
    'SATURAÇÃO DE TRANSFERRINA': { abbrev: 'STf', category: 'metabolico', unit: '%' },
    'SATURAÇÃO DA TRANSFERRINA': { abbrev: 'STf', category: 'metabolico', unit: '%' },
    'PCR': { abbrev: 'PCR', category: 'reumato', unit: 'mg/L' },
    'PROTEÍNA C REATIVA': { abbrev: 'PCR', category: 'reumato', unit: 'mg/L' },
    'PROTEÍNA C REATIVA (PCR)': { abbrev: 'PCR', category: 'reumato', unit: 'mg/L' },
    'VHS': { abbrev: 'VHS', category: 'reumato', unit: 'mm' },
    'VELOCIDADE DE HEMOSSEDIMENTAÇÃO': { abbrev: 'VHS', category: 'reumato', unit: 'mm' },
    'DHL': { abbrev: 'DHL', category: 'metabolico', unit: 'U/L' },
    'DESIDROGENASE LÁCTICA': { abbrev: 'DHL', category: 'metabolico', unit: 'U/L' },
    'LDH': { abbrev: 'DHL', category: 'metabolico', unit: 'U/L' },

    // Reumatológico / Autoimune
    'FATOR REUMATÓIDE': { abbrev: 'FR', category: 'reumato' },
    'FATOR REUMATOIDE': { abbrev: 'FR', category: 'reumato' },
    'FR': { abbrev: 'FR', category: 'reumato' },
    'FAN': { abbrev: 'FAN', category: 'reumato' },
    'FATOR ANTINUCLEAR': { abbrev: 'FAN', category: 'reumato' },
    'ANTI-RO': { abbrev: 'Anti-Ro', category: 'reumato' },
    'ANTI-SSA': { abbrev: 'Anti-Ro', category: 'reumato' },
    'ANTI-LA': { abbrev: 'Anti-La', category: 'reumato' },
    'ANTI-SSB': { abbrev: 'Anti-La', category: 'reumato' },
    'ANTI-MPO': { abbrev: 'Anti-MPO', category: 'reumato' },
    'P-ANCA': { abbrev: 'Anti-MPO', category: 'reumato' },
    'ANTI-PR3': { abbrev: 'Anti-PR3', category: 'reumato' },
    'C-ANCA': { abbrev: 'Anti-PR3', category: 'reumato' },
    'ANTI-DSDNA': { abbrev: 'anti-dsDNA', category: 'reumato' },
    'ANTI-DNA': { abbrev: 'anti-dsDNA', category: 'reumato' },
    'ANTI-SM': { abbrev: 'anti-Sm', category: 'reumato' },
    'C3': { abbrev: 'C3', category: 'reumato' },
    'COMPLEMENTO C3': { abbrev: 'C3', category: 'reumato' },
    'FRAÇÃO C3 DO COMPLEMENTO': { abbrev: 'C3', category: 'reumato' },
    'C4': { abbrev: 'C4', category: 'reumato' },
    'COMPLEMENTO C4': { abbrev: 'C4', category: 'reumato' },
    'FRAÇÃO C4 DO COMPLEMENTO': { abbrev: 'C4', category: 'reumato' },
    'IMUNOFIXAÇÃO': { abbrev: 'IFS', category: 'reumato' },
    'ELETROFORESE DE PROTEÍNAS': { abbrev: 'EFPS', category: 'reumato' },
    'IGK': { abbrev: 'Igk', category: 'reumato' },
    'IMUNOGLOBULINA KAPPA': { abbrev: 'Igk', category: 'reumato' },
    'IGL': { abbrev: 'Igl', category: 'reumato' },
    'IMUNOGLOBULINA LAMBDA': { abbrev: 'Igl', category: 'reumato' },
    'RELAÇÃO KAPPA/LAMBDA': { abbrev: 'RKL', category: 'reumato' },

    // Trombofilias
    'ANTICOAGULANTE LÚPICO': { abbrev: 'Anticoagulante lúpico', category: 'trombofilias' },
    'ANTICOAGULANTE LUPICO': { abbrev: 'Anticoagulante lúpico', category: 'trombofilias' },
    'ANTICARDIOLIPINA IGG': { abbrev: 'Anticardiolipina IgG', category: 'trombofilias' },
    'ANTICARDIOLIPINA IGM': { abbrev: 'Anticardiolipina IgM', category: 'trombofilias' },
    'ANTI-BETA-2-GLICOPROTEÍNA': { abbrev: 'Anti-beta-2-glicoproteína', category: 'trombofilias' },
    'PROTEÍNA C FUNCIONAL': { abbrev: 'Proteína C', category: 'trombofilias' },
    'PROTEINA C FUNCIONAL': { abbrev: 'Proteína C', category: 'trombofilias' },
    'PROTEÍNA S LIVRE': { abbrev: 'Proteína S', category: 'trombofilias' },
    'PROTEINA S LIVRE': { abbrev: 'Proteína S', category: 'trombofilias' },
    'ANTITROMBINA III': { abbrev: 'Antitrombina III', category: 'trombofilias' },
    'ANTITROMBINA': { abbrev: 'Antitrombina III', category: 'trombofilias' },
    'FATOR V DE LEIDEN': { abbrev: 'Mutação fator V de Leiden', category: 'trombofilias' },
    'MUTAÇÃO DO FATOR V': { abbrev: 'Mutação fator V de Leiden', category: 'trombofilias' },
    'MUTAÇÃO DA PROTROMBINA': { abbrev: 'Mutação de protrombina', category: 'trombofilias' },
    'PROTROMBINA 20210': { abbrev: 'Mutação de protrombina', category: 'trombofilias' },
    'HOMOCISTEÍNA': { abbrev: 'Dosagem de homocisteína', category: 'trombofilias' },
    'HOMOCISTEINA': { abbrev: 'Dosagem de homocisteína', category: 'trombofilias' },
    'ELETROFORESE DE HEMOGLOBINA': { abbrev: 'EFH', category: 'trombofilias' },

    // Níveis séricos de anticonvulsivantes
    'ÁCIDO VALPRÓICO': { abbrev: 'VPA', category: 'niveis', unit: 'µg/mL' },
    'ACIDO VALPROICO': { abbrev: 'VPA', category: 'niveis', unit: 'µg/mL' },
    'VALPROATO': { abbrev: 'VPA', category: 'niveis', unit: 'µg/mL' },
    'FENITOÍNA': { abbrev: 'PHT', category: 'niveis', unit: 'µg/mL' },
    'FENITOINA': { abbrev: 'PHT', category: 'niveis', unit: 'µg/mL' },
    'LEVETIRACETAM': { abbrev: 'LEV', category: 'niveis', unit: 'µg/mL' },
    'CARBAMAZEPINA': { abbrev: 'CBZ', category: 'niveis', unit: 'µg/mL' },
    'FENOBARBITAL': { abbrev: 'PB', category: 'niveis', unit: 'µg/mL' },
    'LAMOTRIGINA': { abbrev: 'LTG', category: 'niveis', unit: 'µg/mL' },

    // LCR
    'PROTEÍNA TOTAL LCR': { abbrev: 'PT', category: 'lcr' },
    'PROTEÍNAS TOTAIS LCR': { abbrev: 'PT', category: 'lcr' },
    'GLICOSE LCR': { abbrev: 'Glic', category: 'lcr' },
    'GLICORRAQUIA': { abbrev: 'Glic', category: 'lcr' },
    'LACTATO LCR': { abbrev: 'Lac', category: 'lcr' },
    'ADA LCR': { abbrev: 'ADA', category: 'lcr' },
    'ADENOSINA DEAMINASE': { abbrev: 'ADA', category: 'lcr' },
    'VDRL LCR': { abbrev: 'VDRL', category: 'lcr' },
    'CRIPTOCOCO': { abbrev: 'Crypto', category: 'lcr' },
    'CRYPTOCOCCUS': { abbrev: 'Crypto', category: 'lcr' },
    'PESQUISA DE BAAR': { abbrev: 'pBAAR', category: 'lcr' },
    'RT-PCR TUBERCULOSE': { abbrev: 'RT-TB', category: 'lcr' },
    'GENEXPERT': { abbrev: 'RT-TB', category: 'lcr' },
    'PAINEL VIRAL': { abbrev: 'Painel Viral', category: 'lcr' },
    'BANDAS OLIGOCLONAIS': { abbrev: 'BOC', category: 'lcr' },
    'ELETROFORESE LCR': { abbrev: 'EFP', category: 'lcr' },
};

// ===== CLASSE PRINCIPAL DO PARSER =====
class ExamParser {
    constructor() {
        this.results = {};
        this.gasometriaVenosa = {};
        this.gasometriaArterial = {};
        this.leucograma = {};
        this.lcrData = {};
        this.examCount = 0;
        this.mostRecentDate = null;
    }

    /**
     * Parseia o texto bruto e extrai os exames
     */
    parse(rawText) {
        this.results = {};
        this.gasometriaVenosa = {};
        this.gasometriaArterial = {};
        this.leucograma = {};
        this.lcrData = {};
        this.examCount = 0;
        this.mostRecentDate = null;

        // Remove linhas de "Resultado dos 3 últimos exames" e seus valores
        const cleanedText = this.removeHistoricalResults(rawText);

        // Divide o texto em blocos de exames
        const examBlocks = this.splitIntoExamBlocks(cleanedText);

        // Processa cada bloco
        examBlocks.forEach(block => {
            this.processExamBlock(block);
        });

        return this.formatOutput();
    }

    /**
     * Remove resultados históricos do texto
     */
    removeHistoricalResults(text) {
        // Remove seções de "Resultado dos 3 últimos exames"
        let cleaned = text.replace(/Resultado dos \d+ últimos exames:[\s\S]*?(?=\d{2}\/\d{2}\/\d{4}|\n\n|$)/gi, '');

        // Remove linhas que são apenas datas com valores antigos
        cleaned = cleaned.replace(/^\d{2}\/\d{2}\/\d{4}\s*-\s*[\d,\.]+\s*\w*\/?\w*\s*$/gm, '');

        return cleaned;
    }

    /**
     * Divide o texto em blocos de exames baseado nos timestamps
     */
    splitIntoExamBlocks(text) {
        // Padrão para encontrar início de cada exame
        const blockPattern = /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}[\s\S]*?)(?=\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}|$)/g;
        const blocks = [];
        let match;

        while ((match = blockPattern.exec(text)) !== null) {
            blocks.push(match[1]);
        }

        return blocks;
    }

    /**
     * Processa um bloco individual de exame
     */
    processExamBlock(block) {
        // Verifica se o exame foi realizado
        if (block.includes('MATERIAL COAGULADO') || block.includes('EXAME NAO REALIZADO') || block.includes('EXAME NÃO REALIZADO')) {
            return;
        }

        // Extrai a data de coleta
        const dateMatch = block.match(/Coletado em:\s*(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})/);
        if (!dateMatch) return;

        const collectionDate = this.parseDate(dateMatch[1], dateMatch[2]);

        // Atualiza a data mais recente
        if (!this.mostRecentDate || collectionDate > this.mostRecentDate) {
            this.mostRecentDate = collectionDate;
        }

        // Identifica o tipo de exame
        if (block.includes('GASOMETRIA - SANGUE VENOSO') || block.includes('GASOMETRIA VENOSA')) {
            this.parseGasometria(block, 'venosa', collectionDate);
        } else if (block.includes('GASOMETRIA - SANGUE ARTERIAL') || block.includes('GASOMETRIA ARTERIAL')) {
            this.parseGasometria(block, 'arterial', collectionDate);
        } else if (block.includes('HEMOGRAMA COMPLETO')) {
            this.parseHemograma(block, collectionDate);
        } else if (block.includes('LCR') || block.includes('LÍQUOR') || block.includes('LIQUOR')) {
            this.parseLCR(block, collectionDate);
        } else {
            this.parseGenericExam(block, collectionDate);
        }
    }

    /**
     * Converte string de data para objeto Date
     */
    parseDate(dateStr, timeStr) {
        const [day, month, year] = dateStr.split('/');
        const [hour, minute] = timeStr.split(':');
        return new Date(year, month - 1, day, hour, minute);
    }

    /**
     * Parseia gasometria venosa ou arterial
     */
    parseGasometria(block, type, date) {
        const prefix = type === 'venosa' ? 'GV' : 'GA';
        const storage = type === 'venosa' ? this.gasometriaVenosa : this.gasometriaArterial;

        // Verifica se já temos dados mais recentes
        if (storage._date && storage._date > date) return;
        storage._date = date;

        // Padrões para extrair valores da gasometria
        const patterns = {
            pH: /\bpH\s+([\d,\.]+)/i,
            pO2: /\bpO2\s+([\d,\.]+)/i,
            pCO2: /\bpCO2\s+([\d,\.]+)/i,
            BIC: /\bctHCO3\s+([\d,\.]+)/i,
            LAC: /\bLACTATO\s+([\d,\.]+)/i,
            SO2: /\bSO2\s+([\d,\.]+)/i,
        };

        for (const [key, pattern] of Object.entries(patterns)) {
            const match = block.match(pattern);
            if (match) {
                storage[key] = this.normalizeNumber(match[1]);
                this.examCount++;
            }
        }

        // Extrai sódio, potássio e cloro da gasometria também
        const sodioMatch = block.match(/\bSODIO\s+([\d,\.]+)/i);
        const potassioMatch = block.match(/\bPOTASSIO\s+([\d,\.]+)/i);
        const cloroMatch = block.match(/\bCLORO\s+([\d,\.]+)/i);

        // Só usa esses valores se não tivermos valores mais recentes do soro
        if (sodioMatch && !this.results['Na']) {
            // Gasometria tem valores, mas preferimos do soro
        }
    }

    /**
     * Parseia hemograma completo
     */
    parseHemograma(block, date) {
        // Hemoglobina
        this.extractAndStore(block, /Hemoglobina\s+([\d,\.]+)\s*g\/dL/i, 'Hb', 'gerais', date);

        // Hematócrito
        this.extractAndStore(block, /Hematócrito\s+([\d,\.]+)\s*%/i, 'Ht', 'gerais', date);

        // VCM
        this.extractAndStore(block, /VCM\s+([\d,\.]+)\s*fL/i, 'VCM', 'gerais', date);

        // Leucócitos
        const leucoMatch = block.match(/Leucócitos\s+([\d,\.]+)\s*mil\/mm³/i);
        if (leucoMatch) {
            this.storeResult('Leuco', 'gerais', this.normalizeNumber(leucoMatch[1]), date);
        }

        // Neutrófilos, Linfócitos, Monócitos, Eosinófilos (pegar apenas a porcentagem)
        const neutroMatch = block.match(/Neutrófilos\s+([\d,\.]+)%/i);
        const linfoMatch = block.match(/Linfócitos\s+([\d,\.]+)%/i);
        const monoMatch = block.match(/Monócitos\s+([\d,\.]+)%/i);
        const eoMatch = block.match(/Eosinófilos\s+([\d,\.]+)%/i);

        if (neutroMatch) this.leucograma.N = this.normalizeNumber(neutroMatch[1]);
        if (linfoMatch) this.leucograma.Ly = this.normalizeNumber(linfoMatch[1]);
        if (monoMatch) this.leucograma.Mo = this.normalizeNumber(monoMatch[1]);
        if (eoMatch) this.leucograma.Eo = this.normalizeNumber(eoMatch[1]);

        // Plaquetas
        const plaqMatch = block.match(/PLAQUETAS\s+([\d,\.]+)\s*mil\/mm³/i);
        if (plaqMatch) {
            this.storeResult('Plaq', 'gerais', this.normalizeNumber(plaqMatch[1]), date);
        }
    }

    /**
     * Parseia exames de LCR
     */
    parseLCR(block, date) {
        // TODO: Implementar parsing específico para LCR
        // Por enquanto, usa o parser genérico
        this.parseGenericExam(block, date);
    }

    /**
     * Parseia exames genéricos
     */
    parseGenericExam(block, date) {
        // Extrai o nome do exame
        const examNameMatch = block.match(/([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\-]+)\s*-\s*SANGUE|([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\-]+)\s*-\s*,/i);
        const blockUpper = block.toUpperCase();

        // Tenta encontrar o exame no mapeamento
        for (const [examName, mapping] of Object.entries(EXAM_MAPPINGS)) {
            // Usa word boundary para evitar matches parciais (ex: LDL dentro de VLDL)
            const escapedName = examName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp('(^|[^A-Z])' + escapedName + '([^A-Z]|$)', 'i');

            if (regex.test(blockUpper)) {
                let value = null;

                // Tratamento especial para sorologias (resultados qualitativos)
                if (mapping.category === 'sorologias') {
                    value = this.extractSerologyResult(block);
                } else {
                    // Extrai o valor usando diferentes padrões
                    value = this.extractValue(block, examName);
                }

                if (value !== null) {
                    this.storeResult(mapping.abbrev, mapping.category, value, date);
                }
            }
        }

        // Tratamento especial para INR (está dentro do Tempo de Protrombina)
        if (block.includes('TEMPO DE PROTROMBINA')) {
            const inrMatch = block.match(/INR\s*=\s*([\d,\.]+)/i);
            if (inrMatch) {
                this.storeResult('INR', 'gerais', this.normalizeNumber(inrMatch[1]), date);
            }
        }

        // Tratamento especial para R (TTPA)
        if (block.includes('TEMPO DE TROMBOPLASTINA PARCIAL ATIVADA')) {
            const rMatch = block.match(/R\s*=\s*([\d,\.]+)/i);
            if (rMatch) {
                this.storeResult('R', 'gerais', this.normalizeNumber(rMatch[1]), date);
            }
        }

        // Tratamento especial para HIV
        if (block.toUpperCase().includes('HIV') || block.toUpperCase().includes('ANTICORPOS CONTRA HIV')) {
            const result = this.extractSerologyResult(block);
            if (result) {
                this.storeResult('Anti-HIV', 'sorologias', result, date);
            }
        }
    }

    /**
     * Extrai resultado qualitativo de sorologia
     */
    extractSerologyResult(block) {
        const blockUpper = block.toUpperCase();

        // Padrões para identificar resultados qualitativos
        // Ordem importa: verificar "NÃO REAGENTE" antes de "REAGENTE"

        // Verifica "Não Reagente" / "Nao Reagente"
        if (blockUpper.includes('NÃO REAGENTE') || blockUpper.includes('NAO REAGENTE') ||
            blockUpper.includes('AMOSTRA NÃO REAGENTE') || blockUpper.includes('AMOSTRA NAO REAGENTE')) {
            return 'NR';
        }

        // Verifica "Resultado: Não Reagente"
        const resultMatch = block.match(/Resultado:\s*(Não Reagente|Nao Reagente|Reagente|Indeterminado)/i);
        if (resultMatch) {
            const result = resultMatch[1].toUpperCase();
            if (result.includes('NÃO') || result.includes('NAO')) return 'NR';
            if (result === 'REAGENTE') return 'R';
            if (result === 'INDETERMINADO') return 'IND';
        }

        // Verifica apenas "Reagente" (depois de verificar "Não Reagente")
        if (blockUpper.includes('REAGENTE') && !blockUpper.includes('NÃO REAGENTE') && !blockUpper.includes('NAO REAGENTE')) {
            return 'R';
        }

        // Verifica "Indeterminado"
        if (blockUpper.includes('INDETERMINADO')) {
            return 'IND';
        }

        // Verifica "Negativo" / "Positivo"
        if (blockUpper.includes('NEGATIVO') || blockUpper.includes('NEGATIVE')) {
            return 'Neg';
        }
        if (blockUpper.includes('POSITIVO') || blockUpper.includes('POSITIVE')) {
            return 'Pos';
        }

        return null;
    }

    /**
     * Extrai valor de um exame específico
     */
    extractValue(block, examName) {
        const escapedName = examName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Padrões para extrair valores - ordem importa!
        const patterns = [
            // Padrão: NOME_EXAME \t\t VALOR (tabs separando)
            new RegExp(escapedName + '\\s+(<\\s*)?([\\d,\\.]+)', 'i'),
            // Padrão: NOME_EXAME : VALOR
            new RegExp(escapedName + '\\s*:\\s*(<\\s*)?([\\d,\\.]+)', 'i'),
            // Padrão genérico mais flexível com tabs
            new RegExp(escapedName + '[\\t\\s]+(<\\s*)?([\\d,\\.]+)', 'i'),
        ];

        for (const pattern of patterns) {
            const match = block.match(pattern);
            if (match) {
                // match[1] pode ser '<' ou undefined
                // match[2] é o número
                const prefix = match[1] ? '<' : '';
                const value = this.normalizeNumber(match[2] || match[1]);
                return prefix + value;
            }
        }

        return null;
    }

    /**
     * Extrai e armazena um valor usando um padrão específico
     */
    extractAndStore(block, pattern, abbrev, category, date) {
        const match = block.match(pattern);
        if (match) {
            this.storeResult(abbrev, category, this.normalizeNumber(match[1]), date);
        }
    }

    /**
     * Armazena um resultado, verificando se é mais recente
     */
    storeResult(abbrev, category, value, date) {
        const key = `${category}_${abbrev}`;

        if (!this.results[key] || this.results[key].date < date) {
            this.results[key] = { abbrev, category, value, date };
            this.examCount++;
        }
    }

    /**
     * Normaliza número (vírgula para ponto)
     */
    normalizeNumber(numStr) {
        return numStr.replace(',', '.');
    }

    /**
     * Formata a saída final
     */
    formatOutput() {
        const output = [];

        // LABORATORIAIS
        output.push('> LABORATORIAIS');

        // Gerais
        const geraisItems = this.getGeraisItems();
        if (geraisItems.length > 0) {
            output.push('- Gerais: ' + geraisItems.join(' | '));
        }

        // Metabólico
        const metabolicoItems = this.getCategoryItems('metabolico');
        if (metabolicoItems.length > 0) {
            output.push('- Metabólico: ' + metabolicoItems.join(' | '));
        }

        // Reumato/autoimune
        const reumatoItems = this.getCategoryItems('reumato');
        if (reumatoItems.length > 0) {
            output.push('- Reumato/autoimune: ' + reumatoItems.join(' | '));
        }

        // Trombofilias
        const trombofiliasItems = this.getCategoryItems('trombofilias');
        if (trombofiliasItems.length > 0) {
            output.push('- Trombofilias: ' + trombofiliasItems.join(' | '));
        }

        // Sorologias (agora após Trombofilias)
        const sorologiasItems = this.getCategoryItems('sorologias');
        if (sorologiasItems.length > 0) {
            output.push('- Sorologias: ' + sorologiasItems.join(' | '));
        }

        // Níveis séricos
        const niveisItems = this.getCategoryItems('niveis');
        if (niveisItems.length > 0) {
            output.push('- Níveis séricos: ' + niveisItems.join(' | '));
        }

        // Cardio
        const cardioItems = this.getCategoryItems('cardio');
        if (cardioItems.length > 0) {
            output.push('- Cardio: ' + cardioItems.join(' | '));
        }

        // Outros (itens não categorizados)
        const outrosItems = this.getCategoryItems('outros');
        if (outrosItems.length > 0) {
            output.push('- Outros: ' + outrosItems.join(' | '));
        }

        // LCR (agora no final)
        const lcrItems = this.getLCRItems();
        if (lcrItems.length > 0) {
            output.push('');
            output.push('> LCR');
            output.push('- LCR: ' + lcrItems.join(' | '));
        }

        return output.join('\n');
    }

    /**
     * Obtém itens da categoria LCR
     */
    getLCRItems() {
        const items = [];
        for (const [key, data] of Object.entries(this.results)) {
            if (data.category === 'lcr') {
                items.push(`${data.abbrev} ${data.value}`);
            }
        }
        return items;
    }

    /**
     * Obtém itens da categoria Gerais (formato especial)
     */
    getGeraisItems() {
        const items = [];

        // Hemoglobina
        const hb = this.findResult('gerais', 'Hb');
        if (hb) items.push(`Hb ${hb}`);

        // Hematócrito
        const ht = this.findResult('gerais', 'Ht');
        if (ht) items.push(`Ht ${ht}`);

        // VCM
        const vcm = this.findResult('gerais', 'VCM');
        if (vcm) items.push(`VCM ${vcm}`);

        // Leucócitos com diferencial
        const leuco = this.findResult('gerais', 'Leuco');
        if (leuco) {
            let leucoStr = `Leuco ${leuco}`;
            const diffParts = [];
            if (this.leucograma.N) diffParts.push(`N ${this.leucograma.N}`);
            if (this.leucograma.Ly) diffParts.push(`Ly ${this.leucograma.Ly}`);
            if (this.leucograma.Mo) diffParts.push(`Mo ${this.leucograma.Mo}`);
            if (this.leucograma.Eo) diffParts.push(`Eo ${this.leucograma.Eo}`);
            if (diffParts.length > 0) {
                leucoStr += ` (${diffParts.join(' / ')})`;
            }
            items.push(leucoStr);
        }

        // Plaquetas
        const plaq = this.findResult('gerais', 'Plaq');
        if (plaq) items.push(`Plaq ${plaq}`);

        // Creatinina
        const cr = this.findResult('gerais', 'Cr');
        if (cr) items.push(`Cr ${cr}`);

        // Uréia
        const ur = this.findResult('gerais', 'Ur');
        if (ur) items.push(`Ur ${ur}`);

        // Sódio
        const na = this.findResult('gerais', 'Na');
        if (na) items.push(`Na ${na}`);

        // Potássio
        const k = this.findResult('gerais', 'K');
        if (k) items.push(`K ${k}`);

        // Cloro
        const cl = this.findResult('gerais', 'Cl');
        if (cl) items.push(`Cl ${cl}`);

        // Cálcio
        const ca = this.findResult('gerais', 'Ca') || this.findResult('gerais', 'CaI');
        if (ca) items.push(`Ca ${ca}`);

        // Fósforo
        const p = this.findResult('gerais', 'P');
        if (p) items.push(`P ${p}`);

        // Magnésio
        const mg = this.findResult('gerais', 'Mg');
        if (mg) items.push(`Mg ${mg}`);

        // Gasometria Venosa
        if (Object.keys(this.gasometriaVenosa).length > 1) {
            if (this.gasometriaVenosa.pH) items.push(`GV.pH ${this.gasometriaVenosa.pH}`);
            if (this.gasometriaVenosa.pCO2) items.push(`GV.pCO2 ${this.gasometriaVenosa.pCO2}`);
            if (this.gasometriaVenosa.BIC) items.push(`GV.BIC ${this.gasometriaVenosa.BIC}`);
            if (this.gasometriaVenosa.LAC) items.push(`GV.LAC ${this.gasometriaVenosa.LAC}`);
        }

        // Gasometria Arterial
        if (Object.keys(this.gasometriaArterial).length > 1) {
            if (this.gasometriaArterial.pH) items.push(`GA.pH ${this.gasometriaArterial.pH}`);
            if (this.gasometriaArterial.pO2) items.push(`GA.pO2 ${this.gasometriaArterial.pO2}`);
            if (this.gasometriaArterial.pCO2) items.push(`GA.pCO2 ${this.gasometriaArterial.pCO2}`);
            if (this.gasometriaArterial.BIC) items.push(`GA.BIC ${this.gasometriaArterial.BIC}`);
            if (this.gasometriaArterial.LAC) items.push(`GA.LAC ${this.gasometriaArterial.LAC}`);
            if (this.gasometriaArterial.SO2) items.push(`GA.SO2 ${this.gasometriaArterial.SO2}`);
        }

        // Hepáticos
        const tgo = this.findResult('gerais', 'TGO');
        if (tgo) items.push(`TGO ${tgo}`);

        const tgp = this.findResult('gerais', 'TGP');
        if (tgp) items.push(`TGP ${tgp}`);

        const bt = this.findResult('gerais', 'BT');
        if (bt) items.push(`BT ${bt}`);

        const bd = this.findResult('gerais', 'BD');
        if (bd) items.push(`BD ${bd}`);

        const pt = this.findResult('gerais', 'PT');
        if (pt) items.push(`PT ${pt}`);

        const alb = this.findResult('gerais', 'ALB');
        if (alb) items.push(`ALB ${alb}`);

        // Coagulação
        const inr = this.findResult('gerais', 'INR');
        if (inr) items.push(`INR ${inr}`);

        const r = this.findResult('gerais', 'R');
        if (r) items.push(`R ${r}`);

        const fa = this.findResult('gerais', 'FA');
        if (fa) items.push(`FA ${fa}`);

        const ggt = this.findResult('gerais', 'GGT');
        if (ggt) items.push(`GGT ${ggt}`);

        const amil = this.findResult('gerais', 'AMIL');
        if (amil) items.push(`AMIL ${amil}`);

        const lip = this.findResult('gerais', 'LIP');
        if (lip) items.push(`LIP ${lip}`);

        return items;
    }

    /**
     * Obtém itens de uma categoria específica NA ORDEM DEFINIDA
     */
    getCategoryItems(category) {
        // Ordem específica para cada categoria
        const orderMap = {
            'sorologias': ['HepB.Anti-HBc', 'HepB.Anti-HBs', 'HepB.Ag-HBs', 'HepB.Ag-HBe', 'HepC', 'Anti-HIV', 'VDRL', 'CMV.IgG', 'CMV.IgM', 'VZV.IgG', 'VZV.IgM', 'HSV.IgG', 'HSV.IgM', 'HTLV.IgG', 'HTLV.IgM', 'TOXO.IgG', 'TOXO.IgM'],
            'metabolico': ['Glic', 'HbGlic', 'HDL', 'LDL', 'VLDL', 'ColT', 'Trig', 'TSH', 'T4L', 'B12', 'AF', 'VitD', 'PTH', 'CPK', 'Fe', 'Ferritina', 'CTLF', 'STf', 'DHL'],
            'reumato': ['PCR', 'VHS', 'FR', 'FAN', 'Anti-Ro', 'Anti-La', 'Anti-MPO', 'Anti-PR3', 'anti-dsDNA', 'anti-Sm', 'C3', 'C4', 'IFS', 'EFPS', 'Igk', 'Igl', 'RKL'],
            'trombofilias': ['Anticoagulante lúpico', 'Anticardiolipina IgG', 'Anticardiolipina IgM', 'Anti-beta-2-glicoproteína', 'Proteína C', 'Proteína S', 'Antitrombina III', 'Mutação fator V de Leiden', 'Mutação de protrombina', 'Dosagem de homocisteína', 'EFH', 'DD', 'Fibrinogênio'],
            'niveis': ['VPA', 'PHT', 'LEV', 'CBZ', 'PB', 'LTG'],
            'cardio': ['Tropo-T', 'NT-proBNP']
        };

        const order = orderMap[category] || [];
        const items = [];

        // Primeiro adiciona os itens na ordem definida
        for (const abbrev of order) {
            const result = this.findResult(category, abbrev);
            if (result !== null) {
                items.push(`${abbrev} ${result}`);
            }
        }

        // Depois adiciona quaisquer itens que não estejam na ordem (caso existam)
        for (const [key, data] of Object.entries(this.results)) {
            if (data.category === category && !order.includes(data.abbrev)) {
                items.push(`${data.abbrev} ${data.value}`);
            }
        }

        return items;
    }

    /**
     * Encontra resultado por categoria e abreviação
     */
    findResult(category, abbrev) {
        const key = `${category}_${abbrev}`;
        return this.results[key]?.value || null;
    }

    /**
     * Retorna estatísticas
     */
    getStats() {
        return {
            totalExams: Object.keys(this.results).length +
                Object.keys(this.gasometriaVenosa).length +
                Object.keys(this.gasometriaArterial).length,
            mostRecentDate: this.mostRecentDate
        };
    }

    /**
     * Retorna dados estruturados para a tabela
     * Agrupa por data (apenas dia, ignora horário)
     */
    getTableData() {
        const tableData = {}; // { 'dd/mm/yyyy': { 'ExamName': value } }
        const allExams = new Set();

        // Processa resultados normais
        for (const [key, data] of Object.entries(this.results)) {
            if (data.date) {
                const dateKey = this.formatDateKey(data.date);
                if (!tableData[dateKey]) tableData[dateKey] = {};

                // Se já existe um valor para este exame nesta data, mantém o mais recente
                if (!tableData[dateKey][data.abbrev] || data.date > tableData[dateKey][data.abbrev].date) {
                    tableData[dateKey][data.abbrev] = { value: data.value, date: data.date };
                }
                allExams.add(data.abbrev);
            }
        }

        // Processa gasometria venosa
        if (this.gasometriaVenosa.date) {
            const dateKey = this.formatDateKey(this.gasometriaVenosa.date);
            if (!tableData[dateKey]) tableData[dateKey] = {};

            for (const [param, value] of Object.entries(this.gasometriaVenosa)) {
                if (param !== 'date' && param !== 'type' && value) {
                    const examName = `GV.${param}`;
                    tableData[dateKey][examName] = { value, date: this.gasometriaVenosa.date };
                    allExams.add(examName);
                }
            }
        }

        // Processa gasometria arterial
        if (this.gasometriaArterial.date) {
            const dateKey = this.formatDateKey(this.gasometriaArterial.date);
            if (!tableData[dateKey]) tableData[dateKey] = {};

            for (const [param, value] of Object.entries(this.gasometriaArterial)) {
                if (param !== 'date' && param !== 'type' && value) {
                    const examName = `GA.${param}`;
                    tableData[dateKey][examName] = { value, date: this.gasometriaArterial.date };
                    allExams.add(examName);
                }
            }
        }

        // Simplifica tableData removendo o objeto date
        const simplifiedData = {};
        for (const [dateKey, exams] of Object.entries(tableData)) {
            simplifiedData[dateKey] = {};
            for (const [examName, examData] of Object.entries(exams)) {
                simplifiedData[dateKey][examName] = examData.value;
            }
        }

        return {
            dates: Object.keys(simplifiedData),
            exams: Array.from(allExams),
            data: simplifiedData
        };
    }

    formatDateKey(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
    }
}

// ===== INICIALIZAÇÃO DA UI =====
document.addEventListener('DOMContentLoaded', () => {
    const inputData = document.getElementById('inputData');
    const processBtn = document.getElementById('processBtn');
    const tableBtn = document.getElementById('tableBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const copyTableBtn = document.getElementById('copyTableBtn');
    const toggleOrderBtn = document.getElementById('toggleOrderBtn');
    const orderLabel = document.getElementById('orderLabel');
    const resultPlaceholder = document.getElementById('resultPlaceholder');
    const resultContent = document.getElementById('resultContent');
    const statsSection = document.getElementById('statsSection');
    const tableSection = document.getElementById('tableSection');
    const tableContainer = document.getElementById('tableContainer');
    const statTotal = document.getElementById('statTotal');
    const statDate = document.getElementById('statDate');
    const toast = document.getElementById('toast');

    const parser = new ExamParser();
    let isAscending = true; // true = antigo -> recente
    let currentTableData = null;

    // Processar exames
    processBtn.addEventListener('click', () => {
        const rawText = inputData.value.trim();

        if (!rawText) {
            showToast('Por favor, cole os dados dos exames primeiro.', 'warning');
            return;
        }

        try {
            const result = parser.parse(rawText);
            const stats = parser.getStats();

            // Atualiza a UI
            resultPlaceholder.style.display = 'none';
            resultContent.textContent = result;
            resultContent.classList.add('active');

            // Mostra estatísticas
            statsSection.style.display = 'block';
            statTotal.textContent = stats.totalExams;
            statDate.textContent = stats.mostRecentDate
                ? formatDate(stats.mostRecentDate)
                : '-';

            showToast('Exames processados com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao processar:', error);
            showToast('Erro ao processar os dados. Verifique o formato.', 'error');
        }
    });

    // Gerar tabela
    tableBtn.addEventListener('click', () => {
        const rawText = inputData.value.trim();

        if (!rawText) {
            showToast('Por favor, cole os dados dos exames primeiro.', 'warning');
            return;
        }

        try {
            // Parse se ainda não foi feito
            parser.parse(rawText);
            currentTableData = parser.getTableData();

            renderTable(currentTableData, isAscending);
            tableSection.style.display = 'block';
            showToast('Tabela gerada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao gerar tabela:', error);
            showToast('Erro ao gerar a tabela. Verifique o formato.', 'error');
        }
    });

    // Toggle ordem das datas
    toggleOrderBtn.addEventListener('click', () => {
        isAscending = !isAscending;
        orderLabel.textContent = isAscending ? 'Antigo → Recente' : 'Recente → Antigo';

        if (currentTableData) {
            renderTable(currentTableData, isAscending);
        }
    });

    // Renderiza a tabela HTML
    function renderTable(tableData, ascending) {
        const { dates, exams, data } = tableData;

        if (dates.length === 0 || exams.length === 0) {
            tableContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Nenhum dado para exibir.</p>';
            return;
        }

        // Ordena as datas
        const sortedDates = [...dates].sort((a, b) => {
            const [dayA, monthA] = a.split('/').map(Number);
            const [dayB, monthB] = b.split('/').map(Number);
            const dateA = new Date(2025, monthA - 1, dayA);
            const dateB = new Date(2025, monthB - 1, dayB);
            return ascending ? dateA - dateB : dateB - dateA;
        });

        // Ordena exames pela ordem definida nas categorias
        const examOrder = getExamOrder();
        const sortedExams = [...exams].sort((a, b) => {
            const indexA = examOrder.indexOf(a);
            const indexB = examOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        // Gera HTML da tabela
        let html = '<table class="exam-table"><thead><tr>';
        html += '<th>Exame</th>';

        for (const date of sortedDates) {
            html += `<th>${date}</th>`;
        }
        html += '</tr></thead><tbody>';

        for (const exam of sortedExams) {
            html += '<tr>';
            html += `<td>${exam}</td>`;

            for (const date of sortedDates) {
                const value = data[date]?.[exam] || '';
                html += `<td>${value}</td>`;
            }
            html += '</tr>';
        }

        html += '</tbody></table>';
        tableContainer.innerHTML = html;
    }

    // Ordem dos exames para ordenação
    function getExamOrder() {
        return [
            // Gerais - Hemograma
            'Hb', 'Ht', 'VCM', 'Leuco', 'Plaq',
            // Gerais - Bioquímica
            'Cr', 'Ur', 'Na', 'K', 'Cl', 'Ca', 'CaI', 'P', 'Mg',
            // Gasometria Venosa
            'GV.pH', 'GV.pCO2', 'GV.BIC', 'GV.LAC',
            // Gasometria Arterial
            'GA.pH', 'GA.pO2', 'GA.pCO2', 'GA.BIC', 'GA.AG', 'GA.LAC', 'GA.SO2',
            // Hepáticos
            'TGO', 'TGP', 'BT', 'BD', 'PT', 'ALB', 'FA', 'GGT', 'AMIL', 'LIP',
            // Coagulação
            'INR', 'R',
            // Metabólico
            'Glic', 'HbGlic', 'HDL', 'LDL', 'VLDL', 'ColT', 'Trig', 'TSH', 'T4L', 'B12', 'AF', 'VitD', 'PTH', 'CPK', 'Fe', 'Ferritina', 'CTLF', 'STf', 'DHL',
            // Reumato
            'PCR', 'VHS', 'FR', 'FAN', 'Anti-Ro', 'Anti-La', 'Anti-MPO', 'Anti-PR3', 'anti-dsDNA', 'anti-Sm', 'C3', 'C4', 'IFS', 'EFPS', 'Igk', 'Igl', 'RKL',
            // Trombofilias
            'Anticoagulante lúpico', 'Anticardiolipina IgG', 'Anticardiolipina IgM', 'Anti-beta-2-glicoproteína', 'Proteína C', 'Proteína S', 'Antitrombina III', 'DD', 'Fibrinogênio',
            // Sorologias
            'HepB.Anti-HBc', 'HepB.Anti-HBs', 'HepB.Ag-HBs', 'HepB.Ag-HBe', 'HepC', 'Anti-HIV', 'VDRL', 'CMV.IgG', 'CMV.IgM', 'VZV.IgG', 'VZV.IgM', 'HSV.IgG', 'HSV.IgM', 'HTLV.IgG', 'HTLV.IgM', 'TOXO.IgG', 'TOXO.IgM',
            // Níveis séricos
            'VPA', 'PHT', 'LEV', 'CBZ', 'PB', 'LTG',
            // Cardio
            'Tropo-T', 'NT-proBNP'
        ];
    }

    // Limpar
    clearBtn.addEventListener('click', () => {
        inputData.value = '';
        resultPlaceholder.style.display = 'block';
        resultContent.textContent = '';
        resultContent.classList.remove('active');
        statsSection.style.display = 'none';
        tableSection.style.display = 'none';
        tableContainer.innerHTML = '';
        currentTableData = null;
    });

    // Copiar resultado
    copyBtn.addEventListener('click', async () => {
        const text = resultContent.textContent;

        if (!text) {
            showToast('Nenhum resultado para copiar.', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            showToast('Copiado para a área de transferência!', 'success');
        } catch (error) {
            fallbackCopy(text);
        }
    });

    // Copiar tabela
    copyTableBtn.addEventListener('click', async () => {
        const table = tableContainer.querySelector('table');

        if (!table) {
            showToast('Nenhuma tabela para copiar.', 'warning');
            return;
        }

        // Cria texto tabulado para colar em Excel/Sheets
        let text = '';
        const rows = table.querySelectorAll('tr');

        for (const row of rows) {
            const cells = row.querySelectorAll('th, td');
            const rowData = [];
            for (const cell of cells) {
                rowData.push(cell.textContent);
            }
            text += rowData.join('\t') + '\n';
        }

        try {
            await navigator.clipboard.writeText(text);
            showToast('Tabela copiada! Cole em Excel ou Google Sheets.', 'success');
        } catch (error) {
            fallbackCopy(text);
        }
    });

    // Fallback para copiar
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copiado para a área de transferência!', 'success');
    }

    // Função para mostrar toast
    function showToast(message, type = 'success') {
        toast.querySelector('.toast-message').textContent = message;
        toast.querySelector('.toast-icon').textContent = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌';
        toast.style.background = type === 'success' ? 'var(--success-color)' : type === 'warning' ? 'var(--warning-color)' : 'var(--danger-color)';
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Função para formatar data
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hour}:${minute}`;
    }
});
